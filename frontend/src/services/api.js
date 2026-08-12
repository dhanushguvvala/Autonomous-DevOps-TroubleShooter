/**
 * Centralized API Service for Autonomous DevOps Troubleshooter
 * Owner: Ganesh (Neural Nexus)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// In-Memory Simulation State for standalone demo fallback mode
let mockState = {
  systemOperational: true,
  health: {
    backend: 'healthy',
    database: 'healthy',
    worker: 'healthy',
  },
  metrics: {
    cpu: 32,
    memory: 48,
    disk: 51,
    api_latency: 120,
    history: [
      { time: '10:40', cpu: 28, memory: 45, latency: 115 },
      { time: '10:41', cpu: 30, memory: 46, latency: 118 },
      { time: '10:42', cpu: 32, memory: 48, latency: 120 },
      { time: '10:43', cpu: 31, memory: 47, latency: 119 },
      { time: '10:44', cpu: 33, memory: 49, latency: 122 },
    ],
  },
  logs: [
    { timestamp: '10:44:00', level: 'INFO', service: 'ShopFlow', message: 'System running normally' },
    { timestamp: '10:44:15', level: 'INFO', service: 'Worker', message: 'Queue processing 0 jobs pending' },
  ],
  activeIncident: null,
  incidentsHistory: [
    {
      incident_id: 'INC-000',
      timestamp: '2026-08-11 18:30:00',
      type: 'cpu_spike',
      severity: 'LOW',
      root_cause: 'Scheduled background reporting job',
      confidence: 0.96,
      risk_level: 'LOW',
      recommended_action: 'SCALE_WORKER_NODES',
      recovery_action: 'SCALE_WORKER_NODES',
      human_approval: false,
      verification: 'PASSED',
      final_status: 'RESOLVED',
      evidence: ['CPU usage > 85%', 'Reporting container process spike'],
    },
  ],
  useMockMode: false, // will flip to true if real fetch fails
};

/**
 * Fetch wrapper with timeout and fallback handling
 */
async function fetchWithFallback(url, options = {}, mockFn) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    mockState.useMockMode = false;
    return { data, isMock: false };
  } catch (err) {
    mockState.useMockMode = true;
    const mockData = await mockFn();
    return { data: mockData, isMock: true, error: err.message };
  }
}

