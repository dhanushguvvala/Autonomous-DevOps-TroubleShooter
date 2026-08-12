from detector import detect_anomalies
from incident import create_incident


test_metrics = {
    "cpu": 95,
    "memory": 50,
    "disk": 40
}

anomalies = detect_anomalies(test_metrics)

for anomaly in anomalies:

    incident = create_incident(
        test_metrics,
        anomaly
    )

    print("\n=== INCIDENT CREATED ===")
    print(incident)