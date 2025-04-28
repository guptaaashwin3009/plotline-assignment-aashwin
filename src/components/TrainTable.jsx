import React from "react";

export default function TrainTable({ waiting }) {
  if (!waiting.length) return null;
  return (
    <div style={{ margin: "2rem 0" }}>
      <h3>Waiting Trains</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Train Number</th>
            <th>Priority</th>
            <th>Scheduled Arrival</th>
            <th>Scheduled Departure</th>
          </tr>
        </thead>
        <tbody>
          {waiting.map((t) => (
            <tr key={t.trainNumber} style={{ transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)', animation: 'fadein 0.7s', opacity: 1 }}>
              <td>{t.trainNumber}</td>
              <td>{t.priority}</td>
              <td>{t.arrivalTime || t.scheduledArrival}</td>
              <td>{t.departureTime || t.scheduledDeparture}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeout { from { opacity: 1; } to { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
