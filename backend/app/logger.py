import json
import logging
from datetime import datetime, timezone
from pathlib import Path


# Location of the log file
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "app.log"


class JsonFormatter(logging.Formatter):
    """
    Converts normal Python log records into JSON objects.
    """

    def format(self, record):
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": getattr(record, "service", "shopflow"),
            "event": getattr(record, "event", "application_event"),
            "message": record.getMessage()
        }

        return json.dumps(log_data)


logger = logging.getLogger("shopflow")
logger.setLevel(logging.INFO)

# Prevent duplicate handlers during FastAPI reloads
if not logger.handlers:
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(JsonFormatter())

    logger.addHandler(file_handler)