import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from app.state import app_state
from app.metrics import get_system_metrics
from app.logger import logger, LOG_FILE
from app.shopflow import get_products, get_product, get_orders
from app.worker import worker

# --- Failure simulators ---
from app.simulator import (
    simulate_backend_failure,
    simulate_database_failure,
    simulate_high_cpu,
    simulate_high_memory,
    simulate_slow_api,
    simulate_worker_failure,
    # Legacy aliases
    reset_backend,
    restore_database as simulator_restore_database,
)

# --- Recovery actions ---
from app.recovery_actions import (
    restart_backend,
    restore_database,
    stop_cpu_test,
    stop_memory_test,
    remove_api_delay,
    restart_worker,
)

# --- Verification ---
from app.verification import verify_system


# ==================================================
# BUSINESS ROUTES THAT HONOUR THE ARTIFICIAL DELAY
# Delay is applied only to these path prefixes.
# ==================================================

_DELAYED_PREFIXES = ("/products", "/orders")


# ==================================================
# APPLICATION LIFESPAN
# ==================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Start the ShopFlow worker when the backend starts
    and stop the worker when the backend shuts down.
    """

    worker.start()

    logger.info(
        "ShopFlow backend started",
        extra={
            "service": "backend",
            "event": "backend_started"
        }
    )

    yield

    worker.stop()

    logger.info(
        "ShopFlow backend stopped",
        extra={
            "service": "backend",
            "event": "backend_stopped"
        }
    )


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="Autonomous DevOps Troubleshooter",
    description=(
        "ShopFlow backend for controlled DevOps incident simulation. "
        "Supports six failure scenarios and six safe recovery actions."
    ),
    version="2.0.0",
    lifespan=lifespan
)


# ==================================================
# MIDDLEWARE — ARTIFICIAL API DELAY
# Applied ONLY to business/ShopFlow routes.
# Recovery, simulate, health, metrics, logs, verify are NEVER delayed.
# ==================================================

@app.middleware("http")
async def api_delay_middleware(request: Request, call_next):
    path = request.url.path

    if app_state.api_delay_ms > 0 and any(path.startswith(p) for p in _DELAYED_PREFIXES):
        await asyncio.sleep(app_state.api_delay_ms / 1000)

    return await call_next(request)


# ==================================================
# ROOT
# ==================================================

@app.get("/", tags=["Root"])
def root():
    logger.info(
        "ShopFlow root endpoint accessed",
        extra={
            "service": "shopflow",
            "event": "request_processed"
        }
    )

    return {
        "message": "Autonomous DevOps Troubleshooter Backend",
        "service": "ShopFlow",
        "version": "2.0.0"
    }


# ==================================================
# HEALTH
# ==================================================

@app.get("/health", tags=["Monitoring"])
def health():
    """
    Returns healthy only when backend=online, database=connected, worker=running.
    Also surfaces simulator flags for visibility.
    """

    services = {
        "backend": app_state.backend_status,
        "database": app_state.database_status,
        "worker": app_state.worker_status
    }

    is_healthy = (
        app_state.backend_status == "online"
        and app_state.database_status == "connected"
        and app_state.worker_status == "running"
    )

    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "services": services,
        "simulators": {
            "cpu_test_active": app_state.cpu_test_active,
            "memory_test_active": app_state.memory_test_active,
            "api_delay_ms": app_state.api_delay_ms
        }
    }


# ==================================================
# METRICS
# ==================================================

@app.get("/metrics", tags=["Monitoring"])
def metrics():
    """
    System metrics: CPU %, memory %, disk %, API latency, service states,
    and active simulator flags.
    """
    return get_system_metrics()


# ==================================================
# LOGS
# ==================================================

@app.get("/logs", tags=["Monitoring"])
def logs():
    """
    Return recent structured JSON log lines from backend/logs/app.log.
    """

    if not LOG_FILE.exists():
        return {"logs": []}

    with open(LOG_FILE, "r", encoding="utf-8") as file:
        lines = file.readlines()

    return {
        "logs": [
            line.strip()
            for line in lines
            if line.strip()
        ]
    }


# ==================================================
# SHOPFLOW — PRODUCTS
# ==================================================

@app.get("/products", tags=["ShopFlow"])
def products():
    """List all products (affected by slow-API delay when active)."""
    return {"products": get_products()}


@app.get("/products/{product_id}", tags=["ShopFlow"])
def product(product_id: int):
    """Get a single product by ID (affected by slow-API delay when active)."""

    result = get_product(product_id)

    if result is None:
        return {"error": "Product not found"}

    return result


# ==================================================
# SHOPFLOW — ORDERS
# ==================================================

@app.get("/orders", tags=["ShopFlow"])
def orders():
    """List all orders (affected by slow-API delay when active)."""
    return {"orders": get_orders()}


# ==================================================
# FAILURE SIMULATION ENDPOINTS
# ==================================================

@app.post("/simulate/backend_failure", tags=["Failure Simulation"])
def simulate_backend_failure_endpoint():
    """Simulate a backend failure (sets backend_status = 'down')."""
    return simulate_backend_failure()


@app.post("/simulate/database_failure", tags=["Failure Simulation"])
def simulate_database_failure_endpoint():
    """Simulate a database failure (sets database_status = 'disconnected')."""
    return simulate_database_failure()


@app.post("/simulate/high_cpu", tags=["Failure Simulation"])
def simulate_high_cpu_endpoint():
    """Start a safe bounded background CPU stress test."""
    return simulate_high_cpu()


@app.post("/simulate/high_memory", tags=["Failure Simulation"])
def simulate_high_memory_endpoint():
    """Allocate a bounded block of memory (100 MB) to simulate high memory usage."""
    return simulate_high_memory()


@app.post("/simulate/slow_api", tags=["Failure Simulation"])
def simulate_slow_api_endpoint():
    """Enable a 3-second artificial delay on ShopFlow business APIs."""
    return simulate_slow_api()


@app.post("/simulate/worker_failure", tags=["Failure Simulation"])
def simulate_worker_failure_endpoint():
    """Simulate a worker crash using the existing worker.fail()."""
    return simulate_worker_failure()


# ==================================================
# RECOVERY ENDPOINTS
# ==================================================

@app.post("/recover/restart_backend", tags=["Recovery"])
def recover_restart_backend():
    """Recover from backend failure (sets backend_status = 'online')."""
    return restart_backend()


@app.post("/recover/restore_database", tags=["Recovery"])
def recover_restore_database():
    """Recover from database failure (sets database_status = 'connected')."""
    return restore_database()


@app.post("/recover/stop_cpu_test", tags=["Recovery"])
def recover_stop_cpu_test():
    """Stop the CPU stress test background thread."""
    return stop_cpu_test()


@app.post("/recover/stop_memory_test", tags=["Recovery"])
def recover_stop_memory_test():
    """Release the memory allocation and stop the memory stress test."""
    return stop_memory_test()


@app.post("/recover/remove_api_delay", tags=["Recovery"])
def recover_remove_api_delay():
    """Remove the artificial API delay (sets api_delay_ms = 0)."""
    return remove_api_delay()


@app.post("/recover/restart_worker", tags=["Recovery"])
def recover_restart_worker():
    """Restart the ShopFlow worker using the existing worker.restart()."""
    return restart_worker()


# ==================================================
# VERIFICATION
# ==================================================

@app.get("/verify", tags=["Verification"])
def verify():
    """
    Verify that all services are healthy and no stress tests are active.
    Returns verified=true only when everything is fully recovered.
    """
    return verify_system()


# ==================================================
# LEGACY COMPATIBILITY ALIASES
# (preserved — do not remove)
# ==================================================

@app.post("/simulate/backend", tags=["Legacy"])
def simulate_backend():
    """Legacy alias for /simulate/backend_failure."""
    return simulate_backend_failure()


@app.post("/simulate/database", tags=["Legacy"])
def simulate_database():
    """Legacy alias for /simulate/database_failure."""
    return simulate_database_failure()


@app.post("/simulate/reset", tags=["Legacy"])
def simulate_reset():
    """Legacy alias — resets backend status to online."""
    return reset_backend()


@app.post("/recovery/restore-database", tags=["Legacy"])
def recovery_restore_database_legacy():
    """Legacy alias for /recover/restore_database."""
    return restore_database()