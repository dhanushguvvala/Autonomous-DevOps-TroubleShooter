import json
from datetime import datetime

class RCAAgent:
    """
    RCA Agent for Autonomous DevOps Troubleshooter.
    Processes incident JSON and generates a Root Cause Analysis (RCA) report.
    """

    def analyze_incident(self, incident):
        """
        Receives an incident (dict or JSON string) and returns the RCA result as a dict.
        """
        if isinstance(incident, str):
            try:
                incident = json.loads(incident)
            except Exception as e:
                return {
                    "error": f"Invalid JSON input: {e}"
                }

        incident_id = incident.get("incident_id", "INC-UNKNOWN")
        incident_type = incident.get("type")
        severity = incident.get("severity", "MEDIUM")
        metrics = incident.get("metrics", {})
        evidence_in = incident.get("evidence", [])

        # Initialize defaults
        root_cause = "Unknown issue"
        confidence = 0.50
        evidence = list(evidence_in)
        recommended_action = "Investigate the system logs and service status"
        risk = "MEDIUM"
        explanation = "An incident was detected, but no specific root cause could be determined automatically."

        if incident_type == "backend_failure":
            root_cause = "Backend service is unavailable"
            confidence = 0.95
            status_code = metrics.get("status_code")
            latency_ms = metrics.get("latency_ms")
            
            # Formulate evidence
            evidence = ["Health check failed"]
            if status_code is not None:
                evidence.append(f"Backend returned HTTP status {status_code}")
            else:
                evidence.append("Backend returned no HTTP response (connection refused or timed out)")
            
            recommended_action = "Restart the backend service"
            risk = "LOW"
            explanation = "The monitoring system detected three consecutive failed health checks."

        elif incident_type == "slow_api":
            root_cause = "Backend API response latency is abnormally high"
            confidence = 0.90
            latency_ms = metrics.get("latency_ms")
            status_code = metrics.get("status_code", 200)

            evidence = []
            if status_code is not None:
                evidence.append(f"HTTP status was {status_code}")
            if latency_ms is not None:
                evidence.append(f"Response latency exceeded 2000 ms (latency: {latency_ms} ms)")
            else:
                evidence.append("Response latency exceeded threshold")

            recommended_action = "Inspect backend API delay and active services"
            risk = "LOW"
            explanation = "The backend is reachable but responding slower than the monitoring threshold."

        elif incident_type == "high_cpu":
            cpu_val = metrics.get("cpu")
            root_cause = "CPU resource pressure"
            confidence = 0.85
            val_str = f"{cpu_val}%" if cpu_val is not None else "above threshold"
            evidence = [f"CPU usage is {val_str}"]
            recommended_action = "Optimize CPU-consuming processes or stop CPU stress tests if active"
            risk = "LOW"
            explanation = f"The monitoring system detected that CPU usage has exceeded the threshold of 80%."

        elif incident_type == "high_memory":
            mem_val = metrics.get("memory")
            root_cause = "Memory resource pressure"
            confidence = 0.85
            val_str = f"{mem_val}%" if mem_val is not None else "above threshold"
            evidence = [f"Memory usage is {val_str}"]
            recommended_action = "Identify memory leaks, optimize memory usage, or stop memory stress tests if active"
            risk = "LOW"
            explanation = f"The monitoring system detected that Memory usage has exceeded the threshold of 85%."

        elif incident_type == "high_disk":
            disk_val = metrics.get("disk")
            root_cause = "Disk resource pressure"
            confidence = 0.85
            val_str = f"{disk_val}%" if disk_val is not None else "above threshold"
            evidence = [f"Disk usage is {val_str}"]
            recommended_action = "Free up disk space, delete temporary files, or archive old logs"
            risk = "LOW"
            explanation = f"The monitoring system detected that Disk usage has exceeded the threshold of 90%."

        # Return structured RCA report
        return {
            "incident_id": incident_id,
            "root_cause": root_cause,
            "confidence": confidence,
            "evidence": evidence,
            "recommended_action": recommended_action,
            "risk": risk,
            "explanation": explanation
        }


def analyze_incident(incident_json):
    """
    Helper function to run the agent directly.
    """
    agent = RCAAgent()
    return agent.analyze_incident(incident_json)
