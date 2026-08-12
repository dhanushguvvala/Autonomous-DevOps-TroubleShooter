import time

from metrics import get_system_metrics
from detector import detect_anomalies
from incident import create_incident


CPU_LIMIT = 80
MEMORY_LIMIT = 85
DISK_LIMIT = 90

REQUIRED_FAILURE_COUNT = 3


def monitor():

    print("====================================")
    print("   NEURAL NEXUS MONITORING AGENT")
    print("====================================")
    print("Monitoring started...")
    print("Persistent anomaly detection enabled.\n")

    failure_counts = {
        "high_cpu": 0,
        "high_memory": 0,
        "high_disk": 0
    }

    while True:

        metrics = get_system_metrics()

        print("------------------------------------")
        print(f"CPU Usage:    {metrics['cpu']}%")
        print(f"Memory Usage: {metrics['memory']}%")
        print(f"Disk Usage:   {metrics['disk']}%")

        anomalies = detect_anomalies(metrics)

        detected_types = []

        for anomaly in anomalies:

            anomaly_type = anomaly["type"]
            detected_types.append(anomaly_type)

            failure_counts[anomaly_type] += 1

            print(
                f"⚠️ {anomaly_type}: "
                f"{failure_counts[anomaly_type]}/"
                f"{REQUIRED_FAILURE_COUNT}"
            )

            if failure_counts[anomaly_type] >= REQUIRED_FAILURE_COUNT:

                incident = create_incident(
                    metrics,
                    anomaly
                )

                print("\n🚨 INCIDENT CREATED")
                print(incident)

                # Reset after creating incident
                failure_counts[anomaly_type] = 0

        # Reset counters for problems that disappeared
        for anomaly_type in failure_counts:

            if anomaly_type not in detected_types:
                failure_counts[anomaly_type] = 0

        if not anomalies:
            print("Status: 🟢 NORMAL")

        print("------------------------------------")

        time.sleep(5)


if __name__ == "__main__":
    monitor()