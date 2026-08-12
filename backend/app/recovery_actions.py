from app.state import app_state
from app.logger import logger


# ==================================================
# RESTART BACKEND
# ==================================================

def restart_backend():
    """
    Recover from backend failure: set status back to online.
    """

    app_state.backend_status = "online"

    logger.info(
        "Backend restarted",
        extra={
            "service": "backend",
            "event": "backend_recovered"
        }
    )

    return {
        "success": True,
        "message": "Backend restarted",
        "backend_status": app_state.backend_status
    }


# ==================================================
# RESTORE DATABASE
# ==================================================

def restore_database():
    """
    Recover from database failure: set status back to connected.
    """

    app_state.database_status = "connected"

    logger.info(
        "Database restored",
        extra={
            "service": "database",
            "event": "database_recovered"
        }
    )

    return {
        "success": True,
        "message": "Database restored",
        "database_status": app_state.database_status
    }


# ==================================================
# STOP CPU TEST
# ==================================================

def stop_cpu_test():
    """
    Stop the CPU stress test background thread.
    """

    from app.simulator import _cpu_stop_event

    _cpu_stop_event.set()

    app_state.cpu_test_active = False

    logger.info(
        "CPU stress test stopped",
        extra={
            "service": "simulator",
            "event": "cpu_test_stopped"
        }
    )

    return {
        "success": True,
        "message": "CPU stress test stopped",
        "cpu_test_active": False
    }


# ==================================================
# STOP MEMORY TEST
# ==================================================

def stop_memory_test():
    """
    Release the memory allocation and stop the memory stress test.
    """

    import app.simulator as sim_module

    sim_module._memory_allocation = None

    app_state.memory_test_active = False

    logger.info(
        "Memory stress test stopped",
        extra={
            "service": "simulator",
            "event": "memory_test_stopped"
        }
    )

    return {
        "success": True,
        "message": "Memory stress test stopped",
        "memory_test_active": False
    }


# ==================================================
# REMOVE API DELAY
# ==================================================

def remove_api_delay():
    """
    Remove the artificial API delay.
    """

    app_state.api_delay_ms = 0

    logger.info(
        "API delay removed",
        extra={
            "service": "api",
            "event": "api_delay_removed"
        }
    )

    return {
        "success": True,
        "message": "API delay removed",
        "api_delay_ms": 0
    }


# ==================================================
# RESTART WORKER
# ==================================================

def restart_worker():
    """
    Restart the ShopFlow worker using the existing worker.restart().
    """

    from app.worker import worker
    worker.restart()

    # worker.restart() → worker.start() → sets app_state.worker_status = "running"

    logger.info(
        "Worker restarted",
        extra={
            "service": "worker",
            "event": "worker_restarted"
        }
    )

    return {
        "success": True,
        "message": "Worker restarted",
        "worker_status": app_state.worker_status
    }
