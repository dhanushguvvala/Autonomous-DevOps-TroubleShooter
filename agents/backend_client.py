"""
agents/backend_client.py
Async HTTP client that wraps every backend API the agent needs.
Uses httpx with sensible timeouts.  All errors are surfaced as
BackendClientError so the agent can react gracefully.
"""

from __future__ import annotations
from typing import Any, Dict

import httpx

from agents.config import (
    BACKEND_BASE_URL,
    HTTP_CONNECT_TIMEOUT,
    HTTP_READ_TIMEOUT,
)


class BackendClientError(Exception):
    """Raised when a backend call fails."""


def _timeout() -> httpx.Timeout:
    return httpx.Timeout(
        connect=HTTP_CONNECT_TIMEOUT,
        read=HTTP_READ_TIMEOUT,
        write=HTTP_CONNECT_TIMEOUT,
        pool=HTTP_CONNECT_TIMEOUT,
    )


async def _get(path: str) -> Dict[str, Any]:
    url = f"{BACKEND_BASE_URL}{path}"
    try:
        async with httpx.AsyncClient(timeout=_timeout()) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as exc:
        raise BackendClientError(
            f"GET {path} returned HTTP {exc.response.status_code}"
        ) from exc
    except httpx.RequestError as exc:
        raise BackendClientError(f"GET {path} failed: {exc}") from exc


async def _post(path: str) -> Dict[str, Any]:
    url = f"{BACKEND_BASE_URL}{path}"
    try:
        async with httpx.AsyncClient(timeout=_timeout()) as client:
            resp = await client.post(url)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as exc:
        raise BackendClientError(
            f"POST {path} returned HTTP {exc.response.status_code}"
        ) from exc
    except httpx.RequestError as exc:
        raise BackendClientError(f"POST {path} failed: {exc}") from exc


# ──────────────────────────────────────────────────────────
# OBSERVATION endpoints
# ──────────────────────────────────────────────────────────

async def get_health() -> Dict[str, Any]:
    """GET /health — returns service statuses and simulator flags."""
    return await _get("/health")


async def get_metrics() -> Dict[str, Any]:
    """GET /metrics — returns CPU, memory, disk, latency, and simulator flags."""
    return await _get("/metrics")


async def get_logs() -> Dict[str, Any]:
    """GET /logs — returns recent structured log lines."""
    return await _get("/logs")


async def get_verify() -> Dict[str, Any]:
    """GET /verify — returns verified=true only when everything is healthy."""
    return await _get("/verify")


# ──────────────────────────────────────────────────────────
# RECOVERY endpoints  (allowlist — no other POST is permitted)
# ──────────────────────────────────────────────────────────

async def restart_backend() -> Dict[str, Any]:
    """POST /recover/restart_backend"""
    return await _post("/recover/restart_backend")


async def restore_database() -> Dict[str, Any]:
    """POST /recover/restore_database"""
    return await _post("/recover/restore_database")


async def stop_cpu_test() -> Dict[str, Any]:
    """POST /recover/stop_cpu_test"""
    return await _post("/recover/stop_cpu_test")


async def stop_memory_test() -> Dict[str, Any]:
    """POST /recover/stop_memory_test"""
    return await _post("/recover/stop_memory_test")


async def remove_api_delay() -> Dict[str, Any]:
    """POST /recover/remove_api_delay"""
    return await _post("/recover/remove_api_delay")


async def restart_worker() -> Dict[str, Any]:
    """POST /recover/restart_worker"""
    return await _post("/recover/restart_worker")
