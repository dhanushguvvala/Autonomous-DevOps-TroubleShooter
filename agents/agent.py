"""
agents/agent.py
Core orchestration logic: OBSERVE → DIAGNOSE → RECOVER → VERIFY.
This is the single autonomous agent.
"""

from __future__ import annotations
import logging
from typing import Any, Dict

from agents import backend_client
from agents.diagnosis import detect_incident, enrich_with_llm
from agents.recovery import execute_recovery
from agents.schemas import TroubleshootResponse

logger = logging.getLogger(__name__)


async def run_troubleshoot() -> TroubleshootResponse:
    """
    Execute the full OBSERVE → DIAGNOSE → RECOVER → VERIFY cycle.

    1. Observe  — fetch /health, /metrics, /logs
    2. Diagnose — deterministic detection + LLM enrichment
    3. Recover  — execute the allowlisted recovery action (if needed)
    4. Verify   — fetch /verify

    Returns a TroubleshootResponse regardless of what happens.
    """

    # ──────────────────────────────────────────────────────
    # PHASE 1: OBSERVE
    # ──────────────────────────────────────────────────────

    logger.info("[AGENT] Phase 1 — OBSERVE")

    health: Dict[str, Any] = {}
    metrics: Dict[str, Any] = {}
    logs: Dict[str, Any] = {}

    try:
        health = await backend_client.get_health()
        logger.info("[AGENT] /health fetched: status=%s", health.get("status"))
    except Exception as exc:  # noqa: BLE001
        logger.error("[AGENT] Failed to fetch /health: %s", exc)

    try:
        metrics = await backend_client.get_metrics()
        logger.info(
            "[AGENT] /metrics fetched: cpu=%.1f%% mem=%.1f%%",
            metrics.get("cpu_percent", 0),
            metrics.get("memory_percent", 0),
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("[AGENT] Failed to fetch /metrics: %s", exc)

    try:
        logs = await backend_client.get_logs()
        log_count = len(logs.get("logs", []))
        logger.info("[AGENT] /logs fetched: %d lines", log_count)
    except Exception as exc:  # noqa: BLE001
        logger.error("[AGENT] Failed to fetch /logs: %s", exc)

    # ──────────────────────────────────────────────────────
    # PHASE 2: DIAGNOSE
    # ──────────────────────────────────────────────────────

    logger.info("[AGENT] Phase 2 — DIAGNOSE")

    incident_name, deterministic_action, evidence = detect_incident(health, metrics)
    logger.info(
        "[AGENT] Deterministic detection: incident=%s action=%s",
        incident_name,
        deterministic_action,
    )

    diagnosis = await enrich_with_llm(
        incident_name=incident_name,
        deterministic_action=deterministic_action,
        health=health,
        metrics=metrics,
        logs=logs,
    )
    logger.info(
        "[AGENT] LLM diagnosis: incident=%s severity=%s action=%s",
        diagnosis.incident,
        diagnosis.severity,
        diagnosis.recommended_action,
    )

    # Merge deterministic evidence with LLM evidence (deduplicated)
    all_evidence = list(dict.fromkeys(evidence + (diagnosis.evidence or [])))
    diagnosis.evidence = all_evidence

    # ──────────────────────────────────────────────────────
    # PHASE 3: RECOVER
    # ──────────────────────────────────────────────────────

    logger.info("[AGENT] Phase 3 — RECOVER")

    action_taken = False
    recovery_status = "not_required"

    if incident_name:
        # The deterministic action is the authoritative action; the LLM may
        # agree or disagree — the allowlist guard in execute_recovery handles safety.
        final_action = diagnosis.recommended_action or deterministic_action
        action_taken, recovery_status = await execute_recovery(final_action)
        logger.info(
            "[AGENT] Recovery: action=%s taken=%s status=%s",
            final_action,
            action_taken,
            recovery_status,
        )
    else:
        logger.info("[AGENT] No incident detected — skipping recovery")

    # ──────────────────────────────────────────────────────
    # PHASE 4: VERIFY
    # ──────────────────────────────────────────────────────

    logger.info("[AGENT] Phase 4 — VERIFY")

    verify: Dict[str, Any] = {}
    verified = False

    try:
        verify = await backend_client.get_verify()
        verified = bool(verify.get("verified", False))
        logger.info("[AGENT] /verify fetched: verified=%s", verified)
    except Exception as exc:  # noqa: BLE001
        logger.error("[AGENT] Failed to fetch /verify: %s", exc)

    # ──────────────────────────────────────────────────────
    # Build and return the structured response
    # ──────────────────────────────────────────────────────

    if not incident_name:
        return TroubleshootResponse(
            incident="No active incident",
            severity="LOW",
            root_cause="All monitored services are healthy",
            evidence=[],
            recommended_action=None,
            action_taken=False,
            recovery_status="not_required",
            verified=verified,
            health=health,
            metrics=metrics,
            verify=verify,
        )

    return TroubleshootResponse(
        incident=diagnosis.incident,
        severity=diagnosis.severity,
        root_cause=diagnosis.root_cause,
        evidence=diagnosis.evidence,
        recommended_action=diagnosis.recommended_action or deterministic_action,
        action_taken=action_taken,
        recovery_status=recovery_status,
        verified=verified,
        health=health,
        metrics=metrics,
        verify=verify,
    )