export const api = {
  /** Check if operating in mock fallback mode */
  isMockMode() {
    return mockState.useMockMode;
  },

  /** Get System Health status */
  async getHealth() {
    return fetchWithFallback('/health', {}, () => ({
      status: mockState.systemOperational ? 'HEALTHY' : 'INCIDENT_ACTIVE',
      services: { ...mockState.health },
      updated_at: new Date().toLocaleTimeString(),
    }));
  },

  /** Get System Metrics */
  async getMetrics() {
    return fetchWithFallback('/metrics', {}, () => {
      // Add live minor fluctuations to mock metrics
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentCpu = mockState.health.backend === 'down' ? 98 : Math.min(100, Math.max(10, mockState.metrics.cpu + Math.floor(Math.random() * 5 - 2)));
      const currentMemory = mockState.health.worker === 'down' ? 92 : Math.min(100, Math.max(20, mockState.metrics.memory + Math.floor(Math.random() * 3 - 1)));
      const currentLatency = mockState.health.database === 'degraded' ? 850 : Math.max(50, mockState.metrics.api_latency + Math.floor(Math.random() * 10 - 5));

      return {
        cpu: currentCpu,
        memory: currentMemory,
        disk: mockState.metrics.disk,
        api_latency: currentLatency,
        timestamp: now,
        history: mockState.metrics.history,
      };
    });
  },

  /** Get Logs */
  async getLogs() {
    return fetchWithFallback('/logs', {}, () => ({
      logs: mockState.logs,
    }));
  },

  /** Get List of Incidents */
  async getIncidents() {
    return fetchWithFallback('/incidents', {}, () => {
      const list = [...mockState.incidentsHistory];
      if (mockState.activeIncident) {
        list.unshift(mockState.activeIncident);
      }
      return { incidents: list, active_incident: mockState.activeIncident };
    });
  },

  /** Get Detailed Incident by ID */
  async getIncident(incidentId) {
    return fetchWithFallback(`/incidents/${incidentId}`, {}, () => {
      if (mockState.activeIncident && mockState.activeIncident.incident_id === incidentId) {
        return mockState.activeIncident;
      }
      return mockState.incidentsHistory.find((i) => i.incident_id === incidentId) || null;
    });
  },

  /** Failure Simulation Trigger */
  async simulateFailure(failureType) {
    return fetchWithFallback(`/simulate/${failureType}`, { method: 'POST' }, () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      if (failureType === 'reset') {
        mockState.systemOperational = true;
        mockState.health = { backend: 'healthy', database: 'healthy', worker: 'healthy' };
        mockState.metrics.cpu = 32;
        mockState.metrics.memory = 48;
        mockState.metrics.api_latency = 120;
        
        if (mockState.activeIncident) {
          mockState.activeIncident.final_status = 'RESOLVED';
          mockState.incidentsHistory.unshift(mockState.activeIncident);
          mockState.activeIncident = null;
        }

        mockState.logs.unshift({
          timestamp: timeStr,
          level: 'INFO',
          service: 'Simulator',
          message: 'System state manually reset to healthy operational baseline.',
        });

        return { message: 'System reset to healthy', status: 'HEALTHY' };
      }

      // Handle specific failure types
      mockState.systemOperational = false;

      let incident = {
        incident_id: `INC-00${mockState.incidentsHistory.length + 1}`,
        timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
        type: failureType,
        severity: 'HIGH',
        status: 'INVESTIGATING',
        stepIndex: 1, // Timeline step index
        metrics: { cpu: 34, memory: 48, api_latency: 120 },
        services: { ...mockState.health },
        logs: [],
        evidence: [],
        root_cause: null,
        confidence: null,
        risk_level: null,
        recommended_action: null,
        recovery_action: null,
        human_approval_required: false,
        human_approval: null,
        verification: null,
        final_status: 'OPEN',
      };

      if (failureType === 'backend' || failureType === 'simulate/backend') {
        mockState.health.backend = 'down';
        incident.type = 'backend_failure';
        incident.severity = 'HIGH';
        incident.evidence = [
          'Backend health check HTTP 503 Service Unavailable',
          'TCP connection refused on port 8000',
          'Database service responding normally',
          'Async worker process operational',
        ];
        incident.root_cause = 'Backend ShopFlow application process crash due to memory corruption';
        incident.confidence = 0.94;
        incident.risk_level = 'LOW';
        incident.recommended_action = 'RESTART_BACKEND';
        incident.human_approval_required = false;
      } else if (failureType === 'database' || failureType === 'simulate/database') {
        mockState.health.database = 'down';
        incident.type = 'database_failure';
        incident.severity = 'CRITICAL';
        incident.evidence = [
          'PostgreSQL connection pool exhausted',
          'Database connection refused on port 5432',
          'Backend API returning 500 Internal Server Error',
          'High query latency before total connection drop',
        ];
        incident.root_cause = 'Database connection failure & stale locks on primary partition';
        incident.confidence = 0.88;
        incident.risk_level = 'HIGH';
        incident.recommended_action = 'RESTORE_DB_CONNECTION';
        incident.human_approval_required = true;
      } else if (failureType === 'cpu' || failureType === 'simulate/cpu') {
        mockState.metrics.cpu = 95;
        incident.type = 'cpu_spike';
        incident.severity = 'MEDIUM';
        incident.evidence = [
          'CPU utilization threshold exceeded (>90%)',
          'High thread contention in worker process',
          'System load average 8.4',
        ];
        incident.root_cause = 'Unoptimized regex processing loop in background worker';
        incident.confidence = 0.91;
        incident.risk_level = 'LOW';
        incident.recommended_action = 'STOP_CPU_TEST';
        incident.human_approval_required = false;
      } else if (failureType === 'memory' || failureType === 'simulate/memory') {
        mockState.metrics.memory = 94;
        incident.type = 'memory_leak';
        incident.severity = 'HIGH';
        incident.evidence = [
          'RAM usage exceeded 90% quota',
          'Heap size growing linearly without GC relief',
          'OOM warning in kernel logs',
        ];
        incident.root_cause = 'Memory leak in session cache handler';
        incident.confidence = 0.92;
        incident.risk_level = 'MEDIUM';
        incident.recommended_action = 'STOP_MEMORY_TEST';
        incident.human_approval_required = false;
      } else if (failureType === 'slow-api' || failureType === 'simulate/slow-api') {
        mockState.metrics.api_latency = 950;
        mockState.health.backend = 'degraded';
        incident.type = 'slow_api';
        incident.severity = 'MEDIUM';
        incident.evidence = [
          'P99 API latency degraded to 950ms',
          'Upstream gateway timeout warnings',
          'Backend service responding with delays',
        ];
        incident.root_cause = 'Artificially injected network delay on API gateway';
        incident.confidence = 0.97;
        incident.risk_level = 'LOW';
        incident.recommended_action = 'REMOVE_API_DELAY';
        incident.human_approval_required = false;
      } else if (failureType === 'worker' || failureType === 'simulate/worker') {
        mockState.health.worker = 'down';
        incident.type = 'worker_failure';
        incident.severity = 'HIGH';
        incident.evidence = [
          'Celery worker daemon unresponsive',
          'Job queue backlog size growing (>500 jobs)',
          'Redis message broker connection alive',
        ];
        incident.root_cause = 'Async worker queue consumer thread deadlock';
        incident.confidence = 0.89;
        incident.risk_level = 'LOW';
        incident.recommended_action = 'RESTART_WORKER';
        incident.human_approval_required = false;
      }

      mockState.activeIncident = incident;

      mockState.logs.unshift({
        timestamp: timeStr,
        level: 'ERROR',
        service: 'Monitor',
        message: `INCIDENT DETECTED: ${incident.incident_id} - ${incident.type.toUpperCase()}`,
      });

      return { message: `Simulated failure ${failureType} triggered`, incident };
    });
  },

  /** Execute Recovery Action */
  async executeRecovery(actionName, incidentId) {
    return fetchWithFallback(`/recovery/${actionName}`, { method: 'POST', body: JSON.stringify({ incident_id: incidentId }) }, () => {
      if (mockState.activeIncident) {
        mockState.activeIncident.recovery_action = actionName;
        mockState.activeIncident.status = 'RECOVERY_EXECUTED';
        mockState.activeIncident.stepIndex = 7;
        
        // Apply recovery effects
        mockState.health.backend = 'healthy';
        mockState.health.database = 'healthy';
        mockState.health.worker = 'healthy';
        mockState.metrics.cpu = 32;
        mockState.metrics.memory = 48;
        mockState.metrics.api_latency = 120;
        mockState.activeIncident.verification = 'PASSED';
        mockState.activeIncident.final_status = 'RESOLVED';
        mockState.systemOperational = true;

        mockState.logs.unshift({
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO',
          service: 'RecoveryEngine',
          message: `RECOVERY EXECUTED: ${actionName} for ${incidentId}. Verification: PASSED.`,
        });
      }

      return {
        status: 'SUCCESS',
        action: actionName,
        verification: 'PASSED',
        message: `Action ${actionName} successfully executed and verified.`,
      };
    });
  },

  /** Human Approval Trigger */
  async approveIncident(incidentId, approvedAction) {
    return fetchWithFallback(`/incidents/${incidentId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action: approvedAction }),
    }, () => {
      if (mockState.activeIncident && mockState.activeIncident.incident_id === incidentId) {
        mockState.activeIncident.human_approval = 'APPROVED';
        mockState.activeIncident.status = 'APPROVED';
        mockState.activeIncident.stepIndex = 6;
      }
      return this.executeRecovery(approvedAction, incidentId);
    });
  },

  /** Human Rejection Trigger */
  async rejectIncident(incidentId) {
    return fetchWithFallback(`/incidents/${incidentId}/reject`, { method: 'POST' }, () => {
      if (mockState.activeIncident && mockState.activeIncident.incident_id === incidentId) {
        mockState.activeIncident.human_approval = 'REJECTED';
        mockState.activeIncident.status = 'REJECTED';
        mockState.activeIncident.final_status = 'HUMAN_REJECTED';
      }
      return { status: 'REJECTED', message: 'Incident recovery action rejected by user.' };
    });
  },

  /** Verification Check */
  async verifySystem() {
    return fetchWithFallback('/verify', {}, () => ({
      status: mockState.systemOperational ? 'PASSED' : 'FAILED',
      checks: {
        backend: mockState.health.backend === 'healthy' ? 'PASSED' : 'FAILED',
        database: mockState.health.database === 'healthy' ? 'PASSED' : 'FAILED',
        worker: mockState.health.worker === 'healthy' ? 'PASSED' : 'FAILED',
        latency: mockState.metrics.api_latency < 300 ? 'PASSED' : 'WARNING',
      },
    }));
  },
};
