import React from 'react';
import './AiActivityFeed.css';

function AiActivityFeed({ activeIncident }) {
  const events = activeIncident ? [
    { time: 'Just now', icon: '🚨', text: `AI detected anomaly in ${activeIncident.type.replace('_', ' ').toUpperCase()}`, badge: 'ANOMALY DETECTED' },
    { time: '2s ago', icon: '🔍', text: 'Correlation engine analyzing 14 system telemetry signals', badge: 'CORRELATING' },
    { time: '4s ago', icon: '🤖', text: `Root cause confidence calculated at ${Math.round((activeIncident.confidence || 0.94) * 100)}%`, badge: 'RCA ENGINE' },
    { time: '5s ago', icon: '💡', text: `Remediation recommendation generated: ${activeIncident.recommended_action || 'RESTART_BACKEND'}`, badge: 'REMEDIATION' },
  ] : [
    { time: '1m ago', icon: '🛡️', text: 'AI Agent active: Monitoring 6 microservices & database health', badge: 'MONITORING' },
    { time: '5m ago', icon: '✓', text: 'Health assertion check completed: All baseline SLAs green', badge: 'VERIFIED' },
    { time: '12m ago', icon: '🧠', text: 'Predictive anomaly model trained on latest 1,000 trace spans', badge: 'MODEL UPDATED' },
  ];

  return (
    <div className="ai-activity-feed-panel card-base">
      <div className="panel-header">
        <div className="ai-title-row">
          <span className="sparkle-icon">🤖</span>
          <div>
            <h3 className="panel-title">AUTONOMOUS AI ACTIVITY</h3>
            <span className="panel-subtitle">Venkat AI Agent Core Execution Stream</span>
          </div>
        </div>
        <span className="pulse-dot healthy"></span>
      </div>

      <div className="activity-events-list">
        {events.map((evt, index) => (
          <div key={index} className="activity-event-item">
            <span className="evt-icon">{evt.icon}</span>
            <div className="evt-content">
              <div className="evt-header">
                <span className="evt-badge">{evt.badge}</span>
                <span className="evt-time">{evt.time}</span>
              </div>
              <p className="evt-text">{evt.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AiActivityFeed;
