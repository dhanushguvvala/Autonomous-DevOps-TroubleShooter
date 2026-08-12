"""
agents/recovery.py
Safe recovery dispatcher.

ONLY the six allowlisted recovery actions may be executed.
Any attempt to execute an unlisted action is silently blocked.
"""

from __future__ import annotations
import logging
from typing import Any, Dict, Optional, Tuple

from agents import backend_client
from agents.diagnosis import RECOVERY_ALLOWLIST

logger = logging.getLogger(__name__)


# Maps each allowlisted key to the corresponding async backend client function
_RECOVERY_DISPATCH: Dict[str, Any] = {
    "restart_backend": backend_client.restart_backend,
    "restore_database": backend_client.restore_database,
    "stop_cpu_test": backend_client.stop_cpu_test,
    "stop_memory_test": backend_client.stop_memory_test,
    "remove_api_delay": backend_client.remove_api_delay,
    "restart_worker": backend_client.restart_worker,
}


async def execute_recovery(action: Optional[str]) -> Tuple[bool, str]:
    """
    Execute the recovery action if it is on the allowlist.

    Returns:
        (action_taken: bool, recovery_status: str)
        recovery_status ∈ {"successful", "failed", "not_required", "blocked"}
    """
    if not action:
        return False, "not_required"

    if action not in RECOVERY_ALLOWLIST:
        logger.error(
            "BLOCKED: recovery action '%s' is not on the allowlist. No action taken.",
            action,
        )
        return False, "blocked"

    fn = _RECOVERY_DISPATCH[action]

    try:
        result = await fn()
        success = result.get("success", False)
        if success:
            logger.info("Recovery action '%s' executed successfully", action)
            return True, "successful"
        else:
            logger.warning("Recovery action '%s' returned success=False: %s", action, result)
            return True, "failed"
    except Exception as exc:  # noqa: BLE001
        logger.error("Recovery action '%s' raised an exception: %s", action, exc)
        return False, "failed"
