import React from 'react';
import './IncidentFeed.css';

function IncidentFeed({ incidents = [], activeIncident, onSelectIncident }) {
  return (
    <div className="incident-feed-panel card-base">
      <div className="panel-header">
        <h3 className="panel-title">INCIDENT FEED</h3>
        <span className="panel-subtitle">{incidents.length} Total Registered Events</span>
      </div>

      {incidents.length === 0 ? (
        <div className="empty-feed">
          <span className="empty-icon">🟢</span>
          <p>No incidents recorded in current session.</p>
        </div>
      ) : (
        <div className="feed-list">
          {incidents.map((incident) => {
            const isActive = activeIncident && activeIncident.incident_id === incident.incident_id;
            const isResolved = incident.final_status === 'RESOLVED' || incident.status === 'RESOLVED';

            return (
              <div
                key={incident.incident_id}
                className={`feed-item ${isActive ? 'active' : ''} ${isResolved ? 'resolved' : 'open'}`}
                onClick={() => onSelectIncident(incident)}
              >
                <div className="feed-item-left">
                  <span className={`pulse-dot ${isResolved ? 'healthy' : 'down'}`}></span>
                  <div className="feed-item-info">
                    <div className="feed-id-row">
                      <span className="feed-id">{incident.incident_id}</span>
                      <span className="feed-type">{(incident.type || '').replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <span className="feed-cause">
                      {incident.root_cause || 'AI Agent investigating system anomalies...'}
                    </span>
                  </div>
                </div>

                <div className="feed-item-right">
                  <span className={`badge ${incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                    {incident.severity}
                  </span>
                  <span className={`badge ${isResolved ? 'badge-healthy' : 'badge-info'}`}>
                    {isResolved ? 'RESOLVED' : incident.status || 'ACTIVE'}
                  </span>
                  <span className="feed-time">{incident.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IncidentFeed;
