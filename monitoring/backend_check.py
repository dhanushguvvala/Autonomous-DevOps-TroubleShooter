import json
import time
import uuid
from datetime import datetime
from urllib.request import urlopen
from urllib.error import HTTPError, URLError


BACKEND_HEALTH_URL = "http://127.0.0.1:8000/health"
REQUEST_TIMEOUT = 3
SLOW_API_THRESHOLD_MS = 2000


def check_backend_health():
    start_time = time.perf_counter()

    try:
        response = urlopen(
            BACKEND_HEALTH_URL,
            timeout=REQUEST_TIMEOUT
        )

        latency_ms = round(
            (time.perf_counter() - start_time) * 1000,
            2
        )

        status_code = response.status

        body = response.read().decode("utf-8")
        health_data = json.loads(body)

        # Handle artificial delay from backend simulators to simulate slow API
        simulators = health_data.get("simulators", {}) if isinstance(health_data, dict) else {}
        api_delay_ms = simulators.get("api_delay_ms", 0)
        if api_delay_ms > 0:
            time.sleep(api_delay_ms / 1000)
            latency_ms = round(latency_ms + api_delay_ms, 2)

        if status_code != 200:
            return {
                "healthy": False,
                "status_code": status_code,
                "latency_ms": latency_ms,
                "health_data": health_data,
                "error": f"Backend returned HTTP {status_code}"
            }

        if latency_ms > SLOW_API_THRESHOLD_MS:
            return {
                "healthy": True,
                "slow": True,
                "status_code": status_code,
                "latency_ms": latency_ms,
                "health_data": health_data,
                "error": "API response time exceeded threshold"
            }

        return {
            "healthy": True,
            "slow": False,
            "status_code": status_code,
            "latency_ms": latency_ms,
            "health_data": health_data,
            "error": None
        }

    except HTTPError as e:
        latency_ms = round(
            (time.perf_counter() - start_time) * 1000,
            2
        )

        return {
            "healthy": False,
            "status_code": e.code,
            "latency_ms": latency_ms,
            "health_data": None,
            "error": f"HTTP error: {e.code}"
        }

    except (URLError, TimeoutError, OSError) as e:
        latency_ms = round(
            (time.perf_counter() - start_time) * 1000,
            2
        )

        return {
            "healthy": False,
            "status_code": None,
            "latency_ms": latency_ms,
            "health_data": None,
            "error": f"Backend unavailable: {e}"
        }


if __name__ == "__main__":
    result = check_backend_health()

    print("\n========== BACKEND MONITOR ==========")
    print(f"Healthy    : {result['healthy']}")
    print(f"Status Code: {result['status_code']}")
    print(f"Latency    : {result['latency_ms']} ms")
    print(f"Error      : {result['error']}")
    print(f"Health Data: {result['health_data']}")
    print("=====================================\n")

def create_backend_incident(
    incident_type,
    severity,
    description,
    status_code=None,
    latency_ms=None
):
    incident = {
        "incident_id": f"INC-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.now().isoformat(),
        "type": incident_type,
        "severity": severity,
        "source": "monitoring",
        "description": description,
        "metrics": {
            "latency_ms": latency_ms,
            "status_code": status_code
        },
        "evidence": [
            description
        ],
        "status": "detected"
    }

    return incident    