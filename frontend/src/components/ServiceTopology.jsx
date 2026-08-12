import React from 'react';
import './ServiceTopology.css';

function ServiceTopology({ services = {} }) {
  const isBackendDown = services.backend === 'down';
  const isDbDown = services.database === 'down';
  const isWorkerDown = services.worker === 'down';

  return (
    <div className="service-topology-panel card-base">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">SERVICE TOPOLOGY GRAPH</h3>
          <span className="panel-subtitle">Microservice Dependency Mapping & Incident Propagation Path</span>
        </div>
        <div className="topology-legend">
          <span className="legend-item"><span className="pulse-dot healthy"></span> Operational</span>
          <span className="legend-item"><span className="pulse-dot down"></span> Incident Node</span>
        </div>
      </div>

      <div className="topology-graph-container">
        {/* Row 1: Ingress Gateway */}
        <div className="topology-tier tier-ingress">
          <div className={`topology-node ${isBackendDown ? 'node-critical' : 'node-healthy'}`}>
            <span className="node-icon">🌐</span>
            <div className="node-info">
              <span className="node-title">API Gateway</span>
              <span className="node-sub">nginx / Envoy (Inbound)</span>
            </div>
            <span className={`pulse-dot ${isBackendDown ? 'down' : 'healthy'}`}></span>
          </div>
        </div>

        <div className="topology-connector-v">
          <div className={`connector-line ${isBackendDown || isDbDown ? 'line-alert' : ''}`}></div>
        </div>

        {/* Row 2: Core Microservices */}
        <div className="topology-tier tier-services">
          <div className={`topology-node ${isBackendDown ? 'node-critical' : 'node-healthy'}`}>
            <span className="node-icon">⚡</span>
            <div className="node-info">
              <span className="node-title">FastAPI Backend</span>
              <span className="node-sub">ShopFlow Core Service</span>
            </div>
            <span className={`pulse-dot ${isBackendDown ? 'down' : 'healthy'}`}></span>
          </div>

          <div className={`topology-node ${isDbDown ? 'node-critical' : 'node-healthy'}`}>
            <span className="node-icon">💳</span>
            <div className="node-info">
              <span className="node-title">Payment Service</span>
              <span className="node-sub">Transaction Processor</span>
            </div>
            <span className={`pulse-dot ${isDbDown ? 'down' : 'healthy'}`}></span>
          </div>

          <div className="topology-node node-healthy">
            <span className="node-icon">🛒</span>
            <div className="node-info">
              <span className="node-title">Order Service</span>
              <span className="node-sub">Cart & Catalog</span>
            </div>
            <span className="pulse-dot healthy"></span>
          </div>

          <div className="topology-node node-healthy">
            <span className="node-icon">🔑</span>
            <div className="node-info">
              <span className="node-title">Auth Service</span>
              <span className="node-sub">JWT & OAuth2</span>
            </div>
            <span className="pulse-dot healthy"></span>
          </div>
        </div>

        <div className="topology-connector-v">
          <div className={`connector-line ${isDbDown || isWorkerDown ? 'line-alert' : ''}`}></div>
        </div>

        {/* Row 3: Persistence & Async Queues */}
        <div className="topology-tier tier-storage">
          <div className={`topology-node ${isDbDown ? 'node-critical' : 'node-healthy'}`}>
            <span className="node-icon">🗄️</span>
            <div className="node-info">
              <span className="node-title">PostgreSQL Database</span>
              <span className="node-sub">Primary Data Cluster</span>
            </div>
            <span className={`pulse-dot ${isDbDown ? 'down' : 'healthy'}`}></span>
          </div>

          <div className={`topology-node ${isWorkerDown ? 'node-critical' : 'node-healthy'}`}>
            <span className="node-icon">⚙️</span>
            <div className="node-info">
              <span className="node-title">Celery Worker Queue</span>
              <span className="node-sub">Background Task Handler</span>
            </div>
            <span className={`pulse-dot ${isWorkerDown ? 'down' : 'healthy'}`}></span>
          </div>

          <div className="topology-node node-healthy">
            <span className="node-icon">🚀</span>
            <div className="node-info">
              <span className="node-title">Redis Cache</span>
              <span className="node-sub">In-Memory Session Store</span>
            </div>
            <span className="pulse-dot healthy"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceTopology;
