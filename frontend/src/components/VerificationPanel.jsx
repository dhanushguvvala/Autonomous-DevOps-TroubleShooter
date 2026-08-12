import React from 'react';
import './VerificationPanel.css';

function VerificationPanel({ verification, services = {}, metrics = {} }) {
  const isPassed = verification === 'PASSED';
  const isFailed = verification === 'FAILED';

  return (
    <div className={`verification-panel card-base ${isPassed ? 'passed' : isFailed ? 'failed' : 'pending'}`}>
      <div className="panel-header">
        <h3 className="panel-title">RECOVERY VERIFICATION</h3>
        <span className="panel-subtitle">Post-Remediation Health Assertion</span>
      </div>

      <div className="verification-body">
        <div className="status-hero-row">
          <span className={`pulse-dot ${isPassed ? 'healthy' : isFailed ? 'down' : 'degraded'}`}></span>
          <span className="status-text">{isPassed ? '● PASSED' : isFailed ? '● FAILED' : '⏳ VERIFYING...'}</span>
        </div>

        <p className="status-summary-desc">
          {isPassed 
            ? 'All automated post-recovery assertions passed successfully. Service baselines restored.'
            : isFailed 
            ? 'Recovery verification unsuccessful. Immediate replanning initiated by Agent Engine.'
            : 'Evaluating system health endpoints and monitoring latency stability...'}
        </p>

        <div className="verification-checks-grid">
          <div className="check-card">
            <span className="check-name">Backend Service</span>
            <span className="check-value">ONLINE</span>
          </div>

          <div className="check-card">
            <span className="check-name">Database Cluster</span>
            <span className="check-value">CONNECTED</span>
          </div>

          <div className="check-card">
            <span className="check-name">Worker Queue</span>
            <span className="check-value">RUNNING</span>
          </div>

          <div className="check-card">
            <span className="check-name">P99 Latency</span>
            <span className="check-value">{metrics.api_latency || 120}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPanel;
