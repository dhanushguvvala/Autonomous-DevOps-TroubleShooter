import React from 'react';
import './Dashboard.css';
import MetricsPanel from '../components/MetricsPanel';
import ActiveIncidentHero from '../components/ActiveIncidentHero';
import SimulationControlPanel from '../components/SimulationControlPanel';
import ServiceStatusTable from '../components/ServiceStatusTable';
import AiActivityFeed from '../components/AiActivityFeed';
import IncidentFeed from '../components/IncidentFeed';

function Dashboard({
  health,
  metrics,
  incidents,
  activeIncident,
  showSimulator,
  onSimulate,
  onSelectIncident,
  isMockMode
}) {
  const isHealthy = health?.status === 'HEALTHY' && !activeIncident;

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Production Overview</h1>
          <p className="overview-sub">Real-time infrastructure health, incidents and autonomous remediation.</p>
        </div>
      </div>

      {/* 4 Datadog/Grafana Style KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">SYSTEM HEALTH</span>
            <span className="kpi-trend trend-up">↑ 2.4%</span>
          </div>
          <div className="kpi-value">{isHealthy ? '99.8%' : '92.4%'}</div>
          <span className="kpi-sub">Overall SLA Availability</span>
        </div>

        <div className={`kpi-card ${activeIncident ? 'kpi-alert' : ''}`}>
          <div className="kpi-top">
            <span className="kpi-label">ACTIVE INCIDENTS</span>
            <span className={`kpi-trend ${activeIncident ? 'trend-down' : 'trend-neutral'}`}>
              {activeIncident ? '1 Critical' : '0 Active'}
            </span>
          </div>
          <div className="kpi-value">{activeIncident ? '01' : '00'}</div>
          <span className="kpi-sub">{activeIncident ? 'Automated RCA active' : 'All systems baseline green'}</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">AVERAGE LATENCY</span>
            <span className="kpi-trend trend-up">↓ 12 ms</span>
          </div>
          <div className="kpi-value">{metrics?.api_latency || 120}<span className="kpi-unit">ms</span></div>
          <span className="kpi-sub">P99 Gateway Latency</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">ERROR RATE</span>
            <span className="kpi-trend trend-up">↓ 0.02%</span>
          </div>
          <div className="kpi-value">{isHealthy ? '0.01%' : '4.20%'}</div>
          <span className="kpi-sub">HTTP 5xx Error Ratio</span>
        </div>
      </div>

      {/* Active Incident Hero Banner */}
      <ActiveIncidentHero 
        activeIncident={activeIncident} 
        onSelectIncident={onSelectIncident} 
      />

      {/* Demo Fault Simulator Control Bar */}
      {showSimulator && (
        <SimulationControlPanel 
          onSimulate={onSimulate} 
          isMockMode={isMockMode} 
        />
      )}

      {/* Primary Overview Grid */}
      <div className="dashboard-grid">
        <div className="grid-col-left">
          {/* Telemetry Chart Stream */}
          <MetricsPanel metrics={metrics} />

          {/* Service Health Matrix */}
          <ServiceStatusTable 
            services={health?.services} 
            onSelectService={() => {}}
          />
        </div>

        <div className="grid-col-right">
          {/* Autonomous AI Activity Stream */}
          <AiActivityFeed activeIncident={activeIncident} />

          {/* Incident Audit Feed */}
          <IncidentFeed 
            incidents={incidents} 
            activeIncident={activeIncident} 
            onSelectIncident={onSelectIncident} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;