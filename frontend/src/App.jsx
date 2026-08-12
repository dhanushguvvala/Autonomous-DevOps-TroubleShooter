import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TopologyPage from './pages/TopologyPage';
import IncidentPage from './pages/IncidentPage';
import LogsPage from './pages/LogsPage';
import HistoryPage from './pages/HistoryPage';
import HumanApprovalModal from './components/HumanApprovalModal';
import { api } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  const [showSimulator, setShowSimulator] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);
  const [approvalModalIncident, setApprovalModalIncident] = useState(null);

  // Fetch telemetry and system state
  const refreshSystemData = useCallback(async () => {
    try {
      const [healthRes, metricsRes, incidentsRes, logsRes] = await Promise.all([
        api.getHealth(),
        api.getMetrics(),
        api.getIncidents(),
        api.getLogs(),
      ]);

      setHealth(healthRes.data);
      setMetrics(metricsRes.data);
      setLogs(logsRes.data?.logs || []);
      setIsMockMode(api.isMockMode());

      if (incidentsRes.data) {
        setIncidents(incidentsRes.data.incidents || []);
        const currentActive = incidentsRes.data.active_incident || null;
        setActiveIncident(currentActive);

        // Auto open approval modal if active incident requires human approval
        if (currentActive && currentActive.human_approval_required && !currentActive.human_approval) {
          setApprovalModalIncident(currentActive);
        }
      }
    } catch (err) {
      console.error('Error polling system status:', err);
    }
  }, []);

  // Polling Effect
  useEffect(() => {
    refreshSystemData();

    if (!isPolling) return;
    const timer = setInterval(() => {
      refreshSystemData();
    }, 3000);

    return () => clearInterval(timer);
  }, [isPolling, refreshSystemData]);

  // Failure Simulator Trigger Handler
  const handleSimulate = async (failureType) => {
    const res = await api.simulateFailure(failureType);
    await refreshSystemData();

    if (res.data && res.data.incident) {
      const inc = res.data.incident;
      setActiveIncident(inc);
      setSelectedIncident(inc);

      if (inc.human_approval_required) {
        setApprovalModalIncident(inc);
      }
    }
  };

  // Select incident for deep dive inspection
  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    setActiveTab('incident');
  };

  // Execute Recovery
  const handleExecuteRecovery = async (actionName, incidentId) => {
    await api.executeRecovery(actionName, incidentId);
    await refreshSystemData();
  };

  // Approve Modal Action
  const handleApproveAction = async (incidentId, approvedAction) => {
    await api.approveIncident(incidentId, approvedAction);
    setApprovalModalIncident(null);
    await refreshSystemData();
  };

  // Reject Modal Action
  const handleRejectAction = async (incidentId) => {
    await api.rejectIncident(incidentId);
    setApprovalModalIncident(null);
    await refreshSystemData();
  };

  const isOperational = health?.status === 'HEALTHY' && !activeIncident;
  const incidentToDisplay = selectedIncident || activeIncident;

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        isOperational={isOperational}
        activeIncident={activeIncident}
        isMockMode={isMockMode}
        onRefresh={refreshSystemData}
        isPolling={isPolling}
        togglePolling={() => setIsPolling(!isPolling)}
      />

      {/* Primary Tabbed Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeIncidentCount={activeIncident ? 1 : 0}
        showSimulator={showSimulator}
        setShowSimulator={setShowSimulator}
      />

      {/* Main Content View Router */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            health={health}
            metrics={metrics}
            incidents={incidents}
            activeIncident={activeIncident}
            showSimulator={showSimulator}
            onSimulate={handleSimulate}
            onSelectIncident={handleSelectIncident}
            isMockMode={isMockMode}
          />
        )}

        {activeTab === 'topology' && (
          <TopologyPage health={health} />
        )}

        {activeTab === 'incident' && (
          <IncidentPage
            incident={incidentToDisplay}
            onExecuteRecovery={handleExecuteRecovery}
            onRequestApproval={(inc) => setApprovalModalIncident(inc)}
            health={health}
            metrics={metrics}
          />
        )}

        {activeTab === 'logs' && (
          <LogsPage logs={logs} />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
          />
        )}
      </main>

      {/* High-Risk Human Approval Modal Dialog */}
      {approvalModalIncident && (
        <HumanApprovalModal
          incident={approvalModalIncident}
          onApprove={handleApproveAction}
          onReject={handleRejectAction}
          onClose={() => setApprovalModalIncident(null)}
        />
      )}
    </div>
  );
}

export default App;