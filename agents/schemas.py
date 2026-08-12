"""
agents/schemas.py
Pydantic models for the agent's request/response cycle.
"""

from __future__ import annotations
from typing import Any, List, Optional
from pydantic import BaseModel, Field


# ──────────────────────────────────────────────────────────
# Inbound request
# ──────────────────────────────────────────────────────────

class TroubleshootRequest(BaseModel):
    message: str = Field(
        ...,
        description="Natural-language instruction for the agent",
        examples=["Check the system and fix any active incident"],
    )


# ──────────────────────────────────────────────────────────
# Internal diagnosis result produced by the LLM reasoning step
# ──────────────────────────────────────────────────────────

class DiagnosisResult(BaseModel):
    incident: str = Field(..., description="Human-readable incident label")
    severity: str = Field(..., description="LOW | MEDIUM | HIGH | CRITICAL")
    root_cause: str = Field(..., description="Plain-English root cause explanation")
    evidence: List[str] = Field(default_factory=list, description="Evidence items")
    recommended_action: Optional[str] = Field(
        None,
        description=(
            "One of the allowed recovery keys: "
            "restart_backend | restore_database | stop_cpu_test | "
            "stop_memory_test | remove_api_delay | restart_worker | null"
        ),
    )


# ──────────────────────────────────────────────────────────
# Final structured response returned to the caller
# ──────────────────────────────────────────────────────────

class TroubleshootResponse(BaseModel):
    incident: str
    severity: str
    root_cause: str
    evidence: List[str]
    recommended_action: Optional[str]
    action_taken: bool
    recovery_status: str          # "successful" | "failed" | "not_required"
    verified: bool

    # Optional raw data sections (useful for debugging / frontends)
    health: Optional[Any] = None
    metrics: Optional[Any] = None
    verify: Optional[Any] = None
