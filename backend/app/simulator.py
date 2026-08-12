import threading

from app.state import app_state
from app.logger import logger


# ==================================================
# MODULE-LEVEL STATE FOR SAFE BOUNDED SIMULATIONS
# ==================================================

# CPU stress: stop event for the background thread
_cpu_stop_event = threading.Event()
_cpu_thread = None

# Memory stress: holds the allocated bytes so they stay in memory
_memory_allocation = None


# ==================================================
# BACKEND FAILURE
# ==================================================

def simulate_backend_failure():
    """
    Simulate a backend failure (controlled state change only).
    """

    app_state.backend_status = "down"

    logger.error(
        "Backend failure simulated",
        extra={
            "service": "backend",
            "event": "backend_failure_simulated"
        }
    )

    return {
        "success": True,
        "message": "Backend failure simulated",
        "backend_status": app_state.backend_status
    }


def reset_backend():
    """
    Restore the backend (legacy alias kept for compatibility).
    """

    app_state.backend_status = "online"

    logger.info(
        "Backend restored",
        extra={
            "service": "backend",
            "event": "backend_recovered"
        }
    )

    return {
        "success": True,
        "message": "Backend restored",
        "backend_status": app_state.backend_status
    }


# ==================================================
# DATABASE FAILURE
# ==================================================

def simulate_database_failure():
    """
    Simulate a database connection failure (controlled state change only).
    """

    app_state.database_status = "disconnected"

    logger.error(
        "Database failure simulated",
        extra={
            "service": "database",
            "event": "database_failure_simulated"
        }
    )

    return {
        "success": True,
        "message": "Database failure simulated",
        "database_status": app_state.database_status
    }


def restore_database():
    """
    Restore the database connection (legacy alias kept for compatibility).
    """

    app_state.database_status = "connected"

    logger.info(
        "Database connection restored",
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
# HIGH CPU SIMULATION
# ==================================================

def _cpu_workload(stop_event: threading.Event):
    """
    Safe bounded CPU workload.
    Burns CPU in short bursts with sleep gaps so it remains controllable
    and stoppable. Never runs as an infinite unguarded loop.
    """
    while not stop_event.is_set():
        # Burn CPU for ~50ms
        end = __import__("time").time() + 0.05
        while __import__("time").time() < end:
            _ = sum(i * i for i in range(500))
        # Rest for ~50ms — keeps load elevated but bounded
        stop_event.wait(0.05)


def simulate_high_cpu():
    """
    Start a safe daemon background thread that exercises the CPU.
    Repeated calls return a safe already-running message.
    """

    global _cpu_thread, _cpu_stop_event

    if app_state.cpu_test_active and _cpu_thread and _cpu_thread.is_alive():
        return {
            "success": True,
            "message": "CPU stress test is already running",
            "cpu_test_active": True
        }

    _cpu_stop_event.clear()

    _cpu_thread = threading.Thread(
        target=_cpu_workload,
        args=(_cpu_stop_event,),
        name="cpu-stress-worker",
        daemon=True
    )
    _cpu_thread.start()

    app_state.cpu_test_active = True

    logger.warning(
        "CPU stress test started",
        extra={
            "service": "simulator",
            "event": "cpu_test_started"
        }
    )

    return {
        "success": True,
        "message": "CPU stress test started",
        "cpu_test_active": True
    }


# ==================================================
# HIGH MEMORY SIMULATION
# ==================================================

def simulate_high_memory():
    """
    Allocate a small, bounded block of memory (100 MB) to simulate
    high memory usage. Safe for a normal development laptop.
    Repeated calls return a safe already-running message.
    """

    global _memory_allocation

    if app_state.memory_test_active and _memory_allocation is not None:
        return {
            "success": True,
            "message": "Memory stress test is already running",
            "memory_test_active": True
        }

    # Allocate exactly 100 MB — bounded and safe
    _memory_allocation = bytearray(100 * 1024 * 1024)

    app_state.memory_test_active = True

    logger.warning(
        "Memory stress test started (100 MB allocated)",
        extra={
            "service": "simulator",
            "event": "memory_test_started"
        }
    )

    return {
        "success": True,
        "message": "Memory stress test started",
        "memory_test_active": True
    }


# ==================================================
# SLOW API SIMULATION
# ==================================================

def simulate_slow_api():
    """
    Set an artificial 3-second delay that will be applied to
    ShopFlow business endpoints (/products, /orders).
    Does NOT affect /health, /metrics, /recover/*, /simulate/*, /verify.
    """

    app_state.api_delay_ms = 3000

    logger.warning(
        "API delay enabled (3000 ms)",
        extra={
            "service": "api",
            "event": "api_delay_enabled"
        }
    )

    return {
        "success": True,
        "message": "API delay enabled",
        "api_delay_ms": app_state.api_delay_ms
    }


# ==================================================
# WORKER FAILURE
# ==================================================

def simulate_worker_failure():
    """
    Call the existing worker.fail() to simulate a worker crash.
    """

    from app.worker import worker
    worker.fail()

    # worker.fail() already sets app_state.worker_status = "failed"

    logger.error(
        "Worker failure simulated",
        extra={
            "service": "worker",
            "event": "worker_failure_simulated"
        }
    )

    return {
        "success": True,
        "message": "Worker failure simulated",
        "worker_status": app_state.worker_status
    }