import React from "react";

function PlatformSelector({ value, onChange, disabled }) {
  const handleChange = (e) => {
    if (!disabled) {
      onChange(parseInt(e.target.value));
    }
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
      <select
        id="platformCount"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          backgroundColor: disabled ? '#e9ecef' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      {disabled && (
        <span style={{ 
          marginLeft: '10px',
          color: '#6c757d',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Upload a new CSV to modify platforms
        </span>
      )}
    </div>
  );
}

export default PlatformSelector;
