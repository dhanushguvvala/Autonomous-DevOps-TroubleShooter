import React from 'react';
import './ReplanningView.css';

function ReplanningView({ attempts = [] }) {
  if (!attempts || attempts.length <= 1) return null;

  return (
    <div className="replanning-panel card-base">
      <div className="panel-header">
        <h3 className="panel-title">MULTI-ATTEMPT RECOVERY REPLANNING LOG</h3>
        <span className="panel-subtitle">Adaptive AI Agent Re-investigation Loop</span>
      </div>

      <div className="replanning-timeline">
        {attempts.map((attempt, index) => (
          <div key={index} className={`attempt-card ${attempt.passed ? 'success' : 'failed'}`}>
            <div className="attempt-header">
              <span className="attempt-title">RECOVERY ATTEMPT #{index + 1}</span>
              <span className={`badge ${attempt.passed ? 'badge-healthy' : 'badge-danger'}`}>
                {attempt.passed ? '✓ SUCCESSFUL' : '✕ FAILED'}
              </span>
            </div>

            <div className="attempt-body">
              <div className="attempt-detail">
                <span className="detail-label">Action Executed:</span>
                <span className="detail-code">{attempt.action}</span>
              </div>
              <div className="attempt-detail">
                <span className="detail-label">Failure Reason:</span>
                <span className="detail-text">{attempt.failure_reason || 'Initial remediation failed verification assertions.'}</span>
              </div>

              {!attempt.passed && (
                <div className="reinvestigation-box">
                  <span className="reinv-tag">🔄 RE-INVESTIGATION COMPLETED</span>
                  <p className="reinv-text">New Root Cause Identified ➔ Replanned Recovery Strategy Created</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReplanningView;
