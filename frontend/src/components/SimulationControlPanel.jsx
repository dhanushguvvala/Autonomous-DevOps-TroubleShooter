import React, { useState } from 'react';
import './SimulationControlPanel.css';

function SimulationControlPanel({ onSimulate, isMockMode }) {
  const [loadingType, setLoadingType] = useState(null);

  const handleTrigger = async (type) => {
    setLoadingType(type);
    try {
      await onSimulate(type);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="simulation-control-panel card-base">
      <div className="panel-header">
        <div className="title-group">
          <span className="sim-icon">🧪</span>
          <div>
            <h3 className="panel-title">SHOPFLOW FAULT INJECTION SIMULATOR</h3>
            <span className="panel-subtitle">Interactive Hackathon Demo Control • Inject synthetic chaos & observe AI remediation</span>
          </div>
        </div>
        {isMockMode && (
          <span className="badge badge-info">INTERACTIVE FAULT INJECTION READY</span>
        )}
      </div>

      {/* Visual Workflow Feedback Loop Diagram */}
      <div className="simulation-workflow-loop">
        <div className="loop-step">
          <span className="step-num">1</span>
          <span className="step-text">FAILURE INJECTED</span>
        </div>
        <span className="loop-arrow">➔</span>
        <div className="loop-step">
          <span className="step-num">2</span>
          <span className="step-text">ANOMALY DETECTED</span>
        </div>
        <span className="loop-arrow">➔</span>
        <div className="loop-step">
          <span className="step-num">3</span>
          <span className="step-text">AI ANALYSIS</span>
        </div>
        <span className="loop-arrow">➔</span>
        <div className="loop-step">
          <span className="step-num">4</span>
          <span className="step-text">ROOT CAUSE IDENTIFIED</span>
        </div>
        <span className="loop-arrow">➔</span>
        <div className="loop-step">
          <span className="step-num">5</span>
          <span className="step-text">REMEDIATION</span>
        </div>
        <span className="loop-arrow">➔</span>
        <div className="loop-step step-success">
          <span className="step-num">6</span>
          <span className="step-text">SYSTEM RECOVERED</span>
        </div>
      </div>

      <div className="simulation-buttons-grid">
        <button
          className="btn btn-outline sim-btn danger"
          onClick={() => handleTrigger('backend')}
          disabled={loadingType !== null}
        >
          <span>💥 Backend Process Failure</span>
        </button>

        <button
          className="btn btn-outline sim-btn danger"
          onClick={() => handleTrigger('database')}
          disabled={loadingType !== null}
        >
          <span>🔥 DB Connection Timeout</span>
        </button>

        <button
          className="btn btn-outline sim-btn warning"
          onClick={() => handleTrigger('cpu')}
          disabled={loadingType !== null}
        >
          <span>⚡ High CPU Utilization Spike</span>
        </button>

        <button
          className="btn btn-outline sim-btn warning"
          onClick={() => handleTrigger('memory')}
          disabled={loadingType !== null}
        >
          <span>🧠 Container Memory Leak</span>
        </button>

        <button
          className="btn btn-outline sim-btn warning"
          onClick={() => handleTrigger('slow-api')}
          disabled={loadingType !== null}
        >
          <span>🐢 Gateway API Latency</span>
        </button>

        <button
          className="btn btn-outline sim-btn danger"
          onClick={() => handleTrigger('worker')}
          disabled={loadingType !== null}
        >
          <span>⚙️ Async Worker Crash</span>
        </button>

        <button
          className="btn btn-success sim-btn reset-btn"
          onClick={() => handleTrigger('reset')}
          disabled={loadingType !== null}
        >
          <span>🔄 Reset System Baseline</span>
        </button>
      </div>
    </div>
  );
}

export default SimulationControlPanel;
