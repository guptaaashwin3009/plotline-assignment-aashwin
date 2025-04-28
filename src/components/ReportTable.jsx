import React from 'react';

export default function ReportTable({ completed }) {
  if (!completed.length) return null;
  return (
    <div style={{ margin: '2rem 0' }}>
      <h3>Arrived & Departed Trains</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Train Number</th>
            <th>Priority</th>
            <th>Scheduled Arrival</th>
            <th>Actual Arrival</th>
            <th>Scheduled Departure</th>
            <th>Actual Departure</th>
          </tr>
        </thead>
        <tbody>
          {completed.map(t => (
            <tr key={t.trainNumber + t.actualDeparture}>
              <td>{t.trainNumber}</td>
              <td>{t.priority}</td>
              <td>{t.arrivalTime || t.scheduledArrival}</td>
              <td>{t.actualArrival ? new Date(t.actualArrival).toLocaleTimeString() : ''}</td>
              <td>{t.departureTime || t.scheduledDeparture}</td>
              <td>{t.actualDeparture ? new Date(t.actualDeparture).toLocaleTimeString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 