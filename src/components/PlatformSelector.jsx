import React from "react";

function PlatformSelector({ value, onChange, disabled }) {
  const handleChange = (e) => {
    if (disabled) return;
    
    let newValue = parseInt(e.target.value);
    // Enforce range limits
    if (isNaN(newValue)) newValue = 2;
    if (newValue < 2) newValue = 2;
    if (newValue > 20) newValue = 20;
    
    onChange(newValue);
  };

  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
      <label
        htmlFor="platformCount"
        style={{
          marginRight: '10px',
          color: disabled ? '#6c757d' : '#212529'
        }}
      >
        Number of Platforms:
      </label>
      <input
        type="number"
        id="platformCount"
        min={2}
        max={20}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{
          width: '80px',
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          backgroundColor: disabled ? '#e9ecef' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
      {disabled ? (
        <span style={{ 
          marginLeft: '10px',
          color: '#6c757d',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Upload a new CSV to modify platforms
        </span>
      ) : (
        <span style={{ 
          marginLeft: '10px',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          (Min: 2, Max: 20)
        </span>
      )}
    </div>
  );
}

export default PlatformSelector;
