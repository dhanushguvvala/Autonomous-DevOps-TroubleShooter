class AppState:
    def __init__(self):
        # Service status
        self.backend_status = "online"
        self.database_status = "connected"
        self.worker_status = "running"

        # Failure simulator state
        self.cpu_test_active = False
        self.memory_test_active = False
        self.api_delay_ms = 0

        # Incident state (Ganesh frontend integration)
        self.incidents = [
            {
                "id": "INC-001",
                "title": "High CPU Usage",
                "severity": "warning",
                "status": "active",
                "service": "shopflow-prod",
                "description": "CPU utilization exceeded the configured threshold.",
                "timestamp": "2026-08-12T14:00:00"
            }
        ]


app_state = AppState()