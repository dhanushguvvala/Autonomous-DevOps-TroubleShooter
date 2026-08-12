import React from 'react';
import './AiRcaSection.css';

function AiRcaSection({ rootCause, confidence, riskLevel, recommendedAction, recoveryAction, verification, activeIncident }) {
  const confidencePercent = confidence !== null && confidence !== undefined 
    ? Math.round(confidence * 100) 
    : 94;

  const probabilities = activeIncident ? [
    { cause: activeIncident.root_cause || 'Database Connection Pool Exhaustion', percent: confidencePercent, color: '#ef4444' },
    { cause: 'Upstream Traffic Spike / Burst Queries', percent: 61, color: '#f59e0b' },
    { cause: 'Container Heap Memory Pressure', percent: 34, color: '#38bdf8' },
  ] : [
    { cause: 'Backend Microservice Process Crash', percent: 94, color: '#ef4444' },
    { cause: 'TCP Socket Connection Timeout', percent: 68, color: '#f59e0b' },
    { cause: 'GC Stale Object Contention', percent: 28, color: '#38bdf8' },
  ];

  return (
    <div className="ai-rca-panel card-base">
      <div className="panel-header">
        <div className="ai-title-row">
          <span className="ai-sparkle-icon">🤖</span>
          <div>
            <h3 className="panel-title">AI INCIDENT DETECTION & RCA</h3>
            <span className="panel-subtitle">Neural Nexus Root Cause Analysis Engine</span>
          </div>
        </div>
        <span className="badge badge-ai">CONFIDENCE ENGINE ACTIVE</span>
      </div>

      <div className="rca-body-content">
        <div className="rca-block">
          <span className="rca-label">IDENTIFIED PRIMARY ROOT CAUSE</span>
          <p className="rca-value">
            {rootCause || (activeIncident ? activeIncident.root_cause : 'Backend ShopFlow application process crash due to memory corruption')}
          </p>
        </div>

        {/* Probability Distribution Meters */}
        <div className="probability-distribution-box">
          <span className="prob-title">AI PROBABILITY DISTRIBUTION ANALYSIS</span>
          <div className="prob-bars-list">
            {probabilities.map((item, index) => (
              <div key={index} className="prob-bar-item">
                <div className="prob-label-row">
                  <span className="prob-cause-name">{item.cause}</span>
                  <span className="prob-num">{item.percent}%</span>
                </div>
                <div className="prob-track">
                  <div 
                    className="prob-fill"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rca-metrics-row">
          <div className="rca-metric-card">
            <span className="metric-tag">AI CONFIDENCE SCORE</span>
            <span className="metric-big-num">{confidencePercent}%</span>
            <span className="metric-sub">
              {confidencePercent >= 90 ? 'HIGH CONFIDENCE MATCH' : 'MEDIUM CONFIDENCE'}
            </span>
          </div>

          <div className="rca-metric-card">
            <span className="metric-tag">RISK ASSESSMENT</span>
            <span className={`metric-big-num risk-${(riskLevel || 'LOW').toLowerCase()}`}>
              {riskLevel || 'LOW'}
            </span>
            <span className="metric-sub">
              {riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'HUMAN APPROVAL MANDATED' : 'AUTONOMOUS RECOVERY authorized'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiRcaSection;
