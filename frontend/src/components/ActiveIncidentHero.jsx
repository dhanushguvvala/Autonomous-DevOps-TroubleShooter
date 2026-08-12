import React from 'react';
import './ActiveIncidentHero.css';

function ActiveIncidentHero({ activeIncident, onSelectIncident }) {
  if (!activeIncident) {
    return (
      <div className="active-incident-hero healthy card-base">
        <div className="hero-healthy-content">
          <div className="healthy-badge">
            <span className="pulse-dot healthy"></span>
            <span>SYSTEM HEALTHY</span>
          </div>
          <h2 className="healthy-title">No Active Incidents Detected</h2>
          <p className="healthy-desc">
            All ShopFlow monitored microservices, database clusters, and background worker queues are operating within baseline performance metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-incident-hero active card-base">
      <div className="incident-hero-header">
        <div className="hero-status-title">
          <span className="pulse-dot down"></span>
          <span className="title-alert">🔴 ACTIVE INCIDENT</span>
        </div>
        <div className="hero-badges">
          <span className="badge badge-danger">{activeIncident.severity || 'HIGH'} SEVERITY</span>
          <span className="badge badge-warning">{activeIncident.status || 'INVESTIGATING'}</span>
        </div>
      </div>

      <div className="hero-body-grid">
        <div className="hero-info">
          <div className="incident-id-tag">{activeIncident.incident_id}</div>
          <h2 className="incident-title">
            {(activeIncident.type || 'SYSTEM_FAILURE').replace('_', ' ').toUpperCase()}
          </h2>
          <p className="incident-cause">
            {activeIncident.root_cause || 'AI Agent currently collecting diagnostic evidence and analyzing logs...'}
          </p>

          <div className="incident-meta-row">
            <span className="meta-item">⏱ Detected: <strong>{activeIncident.timestamp}</strong></span>
            {activeIncident.confidence && (
              <span className="meta-item">🤖 AI Confidence: <strong>{Math.round(activeIncident.confidence * 100)}%</strong></span>
            )}
            {activeIncident.risk_level && (
              <span className="meta-item">⚡ Risk: <strong>{activeIncident.risk_level}</strong></span>
            )}
          </div>
        </div>

        <div className="hero-actions">
          <button 
            className="btn btn-danger btn-lg hero-action-btn"
            onClick={() => onSelectIncident(activeIncident)}
          >
            <span>INVESTIGATE INCIDENT & RECOVER</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActiveIncidentHero;
