import uuid
from datetime import datetime


def create_incident(metrics, anomaly):

    incident = {
        "incident_id": f"INC-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.now().isoformat(),

        "type": anomaly["type"],
        "severity": anomaly["severity"],

        "metrics": {
            "cpu": metrics["cpu"],
            "memory": metrics["memory"],
            "disk": metrics["disk"]
        },

        "evidence": [
            anomaly["reason"]
        ],

        "status": "detected"
    }

    return incident