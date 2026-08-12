from detector import detect_anomalies


test_values = [
    {"cpu": 91, "memory": 50, "disk": 40},
    {"cpu": 94, "memory": 50, "disk": 40},
    {"cpu": 96, "memory": 50, "disk": 40}
]


for metrics in test_values:

    anomalies = detect_anomalies(metrics)

    print("\nMetrics:", metrics)
    print("Anomalies:", anomalies)