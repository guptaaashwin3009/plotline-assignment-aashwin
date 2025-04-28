import React from 'react';

export default function PlatformSelector({ value, onChange }) {
  return (
    <div style={{ margin: '1rem 0' }}>
      <label>
        Number of Platforms:
        <input
          type="number"
          min={2}
          max={20}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: 60, marginLeft: 8 }}
        />
      </label>
    </div>
  );
} 