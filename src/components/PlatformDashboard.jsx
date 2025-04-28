import React from 'react';
import { formatTime } from '../utils/priorityUtils';

function getTimeDiffString(future, now) {
  let diff = Math.max(0, Math.floor((future - now) / 1000));
  const h = String(Math.floor(diff / 3600)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function PlatformDashboard({ platforms, now }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '2rem 0' }}>
      {platforms.map((slot, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #aaa',
            borderRadius: 6,
            padding: 12,
            minHeight: 48,
            background: '#f9f9f9',
            position: 'relative',
            transition: 'background 0.5s',
            boxShadow: slot && slot.train ? '0 0 8px #2a7a' : 'none',
            opacity: slot && slot.train ? 1 : 0.7,
          }}
        >
          <div style={{ fontWeight: 600 }}>Platform {idx + 1}</div>
          {slot && slot.train ? (
            <div
              style={{
                transition: 'all 0.5s',
                color: '#2a7',
                fontWeight: 500,
                animation: 'fadein 0.7s',
              }}
            >
              {slot.train.trainNumber} - {slot.train.priority}
              {' | Arrival: '}{formatTime(slot.train.actualArrival)}
              {' | Departure: '}{formatTime(slot.train.actualDeparture)}
              {' | Departs in '}{getTimeDiffString(slot.train.actualDeparture, now)}
            </div>
          ) : (
            <div style={{ color: '#aaa', animation: 'fadeout 0.7s' }}>Free</div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeout { from { opacity: 1; } to { opacity: 0.5; } }
      `}</style>
    </div>
  );
} 