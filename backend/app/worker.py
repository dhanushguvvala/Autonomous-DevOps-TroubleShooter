import threading
import time

from app.state import app_state
from app.logger import logger


class ShopFlowWorker:
    def __init__(self):
        self.stop_event = threading.Event()
        self.worker_thread = None

    def start(self):
        """
        Start the worker if it is not already running.
        """
        if self.worker_thread and self.worker_thread.is_alive():
            app_state.worker_status = "running"
            return

        self.stop_event.clear()

        self.worker_thread = threading.Thread(
            target=self._run,
            name="shopflow-worker",
            daemon=True
        )

        self.worker_thread.start()

        app_state.worker_status = "running"

        logger.info(
            "ShopFlow worker started",
            extra={
                "service": "worker",
                "event": "worker_started"
            }
        )

    def _run(self):
        """
        Lightweight background worker.
        """

        heartbeat_counter = 0

        while not self.stop_event.wait(5):
            heartbeat_counter += 1

            # Harmless periodic work
            if heartbeat_counter % 6 == 0:
                logger.info(
                    "ShopFlow worker heartbeat",
                    extra={
                        "service": "worker",
                        "event": "worker_heartbeat"
                    }
                )

    def stop(self):
        """
        Stop the worker safely.
        """

        self.stop_event.set()

        if self.worker_thread and self.worker_thread.is_alive():
            self.worker_thread.join(timeout=2)

        app_state.worker_status = "stopped"

        logger.info(
            "ShopFlow worker stopped",
            extra={
                "service": "worker",
                "event": "worker_stopped"
            }
        )

    def fail(self):
        """
        Simulate a worker failure without crashing the backend.
        """

        self.stop_event.set()

        if self.worker_thread and self.worker_thread.is_alive():
            self.worker_thread.join(timeout=2)

        app_state.worker_status = "failed"

        logger.error(
            "ShopFlow worker failure simulated",
            extra={
                "service": "worker",
                "event": "worker_failed"
            }
        )


    def restart(self):
        """
        Restart the worker safely.
        """

        self.stop_event.set()

        if self.worker_thread and self.worker_thread.is_alive():
            self.worker_thread.join(timeout=2)

        self.start()

        logger.info(
            "ShopFlow worker restarted",
            extra={
                "service": "worker",
                "event": "worker_restarted"
            }
        )


worker = ShopFlowWorker()