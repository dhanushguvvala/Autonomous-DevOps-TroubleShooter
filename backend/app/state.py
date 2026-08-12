class AppState:
    def __init__(self):
        self.backend_status = "online"
        self.database_status = "connected"
        self.worker_status = "running"

        self.cpu_test_active = False
        self.memory_test_active = False

        self.api_delay_ms = 0


app_state = AppState()