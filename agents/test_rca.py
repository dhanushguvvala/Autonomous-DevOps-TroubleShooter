import json
from rca_agent import analyze_incident

def run_tests():
    # --- Test 1: backend_failure ---
    print("\n--- Running Test 1: backend_failure ---")
    incident_1 = {
        "incident_id": "INC-11111111",
        "timestamp": "2026-08-12T13:00:00",
        "type": "backend_failure",
        "severity": "HIGH",
        "source": "monitoring",
        "description": "Backend health check failed",
        "metrics": {
            "latency_ms": None,
            "status_code": None
        },
        "evidence": [
            "Backend health check failed"
        ],
        "status": "detected"
    }
    
    rca_1 = analyze_incident(incident_1)
    print("Input Incident:")
    print(json.dumps(incident_1, indent=2))
    print("\nRCA Output:")
    print(json.dumps(rca_1, indent=2))

    # --- Test 2: slow_api ---
    print("\n--- Running Test 2: slow_api ---")
    incident_2 = {
        "incident_id": "INC-22222222",
        "timestamp": "2026-08-12T13:00:00",
        "type": "slow_api",
        "severity": "MEDIUM",
        "source": "monitoring",
        "description": "API response time exceeded threshold",
        "metrics": {
            "latency_ms": 3200,
            "status_code": 200
        },
        "evidence": [
            "API response time exceeded threshold"
        ],
        "status": "detected"
    }

    rca_2 = analyze_incident(incident_2)
    print("Input Incident:")
    print(json.dumps(incident_2, indent=2))
    print("\nRCA Output:")
    print(json.dumps(rca_2, indent=2))

    # --- Test 3: CPU anomaly ---
    print("\n--- Running Test 3: CPU resource pressure ---")
    incident_3 = {
        "incident_id": "INC-33333333",
        "timestamp": "2026-08-12T13:00:00",
        "type": "high_cpu",
        "severity": "warning",
        "metrics": {
            "cpu": 95,
            "memory": 50,
            "disk": 40
        },
        "evidence": [
            "CPU usage is 95%"
        ],
        "status": "detected"
    }

    rca_3 = analyze_incident(incident_3)
    print("Input Incident:")
    print(json.dumps(incident_3, indent=2))
    print("\nRCA Output:")
    print(json.dumps(rca_3, indent=2))


if __name__ == "__main__":
    run_tests()
