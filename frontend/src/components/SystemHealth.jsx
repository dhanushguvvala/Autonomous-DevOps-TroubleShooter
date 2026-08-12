import React from 'react';
import './SystemHealth.css';

function SystemHealth({ services = {} }) {
  const getStatusInfo = (status, defaultText) => {
    switch ((status || '').toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'connected':
      case 'running':
        return { class: 'healthy', label: defaultText || 'HEALTHY', dotClass: 'healthy' };
      case 'degraded':
      case 'warning':
        return { class: 'degraded', label: 'DEGRADED', dotClass: 'degraded' };
      case 'down':
      case 'offline':
      case 'failed':
        return { class: 'down', label: 'DOWN', dotClass: 'down' };
      default:
        return { class: 'unknown', label: 'UNKNOWN', dotClass: 'unknown' };
    }
  };

  const backend = getStatusInfo(services.backend, 'ONLINE');
  const database = getStatusInfo(services.database, 'CONNECTED');
  const worker = getStatusInfo(services.worker, 'RUNNING');

  return (
    <div className="system-health-panel card-base">
      <div className="panel-header">
        <h3 className="panel-title">SYSTEM HEALTH</h3>
        <span className="panel-subtitle">ShopFlow Core Services</span>
      </div>

      <div className="health-grid">
        {/* Backend Service Card */}
        <div className={`health-card ${backend.class}`}>
          <div className="health-card-top">
            <span className="service-name">BACKEND API</span>
            <span className={`pulse-dot ${backend.dotClass}`}></span>
          </div>
          <div className="service-status-text">
            ● {backend.label}
          </div>
          <div className="service-detail">FastAPI Application Server</div>
        </div>

        {/* Database Card */}
        <div className={`health-card ${database.class}`}>
          <div className="health-card-top">
            <span className="service-name">DATABASE</span>
            <span className={`pulse-dot ${database.dotClass}`}></span>
          </div>
          <div className="service-status-text">
            ● {database.label}
          </div>
          <div className="service-detail">PostgreSQL Partitioned Cluster</div>
        </div>

        {/* Worker Card */}
        <div className={`health-card ${worker.class}`}>
          <div className="health-card-top">
            <span className="service-name">ASYNC WORKER</span>
            <span className={`pulse-dot ${worker.dotClass}`}></span>
          </div>
          <div className="service-status-text">
            ● {worker.label}
          </div>
          <div className="service-detail">Celery Job Queue Consumer</div>
        </div>
      </div>
    </div>
  );
}

export default SystemHealth;
