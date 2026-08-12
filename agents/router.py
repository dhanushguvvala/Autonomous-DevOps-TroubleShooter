"""
agents/router.py
FastAPI router that exposes POST /agent/troubleshoot.
This file is the ONLY integration point with the existing backend app.
It adds exactly one endpoint and does not modify any existing backend logic.
"""

from __future__ import annotations
import logging

from fastapi import APIRouter, HTTPException

from agents.schemas import TroubleshootRequest, TroubleshootResponse
from agents.agent import run_troubleshoot

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["AI Agent"])


@router.post(
    "/troubleshoot",
    response_model=TroubleshootResponse,
    summary="Autonomous DevOps troubleshooting agent",
    description=(
        "Triggers the full OBSERVE → DIAGNOSE → RECOVER → VERIFY cycle. "
        "The agent reads /health, /metrics, and /logs, produces an AI-assisted "
        "diagnosis via Grok (xAI), executes only the appropriate predefined "
        "recovery action, and returns a structured JSON result."
    ),
)
async def troubleshoot(request: TroubleshootRequest) -> TroubleshootResponse:
    """
    POST /agent/troubleshoot

    Request body:
        { "message": "Check the system and fix any active incident" }

    Returns a TroubleshootResponse with full diagnosis, recovery status,
    and verification result.
    """
    logger.info("[AGENT] Troubleshoot triggered: message=%r", request.message)

    try:
        result = await run_troubleshoot()
        return result
    except Exception as exc:  # noqa: BLE001
        logger.error("[AGENT] Unhandled error during troubleshoot: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Agent encountered an unexpected error: {exc}",
        ) from exc
