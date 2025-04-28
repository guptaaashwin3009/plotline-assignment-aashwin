import React from 'react';
import { formatTime } from '../utils/priorityUtils';

function deduplicateByTrainNumber(trains) {
  // Keep only the last occurrence for each train number
  const map = new Map();
  trains.forEach(t => {
    map.set(t.trainNumber, t);
  });
  return Array.from(map.values());
}

export default function ReportTable({ allTrains }) {
  if (!allTrains.length) return null;
  const dedupedTrains = deduplicateByTrainNumber(allTrains);
  return (
    <div style={{ margin: '2rem 0' }}>
      <h3>Arrived & Departed Trains</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Train Number</th>
            <th>Priority</th>
            <th>Scheduled Arrival Time</th>
            <th>Actual Arrival Time</th>
            <th>Scheduled Departure Time</th>
            <th>Actual Departure Time</th>
          </tr>
        </thead>
        <tbody>
          {dedupedTrains.map(t => (
            <tr key={t.trainNumber}>
              <td>{t.trainNumber}</td>
              <td>{t.priority}</td>
              <td>{formatTime(t.scheduledArrival)}</td>
              <td>{formatTime(t.actualArrival)}</td>
              <td>{formatTime(t.scheduledDeparture)}</td>
              <td>{formatTime(t.actualDeparture)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 