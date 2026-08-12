"""
agents/diagnosis.py
Deterministic + LLM-assisted diagnosis layer.

Deterministic pre-check
  → identifies active incidents directly from backend state data

LLM enrichment (Grok via xAI)
  → produces human-readable diagnosis, root cause, and severity

Safety guard
  → validates any LLM-suggested recovery action against the allowlist
  → falls back to deterministic action if LLM suggests something invalid
"""

from __future__ import annotations
import json
import logging
from typing import Any, Dict, List, Optional, Tuple

from openai import AsyncOpenAI

from agents.config import XAI_API_KEY, XAI_BASE_URL, XAI_MODEL
from agents.schemas import DiagnosisResult

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────
# ALLOWLIST — the ONLY recovery actions the agent may execute
# ──────────────────────────────────────────────────────────

RECOVERY_ALLOWLIST: Dict[str, str] = {
    "restart_backend": "POST /recover/restart_backend",
    "restore_database": "POST /recover/restore_database",
    "stop_cpu_test": "POST /recover/stop_cpu_test",
    "stop_memory_test": "POST /recover/stop_memory_test",
    "remove_api_delay": "POST /recover/remove_api_delay",
    "restart_worker": "POST /recover/restart_worker",
}


# ──────────────────────────────────────────────────────────
# DETERMINISTIC INCIDENT DETECTION
# Returns (incident_name, recovery_action, evidence_list)
# ──────────────────────────────────────────────────────────

def detect_incident(
    health: Dict[str, Any],
    metrics: Dict[str, Any],
) -> Tuple[Optional[str], Optional[str], List[str]]:
    """
    Pure deterministic check — no LLM involved.
    Priority order matches the six supported incident types.
    Returns the FIRST detected incident only.
    """
    evidence: List[str] = []

    # --- Backend failure ---
    services = health.get("services", {})
    if services.get("backend") == "down":
        evidence.append("backend status is 'down'")
        evidence.append(f"health status is '{health.get('status', 'unknown')}'")
        return "Backend Failure", "restart_backend", evidence

    # --- Database failure ---
    if services.get("database") == "disconnected":
        evidence.append("database status is 'disconnected'")
        evidence.append(f"health status is '{health.get('status', 'unknown')}'")
        return "Database Failure", "restore_database", evidence

    # --- High CPU ---
    simulators = health.get("simulators", {})
    if simulators.get("cpu_test_active") is True:
        cpu_pct = metrics.get("cpu_percent", "unknown")
        evidence.append("cpu_test_active is True")
        evidence.append(f"cpu_percent is {cpu_pct}%")
        return "High CPU", "stop_cpu_test", evidence

    # --- High Memory ---
    if simulators.get("memory_test_active") is True:
        mem_pct = metrics.get("memory_percent", "unknown")
        evidence.append("memory_test_active is True")
        evidence.append(f"memory_percent is {mem_pct}%")
        return "High Memory", "stop_memory_test", evidence

    # --- Slow API ---
    if simulators.get("api_delay_ms", 0) > 0:
        delay = simulators["api_delay_ms"]
        evidence.append(f"api_delay_ms is {delay}ms")
        evidence.append("artificial API delay is active on business endpoints")
        return "Slow API", "remove_api_delay", evidence

    # --- Worker failure ---
    if services.get("worker") == "failed":
        evidence.append("worker status is 'failed'")
        evidence.append(f"health status is '{health.get('status', 'unknown')}'")
        return "Worker Failure", "restart_worker", evidence

    return None, None, []


# ──────────────────────────────────────────────────────────
# LLM ENRICHMENT via xAI / Grok
# ──────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are an autonomous DevOps troubleshooting AI.

You will receive the current state of a backend system (health, metrics, recent logs)
and the name of the incident that has been deterministically detected.

Your job is to:
1. Produce a clear, concise root_cause explanation (1-3 sentences).
2. Assign a severity: LOW, MEDIUM, HIGH, or CRITICAL.
3. List 2-4 evidence items (short strings, factual).
4. Return EXACTLY ONE of these allowed recovery action keys (or null if no incident):
   - restart_backend
   - restore_database
   - stop_cpu_test
   - stop_memory_test
   - remove_api_delay
   - restart_worker

