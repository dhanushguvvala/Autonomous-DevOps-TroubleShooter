import React, { useState } from 'react';
import './IncidentPage.css';
import TimelineStepper from '../components/TimelineStepper';
import AiRcaSection from '../components/AiRcaSection';
import EvidencePanel from '../components/EvidencePanel';
import VerificationPanel from '../components/VerificationPanel';
import ReplanningView from '../components/ReplanningView';
import IncidentReport from '../components/IncidentReport';

function IncidentPage({
  incident,
  onExecuteRecovery,
  onRequestApproval,
  health,
  metrics
}) {
  const [showReport, setShowReport] = useState(false);
  const [executing, setExecuting] = useState(false);

  if (!incident) {
    return (
      <div className="incident-page-empty">
        <div className="empty-card card-base">
          <h2>No Incident Selected</h2>
          <p>Please select an active or past incident from the Dashboard or Feed to inspect deep-dive telemetry.</p>
        </div>
      </div>
    );
  }

  const handleManualExecute = async () => {
    if (incident.human_approval_required && incident.human_approval !== 'APPROVED') {
      onRequestApproval(incident);
      return;
    }

    setExecuting(true);
    try {
      await onExecuteRecovery(
        incident.recommended_action || 'RESTART_BACKEND',
        incident.incident_id
      );
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="incident-page">
      {/* Top Title Bar */}
      <div className="incident-page-header card-base">
        <div className="header-info">
          <div className="id-row">
            <span className="inc-id">{incident.incident_id}</span>
            <span className={`badge ${incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
              {incident.severity}
            </span>
            <span className="badge badge-info">{incident.status}</span>
          </div>
          <h1 className="inc-title">{(incident.type || '').replace('_', ' ').toUpperCase()}</h1>
          <span className="inc-time">Detected at: {incident.timestamp}</span>
        </div>

        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowReport(!showReport)}
          >
            📜 {showReport ? 'Hide Audit Report' : 'View Post-Mortem Report'}
          </button>
        </div>
      </div>

      {showReport ? (
        <IncidentReport incident={incident} onClose={() => setShowReport(false)} />
      ) : (
        <>
          {/* 9-Stage Lifecycle Stepper */}
          <TimelineStepper incident={incident} />

          {/* Incident Content Grid */}
          <div className="incident-grid">
            <div className="grid-left">
              {/* AI RCA Engine Card */}
              <AiRcaSection 
                rootCause={incident.root_cause}
                confidence={incident.confidence}
                riskLevel={incident.risk_level}
                recommendedAction={incident.recommended_action}
                recoveryAction={incident.recovery_action}
                verification={incident.verification}
              />

              {/* Multi-Attempt Replanning View if applicable */}
              {incident.attempts && incident.attempts.length > 1 && (
                <ReplanningView attempts={incident.attempts} />
              )}

              {/* Verification Panel */}
              <VerificationPanel 
                verification={incident.verification} 
                services={health?.services}
                metrics={metrics}
              />
            </div>

            <div className="grid-right">
              {/* Investigation Evidence */}
              <EvidencePanel evidence={incident.evidence} />

              {/* Recovery Action Control Card */}
              <div className="recovery-action-card card-base">
                <div className="panel-header">
                  <h3 className="panel-title">RECOVERY CONTROL ENGINE</h3>
                </div>

                <div className="recovery-card-body">
                  <div className="action-row">
                    <span className="action-label">RECOMMENDED ACTION:</span>
                    <span className="action-code">{incident.recommended_action || 'RESTART_BACKEND'}</span>
                  </div>

                  <div className="status-note">
                    {incident.human_approval_required ? (
                      <span className="approval-req-tag">
                        ⚠️ HIGH RISK: Human approval required before execution.
                      </span>
                    ) : (
                      <span className="auto-recovery-tag">
                        ✓ LOW RISK: Autonomous execution permitted.
                      </span>
                    )}
                  </div>

                  {incident.final_status === 'RESOLVED' ? (
                    <div className="resolved-banner">
                      <span>✓ RECOVERY EXECUTED & VERIFIED RESOLVED</span>
                    </div>
                  ) : (
                    <button
                      className={`btn ${incident.human_approval_required ? 'btn-danger' : 'btn-primary'} btn-lg action-exec-btn`}
                      onClick={handleManualExecute}
                      disabled={executing}
                    >
                      {executing 
                        ? 'Executing Recovery...' 
                        : incident.human_approval_required 
                        ? '⚠️ REVIEW & APPROVE RECOVERY' 
                        : '⚡ EXECUTE RECOVERY ACTION NOW'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IncidentPage;
