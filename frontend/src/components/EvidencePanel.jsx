import React from 'react';
import './EvidencePanel.css';

function EvidencePanel({ evidence = [] }) {
  return (
    <div className="evidence-panel card-base">
      <div className="panel-header">
        <h3 className="panel-title">INVESTIGATION EVIDENCE</h3>
        <span className="panel-subtitle">Telemetry & Health Check Audit Trail</span>
      </div>

      {evidence.length === 0 ? (
        <div className="empty-evidence">
          <p>No evidence items collected yet. AI Agent is gathering diagnostic traces...</p>
        </div>
      ) : (
        <div className="evidence-list">
          {evidence.map((item, idx) => (
            <div key={idx} className="evidence-item">
              <span className="evidence-check">✓</span>
              <span className="evidence-text">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EvidencePanel;
