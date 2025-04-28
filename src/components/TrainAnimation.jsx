import React from 'react';
import { formatTime } from '../utils/priorityUtils';

export default function TrainAnimation({ train, type, onComplete }) {
  const [position, setPosition] = React.useState(type === 'incoming' ? -100 : 100);
  const [opacity, setOpacity] = React.useState(1);

  React.useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (type === 'incoming') {
        setPosition(-100 + (progress * 200)); // Move from -100 to 100
      } else {
        setPosition(100 - (progress * 200)); // Move from 100 to -100
      }
      
      if (progress === 1) {
        setOpacity(0);
        setTimeout(onComplete, 500); // Wait for fade out
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [type, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position}%`,
        top: '50%',
        transform: 'translateY(-50%)',
        background: type === 'incoming' ? '#4CAF50' : '#f44336',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        opacity,
        transition: 'opacity 0.5s',
        whiteSpace: 'nowrap',
        zIndex: 1000,
      }}
    >
      {train.trainNumber} - {type === 'incoming' ? 'Arriving' : 'Departing'}
      <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
        {formatTime(type === 'incoming' ? train.actualArrival : train.actualDeparture)}
      </div>
    </div>
  );
} 