STRICT RULES — VIOLATIONS ARE NOT ALLOWED:
- Do NOT suggest shell commands, Python code, or any arbitrary action.
- Do NOT invent new endpoints or URLs.
- Do NOT modify files, restart arbitrary processes, or delete data.
- The only allowed recovery keys are the six listed above.
- Your response MUST be valid JSON only — no markdown, no prose outside JSON.

Response format:
{
  "incident": "<incident name>",
  "severity": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "root_cause": "<concise explanation>",
  "evidence": ["<item1>", "<item2>"],
  "recommended_action": "<key or null>"
}
"""


async def enrich_with_llm(
    incident_name: Optional[str],
    deterministic_action: Optional[str],
    health: Dict[str, Any],
    metrics: Dict[str, Any],
    logs: Dict[str, Any],
) -> DiagnosisResult:
    """
    Call Grok to produce a human-readable diagnosis.
    Always validates the returned action against the allowlist.
    Falls back to the deterministic action if LLM returns an invalid key.
    """
    if not XAI_API_KEY:
        logger.warning("XAI_API_KEY not set — using deterministic fallback diagnosis")
        return _fallback_diagnosis(incident_name, deterministic_action, health)

    # Build the user message — strip raw log content to keep prompt concise
    log_lines = logs.get("logs", [])
    recent_logs = log_lines[-20:] if log_lines else []

    user_content = json.dumps(
        {
            "detected_incident": incident_name or "No incident detected",
            "health": health,
            "metrics": {
                k: v
                for k, v in metrics.items()
                if k in ("cpu_percent", "memory_percent", "api_latency_ms", "services", "simulators")
            },
            "recent_logs": recent_logs,
        },
        default=str,
    )

    try:
        client = AsyncOpenAI(api_key=XAI_API_KEY, base_url=XAI_BASE_URL)

        response = await client.chat.completions.create(
            model=XAI_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0,
            max_tokens=512,
        )

        raw = response.choices[0].message.content or ""
        data = _parse_llm_json(raw)

        # ── Safety guard: validate the recommended_action ──
        llm_action = data.get("recommended_action")
        if llm_action and llm_action not in RECOVERY_ALLOWLIST:
            logger.warning(
                "LLM returned disallowed action '%s' — reverting to deterministic '%s'",
                llm_action,
                deterministic_action,
            )
            data["recommended_action"] = deterministic_action

        return DiagnosisResult(
            incident=data.get("incident") or incident_name or "Unknown",
            severity=data.get("severity", "HIGH"),
            root_cause=data.get("root_cause", "See evidence for details"),
            evidence=data.get("evidence", []),
            recommended_action=data.get("recommended_action") or deterministic_action,
        )

    except Exception as exc:  # noqa: BLE001
        logger.error("LLM call failed: %s — using deterministic fallback", exc)
        return _fallback_diagnosis(incident_name, deterministic_action, health)


# ──────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────

def _parse_llm_json(raw: str) -> Dict[str, Any]:
    """Extract the JSON object from a raw LLM response string."""
    raw = raw.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        lines = raw.splitlines()
        raw = "\n".join(
            line for line in lines if not line.startswith("```")
        ).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.error("Could not parse LLM JSON response: %s", raw[:200])
        return {}


def _fallback_diagnosis(
    incident_name: Optional[str],
    deterministic_action: Optional[str],
    health: Dict[str, Any],
) -> DiagnosisResult:
    """Return a basic deterministic diagnosis when the LLM is unavailable."""
    if not incident_name:
        return DiagnosisResult(
            incident="No active incident",
            severity="LOW",
            root_cause="All monitored services are healthy",
            evidence=[],
            recommended_action=None,
        )

    _SEVERITY_MAP = {
        "Backend Failure": "HIGH",
        "Database Failure": "HIGH",
        "High CPU": "MEDIUM",
        "High Memory": "MEDIUM",
        "Slow API": "MEDIUM",
        "Worker Failure": "HIGH",
    }

    return DiagnosisResult(
        incident=incident_name,
        severity=_SEVERITY_MAP.get(incident_name, "HIGH"),
        root_cause=f"{incident_name} detected via state inspection",
        evidence=[f"health status: {health.get('status', 'unknown')}"],
        recommended_action=deterministic_action,
    )
