import React from 'react';
import './ServiceStatusTable.css';

function ServiceStatusTable({ services = {}, onSelectService }) {
  const serviceList = [
    {
      id: 'api-gateway',
      name: 'API Gateway',
      status: services.backend === 'down' ? 'CRITICAL' : 'Healthy',
      cpu: services.backend === 'down' ? '98%' : '32%',
      memory: '48%',
      latency: services.backend === 'down' ? '850ms' : '82ms',
      errorRate: services.backend === 'down' ? '14.2%' : '0.01%',
    },
    {
      id: 'payment-service',
      name: 'Payment Service',
      status: services.database === 'down' ? 'CRITICAL' : services.backend === 'down' ? 'Warning' : 'Healthy',
      cpu: services.database === 'down' ? '88%' : '44%',
      memory: services.database === 'down' ? '76%' : '52%',
      latency: services.database === 'down' ? '1240ms' : '142ms',
      errorRate: services.database === 'down' ? '8.4%' : '0.04%',
    },
    {
      id: 'order-service',
      name: 'Order Service',
      status: 'Healthy',
      cpu: '41%',
      memory: '52%',
      latency: '106ms',
      errorRate: '0.03%',
    },
    {
      id: 'auth-service',
      name: 'Auth Service',
      status: 'Healthy',
      cpu: '27%',
      memory: '39%',
      latency: '74ms',
      errorRate: '0.01%',
    },
    {
      id: 'postgres-db',
      name: 'PostgreSQL Database Cluster',
      status: services.database === 'down' ? 'CRITICAL' : 'Healthy',
      cpu: services.database === 'down' ? '94%' : '38%',
      memory: '64%',
      latency: services.database === 'down' ? '980ms' : '45ms',
      errorRate: services.database === 'down' ? '12.8%' : '0.00%',
    },
    {
      id: 'celery-worker',
      name: 'Async Worker Queue',
      status: services.worker === 'down' ? 'CRITICAL' : 'Healthy',
      cpu: services.worker === 'down' ? '99%' : '29%',
      memory: services.worker === 'down' ? '91%' : '46%',
      latency: '110ms',
      errorRate: services.worker === 'down' ? '6.1%' : '0.02%',
    },
  ];

  return (
    <div className="service-status-table-panel card-base">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">SERVICE HEALTH MATRIX</h3>
          <span className="panel-subtitle">Datadog-style Microservices Performance Grid</span>
        </div>
        <span className="badge badge-info">6 MONITORED ENDPOINTS</span>
      </div>

      <div className="table-wrapper">
        <table className="services-grid-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Status</th>
              <th>CPU Load</th>
              <th>Memory</th>
              <th>P99 Latency</th>
              <th>Error Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {serviceList.map((svc) => {
              const isDanger = svc.status === 'CRITICAL' || svc.status === 'Down';
              const isWarning = svc.status === 'Warning' || svc.status === 'Degraded';

              return (
                <tr key={svc.id} className={`service-row ${isDanger ? 'row-danger' : isWarning ? 'row-warning' : ''}`}>
                  <td className="svc-name-cell">
                    <span className={`pulse-dot ${isDanger ? 'down' : isWarning ? 'degraded' : 'healthy'}`}></span>
                    <span className="svc-title">{svc.name}</span>
                  </td>
                  <td>
                    <span className={`badge ${isDanger ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-healthy'}`}>
                      {svc.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="mono-cell">{svc.cpu}</td>
                  <td className="mono-cell">{svc.memory}</td>
                  <td className="mono-cell">{svc.latency}</td>
                  <td className={`mono-cell ${isDanger ? 'err-text' : ''}`}>{svc.errorRate}</td>
                  <td>
                    <button 
                      className="btn btn-outline btn-sm inspect-btn"
                      onClick={() => onSelectService && onSelectService(svc)}
                    >
                      Inspect ➔
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServiceStatusTable;
