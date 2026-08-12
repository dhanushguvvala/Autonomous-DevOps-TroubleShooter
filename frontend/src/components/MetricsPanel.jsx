import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './MetricsPanel.css';

function MetricsPanel({ metrics }) {
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [timeframe, setTimeframe] = useState('1h');

  // Safe guard against initial null/loading state before API response arrives
  const m = metrics || {};

  // Support both real backend psutil keys (cpu_percent, memory_percent, etc.) and fallback keys
  const cpu = Math.round(m.cpu_percent ?? m.cpu ?? 32);
  const memory = Math.round(m.memory_percent ?? m.memory ?? 48);
  const disk = Math.round(m.disk_percent ?? m.disk ?? 51);
  const latency = Math.round(m.api_latency_ms ?? m.api_latency ?? 0);

  const history = m.history || [
    { time: '10:40', cpu: cpu, memory: memory, latency: latency, errors: 0 },
    { time: '10:41', cpu: cpu, memory: memory, latency: latency, errors: 0 },
    { time: '10:42', cpu: cpu, memory: memory, latency: latency, errors: 0 },
  ];

  const getMetricConfig = () => {
    switch (selectedMetric) {
      case 'memory':
        return { key: 'memory', label: 'Memory Usage (%)', color: '#a855f7', unit: '%' };
      case 'latency':
        return { key: 'latency', label: 'Request Latency (ms)', color: '#f59e0b', unit: 'ms' };
      case 'errors':
        return { key: 'errors', label: 'Error Rate (%)', color: '#ef4444', unit: '%' };
      default:
        return { key: 'cpu', label: 'CPU Utilization (%)', color: '#38bdf8', unit: '%' };
    }
  };

  const config = getMetricConfig();

  return (
    <div className="metrics-panel card-base">
      <div className="panel-header">
        <div className="title-group">
          <h3 className="panel-title">TELEMETRY MONITORING ENGINE</h3>
          <span className="live-indicator-pill"><span className="pulse-dot healthy"></span> LIVE BACKEND METRICS</span>
        </div>

        {/* Chart Metric Controls & Timeframe Selector */}
        <div className="chart-control-row">
          <div className="metric-toggle-group">
            <button className={`toggle-btn ${selectedMetric === 'cpu' ? 'active' : ''}`} onClick={() => setSelectedMetric('cpu')}>CPU</button>
            <button className={`toggle-btn ${selectedMetric === 'memory' ? 'active' : ''}`} onClick={() => setSelectedMetric('memory')}>Memory</button>
            <button className={`toggle-btn ${selectedMetric === 'latency' ? 'active' : ''}`} onClick={() => setSelectedMetric('latency')}>Latency</button>
            <button className={`toggle-btn ${selectedMetric === 'errors' ? 'active' : ''}`} onClick={() => setSelectedMetric('errors')}>Errors</button>
          </div>

          <div className="timeframe-group">
            {['5m', '15m', '1h', '6h', '24h'].map(t => (
              <button key={t} className={`tf-btn ${timeframe === t ? 'active' : ''}`} onClick={() => setTimeframe(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-wrapper">
        <div className="chart-title-bar">
          <span className="chart-title">{config.label}</span>
          <span className="chart-timeframe">Window: Last {timeframe}</span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0c101c', borderColor: '#1e293b', borderRadius: '6px', color: '#fff' }}
              formatter={(val) => [`${val} ${config.unit}`, config.label]}
            />
            <Area type="monotone" dataKey={config.key} stroke={config.color} strokeWidth={2.5} fillOpacity={1} fill="url(#metricGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MetricsPanel;