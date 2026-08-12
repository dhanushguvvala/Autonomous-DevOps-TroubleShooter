from app.state import app_state


def verify_system():
    """
    Check whether every service is in its healthy/recovered state.

    verified = True only when ALL of the following hold:
      - backend_status  == "online"
      - database_status == "connected"
      - worker_status   == "running"
      - cpu_test_active == False
      - memory_test_active == False
      - api_delay_ms    == 0
    """

    services_ok = (
        app_state.backend_status == "online"
        and app_state.database_status == "connected"
        and app_state.worker_status == "running"
    )

    tests_ok = (
        not app_state.cpu_test_active
        and not app_state.memory_test_active
        and app_state.api_delay_ms == 0
    )

    verified = services_ok and tests_ok

    return {
        "verified": verified,
        "services": {
            "backend": app_state.backend_status,
            "database": app_state.database_status,
            "worker": app_state.worker_status
        },
        "tests": {
            "cpu": app_state.cpu_test_active,
            "memory": app_state.memory_test_active,
            "api_delay_ms": app_state.api_delay_ms
        }
    }
