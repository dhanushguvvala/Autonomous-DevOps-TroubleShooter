import time
import sys
import os
import json

# Ensure agents directory is in the path to import rca_agent
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../agents")))

from metrics import get_system_metrics
from detector import detect_anomalies
from incident import create_incident
from backend_check import check_backend_health, create_backend_incident
from rca_agent import analyze_incident


CPU_LIMIT = 80
MEMORY_LIMIT = 85
DISK_LIMIT = 90

REQUIRED_FAILURE_COUNT = 3


def monitor():
    print("========================================")
    print("     NEURAL NEXUS MONITORING AGENT")
    print("========================================")
    print("Monitoring started...")
    print("Persistent anomaly detection enabled.\n")

    failure_counts = {
        "high_cpu": 0,
        "high_memory": 0,
        "high_disk": 0
    }

    backend_failure_count = 0
    slow_api_count = 0
    backend_was_down = False

    while True:
        # 1. Check Backend Health
        result = check_backend_health()

        # 2. Check System Metrics
        metrics = get_system_metrics()

        print("========================================")
        print("     NEURAL NEXUS MONITORING AGENT")
        print("========================================")
        print("")

        # 3. Print Backend Status & Manage Counters
        if result["healthy"]:
            print("Backend: HEALTHY")
            print(f"Status: {result['status_code']}")
            print(f"Latency: {result['latency_ms']} ms")
            print("")

            # Handle recovery transition
            if backend_was_down:
                print("BACKEND RECOVERED\n")
                backend_was_down = False

            # Reset backend failure counter
            backend_failure_count = 0

            # Handle Slow API check
            if result.get("slow", False):
                slow_api_count += 1
                print(f"Slow response: {slow_api_count}/{REQUIRED_FAILURE_COUNT}\n")

                if slow_api_count >= REQUIRED_FAILURE_COUNT:
                    incident = create_backend_incident(
                        "slow_api",
                        "MEDIUM",
                        "API response time exceeded threshold",
                        status_code=result["status_code"],
                        latency_ms=result["latency_ms"]
                    )
                    
                    # Run AI RCA Agent
                    rca_result = analyze_incident(incident)

                    print("BACKEND INCIDENT CREATED\n")
                    print("Incident:")
                    print(json.dumps(incident, indent=4))
                    print("")
                    print("AI RCA RESULT:\n")
                    print(f"Root Cause: {rca_result['root_cause']}")
                    print(f"Confidence: {rca_result['confidence']}")
                    print(f"Recommended Action: {rca_result['recommended_action']}")
                    print(f"Risk: {rca_result['risk']}\n")

                    slow_api_count = 0
            else:
                slow_api_count = 0

        else:
            print("Backend: DOWN")
            print(f"Status: {result['status_code']}")
            print(f"Latency: {result['latency_ms']} ms")
            print("")

            # Set flag and manage counters
            backend_was_down = True
            backend_failure_count += 1
            slow_api_count = 0

            print(f"Backend failure: {backend_failure_count}/{REQUIRED_FAILURE_COUNT}\n")

            if backend_failure_count >= REQUIRED_FAILURE_COUNT:
                incident = create_backend_incident(
                    "backend_failure",
                    "HIGH",
                    "Backend health check failed",
                    status_code=result["status_code"],
                    latency_ms=None
                )

                # Run AI RCA Agent
                rca_result = analyze_incident(incident)

                print("BACKEND INCIDENT CREATED\n")
                print("Incident:")
                print(json.dumps(incident, indent=4))
                print("")
                print("AI RCA RESULT:\n")
                print(f"Root Cause: {rca_result['root_cause']}")
                print(f"Confidence: {rca_result['confidence']}")
                print(f"Recommended Action: {rca_result['recommended_action']}")
                print(f"Risk: {rca_result['risk']}\n")

                backend_failure_count = 0

        # 4. Print System Resource Metrics
        print(f"CPU Usage: {metrics['cpu']}%")
        print(f"Memory Usage: {metrics['memory']}%")
        print(f"Disk Usage: {metrics['disk']}%")
        print("")

        # 5. Check System Anomalies
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

                # Run AI RCA Agent
                rca_result = analyze_incident(incident)

                print("\n🚨 INCIDENT CREATED\n")
                print("Incident:")
                print(json.dumps(incident, indent=4))
                print("")
                print("AI RCA RESULT:\n")
                print(f"Root Cause: {rca_result['root_cause']}")
                print(f"Confidence: {rca_result['confidence']}")
                print(f"Recommended Action: {rca_result['recommended_action']}")
                print(f"Risk: {rca_result['risk']}\n")

                # Reset after creating incident
                failure_counts[anomaly_type] = 0

        # Reset counters for problems that disappeared
        for anomaly_type in failure_counts:
            if anomaly_type not in detected_types:
                failure_counts[anomaly_type] = 0

        if not anomalies:
            print("Status: 🟢 NORMAL")

        print("========================================")
        print("")

        time.sleep(5)


if __name__ == "__main__":
    monitor()