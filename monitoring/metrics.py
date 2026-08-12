import psutil


def get_system_metrics():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu": psutil.cpu_percent(interval=1),
        "memory": memory.percent,
        "disk": disk.percent
    }


if __name__ == "__main__":
    metrics = get_system_metrics()

    print("=== NEURAL NEXUS MONITORING ===")
    print(f"CPU Usage: {metrics['cpu']}%")
    print(f"Memory Usage: {metrics['memory']}%")
    print(f"Disk Usage: {metrics['disk']}%")