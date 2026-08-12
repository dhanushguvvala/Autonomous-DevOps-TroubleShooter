import React from 'react';
import './TimelineStepper.css';

const STAGES = [
  { id: 1, key: 'DETECT', label: '1. Detect Anomaly' },
  { id: 2, key: 'ANALYZE', label: '2. Analyze Signals' },
  { id: 3, key: 'DIAGNOSE', label: '3. Diagnose RCA' },
  { id: 4, key: 'REMEDIATE', label: '4. Remediate' },
  { id: 5, key: 'VERIFY', label: '5. Verify SLA' },
];

function TimelineStepper({ incident }) {
  if (!incident) return null;

  // Compute step index 1..5
  let currentStep = 1;
  if (incident.final_status === 'RESOLVED' || incident.verification === 'PASSED') {
    currentStep = 5;
  } else if (incident.status === 'RECOVERY_EXECUTED' || incident.recovery_action) {
    currentStep = 4;
  } else if (incident.root_cause || incident.confidence) {
    currentStep = 3;
  } else if (incident.status === 'INVESTIGATING') {
    currentStep = 2;
  }

  return (
    <div className="timeline-stepper-panel card-base">
      <div className="panel-header">
        <h3 className="panel-title">AUTONOMOUS WORKFLOW TIMELINE</h3>
        <span className="panel-subtitle">Detect ➔ Analyze ➔ Diagnose ➔ Remediate ➔ Verify</span>
      </div>

      <div className="stepper-track">
        {STAGES.map((stage) => {
          const isPassed = stage.id < currentStep || (stage.id === 5 && currentStep === 5);
          const isCurrent = stage.id === currentStep && currentStep < 5;
          const isPending = stage.id > currentStep;

          return (
            <div key={stage.key} className={`stepper-item ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}>
              <div className="stepper-node">
                {isPassed ? (
                  <span className="node-icon">✓</span>
                ) : isCurrent ? (
                  <span className="node-icon pulse-current">⏳</span>
                ) : (
                  <span className="node-number">{stage.id}</span>
                )}
              </div>
              <span className="stepper-label">{stage.label}</span>
              {stage.id < 5 && <div className={`stepper-line ${isPassed ? 'passed' : ''}`}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelineStepper;
