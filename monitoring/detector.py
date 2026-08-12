def detect_anomalies(metrics):
    anomalies = []

    if metrics["cpu"] > 80:
        anomalies.append({
            "type": "high_cpu",
            "severity": "warning",
            "reason": f"CPU usage is {metrics['cpu']}%"
        })

    if metrics["memory"] > 85:
        anomalies.append({
            "type": "high_memory",
            "severity": "warning",
            "reason": f"Memory usage is {metrics['memory']}%"
        })

    if metrics["disk"] > 90:
        anomalies.append({
            "type": "high_disk",
            "severity": "warning",
            "reason": f"Disk usage is {metrics['disk']}%"
        })

    return anomalies