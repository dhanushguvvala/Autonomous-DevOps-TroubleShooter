from detector import detect_anomalies


test_metrics = {
    "cpu": 95,
    "memory": 50,
    "disk": 40
}

anomalies = detect_anomalies(test_metrics)

print(anomalies)