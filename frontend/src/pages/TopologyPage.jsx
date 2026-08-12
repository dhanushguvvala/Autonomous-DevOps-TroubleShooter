import React from 'react';
import './TopologyPage.css';
import ServiceTopology from '../components/ServiceTopology';

function TopologyPage({ health }) {
  return (
    <div className="topology-page">
      <div className="page-title-header">
        <div>
          <h1 className="page-main-title">Service Topology & Fault Propagation</h1>
          <p className="page-sub-title">Real-time microservice dependency graph & automated fault path correlation.</p>
        </div>
      </div>

      <ServiceTopology services={health?.services} />
    </div>
  );
}

export default TopologyPage;
