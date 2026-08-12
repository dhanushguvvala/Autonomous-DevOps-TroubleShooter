import React from 'react';
import './LogsPage.css';
import LogViewer from '../components/LogViewer';

function LogsPage({ logs }) {
  return (
    <div className="logs-page">
      <LogViewer logs={logs} />
    </div>
  );
}

export default LogsPage;
