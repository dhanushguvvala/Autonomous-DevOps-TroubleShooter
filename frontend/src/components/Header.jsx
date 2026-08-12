import React, { useState } from 'react';
import './Header.css';

function Header({ isOperational, activeIncident, isMockMode, onRefresh, isPolling, togglePolling }) {
  const [environment, setEnvironment] = useState('SHOPFLOW-PROD');

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <span className="team-tag">Neural Nexus</span>
            <h1 className="title-text">AUTONOMOUS DEVOPS TROUBLESHOOTER</h1>
          </div>
        </div>

        {/* Environment Selector Dropdown */}
        <div className="env-selector-wrapper">
          <span className="env-status-dot"></span>
          <select 
            className="env-select"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            <option value="SHOPFLOW-PROD">● SHOPFLOW-PROD</option>
            <option value="SHOPFLOW-STAGING">● SHOPFLOW-STAGING</option>
            <option value="SHOPFLOW-DEV">● SHOPFLOW-DEV</option>
          </select>
        </div>
      </div>

      <div className="header-right">
        {/* Live System Status Pill */}
        <div className={`status-banner ${isOperational ? 'operational' : 'incident'}`}>
          <span className={`pulse-dot ${isOperational ? 'healthy' : 'down'}`}></span>
          <span className="status-title">
            {isOperational ? 'Operational' : 'Incident Active'}
          </span>
          {activeIncident && (
            <span className="incident-id-badge">{activeIncident.incident_id}</span>
          )}
        </div>

        {/* Mode Tag */}
        <div className="mode-tag" title={isMockMode ? "Interactive Standalone Demo Mode" : "Connected to Live Backend"}>
          {isMockMode ? 'DEMO MODE' : 'LIVE API'}
        </div>

        {/* Timestamp */}
        <div className="time-tag">
          Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        {/* Quick Action Icons */}
        <div className="action-icons">
          <button className="icon-btn notification-btn" title="System Alerts & Notifications">
            <span>🔔</span>
            <span className="notif-badge">3</span>
          </button>
          <button className="icon-btn" title="Platform Settings">
            <span>⚙️</span>
          </button>
        </div>

        {/* SRE User Profile Pill */}
        <div className="user-profile-chip">
          <div className="avatar">G</div>
          <div className="user-info">
            <span className="user-name">Ganesh</span>
            <span className="user-role">SRE Lead</span>
          </div>
        </div>

        {/* Auto Polling Controls */}
        <div className="control-group">
          <button 
            className={`btn-icon ${isPolling ? 'active' : ''}`}
            onClick={togglePolling}
            title={isPolling ? "Auto-polling ON (3s)" : "Auto-polling OFF"}
          >
            <span className={`polling-indicator ${isPolling ? 'spinning' : ''}`}>🔄</span>
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={onRefresh}
            title="Manual System Refresh"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;