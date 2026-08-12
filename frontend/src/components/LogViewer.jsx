import React, { useState } from 'react';
import './LogViewer.css';

function LogViewer({ logs = [] }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultLogs = logs && logs.length > 0 ? logs : [
    { timestamp: '14:32:00', level: 'INFO', service: 'api-gateway', message: 'HTTP GET /api/v1/orders 200 OK (34ms)' },
    { timestamp: '14:32:04', level: 'INFO', service: 'payment-service', message: 'Request received for transaction #TX-90214' },
    { timestamp: '14:32:07', level: 'WARN', service: 'postgres-db', message: 'Database connection pool utilization at 87% (87/100)' },
    { timestamp: '14:32:09', level: 'ERROR', service: 'payment-service', message: 'Connection timeout on PostgreSQL primary pool socket' },
    { timestamp: '14:32:11', level: 'ERROR', service: 'payment-service', message: 'Retry limit (3/3) exceeded. Aborting transaction' },
    { timestamp: '14:32:14', level: 'CRITICAL', service: 'ShopFlow-Monitor', message: 'CRITICAL: Payment transaction processing failure cascade detected' },
    { timestamp: '14:32:18', level: 'INFO', service: 'RCA-Agent', message: 'Autonomous RCA Agent correlates log trace #TR-8819 -> Connection pool exhaustion' },
  ];

  const filteredLogs = defaultLogs.filter(item => {
    if (filterLevel !== 'ALL' && item.level !== filterLevel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.message.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.timestamp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = () => {
    const text = filteredLogs.map(l => `${l.timestamp} [${l.level}] ${l.service}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="log-viewer-panel card-base">
      <div className="panel-header">
        <div className="title-group">
          <span className="terminal-icon">💻</span>
          <div>
            <h3 className="panel-title">PRODUCTION LOG CONSOLE</h3>
            <span className="panel-subtitle">Real-time Stream • ShopFlow Microservices Telemetry Logs</span>
          </div>
        </div>

        <div className="log-toolbar">
          {/* Search Input */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Filter logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="log-search-input"
            />
          </div>

          {/* Level Filter */}
          <select 
            className="log-level-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          {/* Pause / Live Stream Button */}
          <button 
            className={`btn btn-outline btn-sm ${isPaused ? '' : 'live-stream-btn'}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶ Resume Live Stream' : '⏸ Pause Live Stream'}
          </button>

          {/* Copy Logs Button */}
          <button className="btn btn-outline btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy Logs'}
          </button>
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="terminal-window">
        <div className="terminal-topbar">
          <span className="window-dot red"></span>
          <span className="window-dot yellow"></span>
          <span className="window-dot green"></span>
          <span className="window-title">bash - shopflow-tail-logs --follow</span>
        </div>

        <div className="terminal-body">
          {filteredLogs.length === 0 ? (
            <div className="empty-logs">No logs matching filter criteria.</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className={`log-line level-${log.level.toLowerCase()}`}>
                <span className="log-time">{log.timestamp}</span>
                <span className={`log-level-tag level-${log.level.toLowerCase()}`}>{log.level}</span>
                <span className="log-svc">[{log.service}]</span>
                <span className="log-msg">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LogViewer;
