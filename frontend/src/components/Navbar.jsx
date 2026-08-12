import React from 'react';
import './Navbar.css';

function Navbar({ activeTab, setActiveTab, activeIncidentCount, showSimulator, setShowSimulator }) {
  return (
    <nav className="navbar">
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-text">Production Overview</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'topology' ? 'active' : ''}`}
          onClick={() => setActiveTab('topology')}
        >
          <span className="tab-icon">🌐</span>
          <span className="tab-text">Service Topology</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'incident' ? 'active' : ''} ${activeIncidentCount > 0 ? 'alert' : ''}`}
          onClick={() => setActiveTab('incident')}
        >
          <span className="tab-icon">🚨</span>
          <span className="tab-text">Incident Deep Dive</span>
          {activeIncidentCount > 0 && (
            <span className="nav-badge-count">{activeIncidentCount}</span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <span className="tab-icon">💻</span>
          <span className="tab-text">Log Console</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📜</span>
          <span className="tab-text">Incident History</span>
        </button>
      </div>

      <div className="nav-actions">
        <button
          className={`btn ${showSimulator ? 'btn-danger' : 'btn-outline'} simulator-toggle-btn`}
          onClick={() => setShowSimulator(!showSimulator)}
        >
          <span className="btn-icon-text">⚡</span>
          <span>{showSimulator ? 'Close Fault Simulator' : 'ShopFlow Fault Simulator'}</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
