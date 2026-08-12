import React, { useState } from 'react';
import './IncidentHistory.css';
import IncidentReport from './IncidentReport';

function IncidentHistory({ incidents = [], onSelectIncident }) {
  const [selectedForReport, setSelectedForReport] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = incidents.filter(i => {
    if (filterSeverity === 'ALL') return true;
    return i.severity === filterSeverity;
  });

  return (
    <div className="incident-history-container card-base">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">INCIDENT AUDIT HISTORY</h3>
          <span className="panel-subtitle">Historical DevOps Failure & Remediation Logs</span>
        </div>

        <div className="history-filter-group">
          <label className="filter-label">Filter Severity:</label>
          <select 
            className="filter-select"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {selectedForReport ? (
        <IncidentReport incident={selectedForReport} onClose={() => setSelectedForReport(null)} />
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Timestamp</th>
                <th>Incident Type</th>
                <th>Severity</th>
                <th>Root Cause</th>
                <th>Recovery Action</th>
                <th>Verification</th>
                <th>Audit Report</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-history-cell">
                    No historical incidents match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.incident_id} className="history-row">
                    <td>
                      <span className="inc-id-tag">{inc.incident_id}</span>
                    </td>
                    <td className="time-cell">{inc.timestamp}</td>
                    <td>
                      <span className="type-tag">{(inc.type || '').replace('_', ' ').toUpperCase()}</span>
                    </td>
                    <td>
                      <span className={`badge ${inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                        {inc.severity || 'HIGH'}
                      </span>
                    </td>
                    <td className="cause-cell">
                      {inc.root_cause || 'Process failure detected'}
                    </td>
                    <td className="action-cell">
                      <code>{inc.recovery_action || inc.recommended_action || 'RESTART_BACKEND'}</code>
                    </td>
                    <td>
                      <span className="badge badge-healthy">
                        {inc.verification || 'PASSED'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedForReport(inc)}
                      >
                        📜 Post-Mortem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default IncidentHistory;
