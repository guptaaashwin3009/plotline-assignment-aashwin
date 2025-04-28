import React from 'react';

export default function PlatformDashboard({ platforms, now }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '2rem 0' }}>
      {platforms.map((slot, idx) => (
        <div key={idx} style={{ border: '1px solid #aaa', borderRadius: 6, padding: 12, minHeight: 48, background: '#f9f9f9', position: 'relative' }}>
          <div style={{ fontWeight: 600 }}>Platform {idx + 1}</div>
          {slot && slot.train ? (
            <div style={{ transition: 'all 0.5s', color: '#2a7', fontWeight: 500 }}>
              {slot.train.trainNumber} - {slot.train.priority} | Departs in {Math.max(0, Math.ceil((slot.train.actualDeparture - now) / 1000))}s
            </div>
          ) : (
            <div style={{ color: '#aaa' }}>Free</div>
          )}
        </div>
      ))}
    </div>
  );
} 