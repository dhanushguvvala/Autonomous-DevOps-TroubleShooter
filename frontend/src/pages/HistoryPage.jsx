import React from 'react';
import './HistoryPage.css';
import IncidentHistory from '../components/IncidentHistory';

function HistoryPage({ incidents, onSelectIncident }) {
  return (
    <div className="history-page">
      <IncidentHistory 
        incidents={incidents} 
        onSelectIncident={onSelectIncident} 
      />
    </div>
  );
}

export default HistoryPage;
