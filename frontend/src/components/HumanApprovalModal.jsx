import React, { useState } from 'react';
import './HumanApprovalModal.css';

function HumanApprovalModal({ incident, onApprove, onReject, onClose }) {
  const [submitting, setSubmitting] = useState(false);

  if (!incident) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(incident.incident_id, incident.recommended_action || 'RESTORE_DB_CONNECTION');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await onReject(incident.incident_id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const confidencePercent = incident.confidence ? Math.round(incident.confidence * 100) : 88;

  return (
    <div className="modal-overlay">
      <div className="modal-content card-base">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-warning-icon">⚠</span>
            <div>
              <h2 className="modal-title">HUMAN APPROVAL REQUIRED</h2>
              <span className="modal-subtitle">High-Risk Incident Safeguard Engine</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="approval-incident-summary">
            <span className="approval-id">{incident.incident_id}</span>
            <h3 className="approval-type">{(incident.type || 'DATABASE_FAILURE').replace('_', ' ').toUpperCase()}</h3>
          </div>

          <div className="approval-detail-box">
            <span className="box-label">ROOT CAUSE IDENTIFIED</span>
            <p className="box-value">{incident.root_cause || 'Database connectivity failure & stale locks'}</p>
          </div>

          <div className="approval-stats-grid">
            <div className="stat-box">
              <span className="stat-label">AI CONFIDENCE</span>
              <span className="stat-value">{confidencePercent}%</span>
            </div>
            <div className="stat-box danger">
              <span className="stat-label">RISK LEVEL</span>
              <span className="stat-value">{incident.risk_level || 'HIGH'}</span>
            </div>
          </div>

          <div className="approval-action-box">
            <span className="box-label">PROPOSED RECOVERY ACTION</span>
            <span className="proposed-action-name">
              {incident.recommended_action || 'RESTORE_DB_CONNECTION'}
            </span>
          </div>

          {incident.evidence && incident.evidence.length > 0 && (
            <div className="approval-evidence-box">
              <span className="box-label">SUPPORTING EVIDENCE</span>
              <ul className="evidence-bullets">
                {incident.evidence.map((ev, i) => (
                  <li key={i}>✓ {ev}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-outline modal-btn" 
            onClick={handleReject}
            disabled={submitting}
          >
            ❌ REJECT ACTION
          </button>
          <button 
            className="btn btn-danger modal-btn approve-btn" 
            onClick={handleApprove}
            disabled={submitting}
          >
            {submitting ? 'Executing...' : '✅ APPROVE RECOVERY'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HumanApprovalModal;
