"""
agents/config.py
Configuration for the AI agent module.
Reads XAI_API_KEY from the root .env file using python-dotenv.
The API key is NEVER logged, printed, or exposed in responses.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load the root .env (two levels up from this file: agents/ → project root)
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

# ──────────────────────────────────────────────────────────
# xAI / Grok settings
# ──────────────────────────────────────────────────────────

XAI_API_KEY: str = os.environ.get("XAI_API_KEY", "")
XAI_BASE_URL: str = "https://api.x.ai/v1"
XAI_MODEL: str = "grok-4-5"          # model identifier for the xAI API

# ──────────────────────────────────────────────────────────
# Backend base URL
# ──────────────────────────────────────────────────────────

BACKEND_BASE_URL: str = "http://127.0.0.1:8000"

# HTTP timeouts (seconds)
HTTP_CONNECT_TIMEOUT: float = 5.0
HTTP_READ_TIMEOUT: float = 30.0
