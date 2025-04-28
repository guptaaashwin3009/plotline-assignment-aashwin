import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/priorityUtils';
import TrainAnimation from './TrainAnimation';

function getTimeDiffString(future, now) {
  let diff = Math.max(0, Math.floor((future - now) / 1000));
  const h = String(Math.floor(diff / 3600)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function isTrainDelayed(train) {
  if (!train.actualArrival || !train.scheduledArrival) return false;
  return train.actualArrival > train.scheduledArrival;
}

export default function PlatformDashboard({ platforms, now, waiting }) {
  const [animations, setAnimations] = useState([]);
  const [prevPlatforms, setPrevPlatforms] = useState(platforms);

  useEffect(() => {
    // Check for new arrivals
    platforms.forEach((slot, idx) => {
      const prevSlot = prevPlatforms[idx];
      if (slot && slot.train && (!prevSlot || !prevSlot.train)) {
        // New train arrived
        setAnimations(prev => [...prev, { 
          id: slot.train.trainNumber + '-' + (slot.train.actualArrival ? formatTime(slot.train.actualArrival) : ''),
          train: slot.train, 
          type: 'incoming',
          platformIdx: idx 
        }]);
      }
    });

    // Check for departures
    prevPlatforms.forEach((slot, idx) => {
      if (slot && slot.train && (!platforms[idx] || !platforms[idx].train)) {
        // Train departed
        const animId = slot.train.trainNumber + '-' + (slot.train.actualDeparture ? formatTime(slot.train.actualDeparture) : '');
        setAnimations(prev => {
          // Prevent duplicate departing animations for the same train event
          if (prev.some(a => a.id === animId && a.type === 'departing')) return prev;
          return [...prev, { 
            id: animId, 
            train: slot.train, 
            type: 'departing',
            platformIdx: idx 
          }];
        });
      }
    });

    setPrevPlatforms(platforms);
  }, [platforms]);

  const removeAnimation = (id) => {
    setAnimations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '2rem 0', position: 'relative' }}>
      {platforms.map((slot, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #aaa',
            borderRadius: 6,
            padding: 12,
            minHeight: 48,
            background: slot && slot.train 
              ? isTrainDelayed(slot.train) 
                ? '#ffebee' // Light red for delayed trains
                : '#e8f5e9' // Light green for on-time trains
              : '#f9f9f9',
            position: 'relative',
            transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: slot && slot.train ? '0 0 8px #2a7a' : 'none',
            opacity: slot && slot.train ? 1 : 0.7,
            overflow: 'hidden',
          }}
        >
          <div style={{ fontWeight: 600 }}>Platform {idx + 1}</div>
          {slot && slot.train ? (
            <div
              style={{
                transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
                color: isTrainDelayed(slot.train) ? '#d32f2f' : '#2e7d32',
                fontWeight: 500,
                animation: 'fadein 0.7s',
                opacity: 1,
              }}
            >
              {slot.train.trainNumber} - {slot.train.priority}
              {' | Arrival: '}{formatTime(slot.train.actualArrival)}
              {' | Departure: '}{formatTime(slot.train.actualDeparture)}
              {' | Departs in '}{getTimeDiffString(slot.train.actualDeparture, now)}
              {isTrainDelayed(slot.train) && (
                <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#d32f2f' }}>
                  (Delayed)
                </span>
              )}
            </div>
          ) : (
            <div style={{ color: '#aaa', animation: 'fadeout 0.7s', opacity: 0.7 }}>Free</div>
          )}
        </div>
      ))}
      
      {animations.map(animation => (
        <TrainAnimation
          key={animation.id}
          train={animation.train}
          type={animation.type}
          onComplete={() => removeAnimation(animation.id)}
        />
      ))}

      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeout { from { opacity: 1; } to { opacity: 0.5; } }
      `}</style>
    </div>
  );
} 