import psutil

from app.state import app_state


def get_system_metrics():
    """
    Collect the current system and ShopFlow metrics.
    Includes simulator flags so the frontend/monitoring layer
    can display the full picture.
    """

    cpu_percent = psutil.cpu_percent(interval=0.5)
    memory_percent = psutil.virtual_memory().percent
    disk_percent = psutil.disk_usage("/").percent

    return {
        "cpu_percent": cpu_percent,
        "memory_percent": memory_percent,
        "disk_percent": disk_percent,
        "api_latency_ms": app_state.api_delay_ms,
        "services": {
            "backend": app_state.backend_status,
            "database": app_state.database_status,
            "worker": app_state.worker_status
        },
        "simulators": {
            "cpu_test_active": app_state.cpu_test_active,
            "memory_test_active": app_state.memory_test_active,
            "api_delay_ms": app_state.api_delay_ms
        }
    }