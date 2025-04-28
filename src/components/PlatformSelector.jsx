import React from "react";

export default function PlatformSelector({ value, onChange }) {
  return (
    <div
      style={{
        margin: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <label
        htmlFor="platform-count"
        style={{
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 8,
          color: "#2a7aee",
        }}
      >
        Number of Platforms
      </label>
      <input
        id="platform-count"
        type="number"
        min={2}
        max={20}
        value={value}
        onChange={(e) => {
          let v = Number(e.target.value);
          if (v < 2) v = 2;
          if (v > 20) v = 20;
          onChange(v);
        }}
        style={{
          width: 80,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1.5px solid #2a7aee",
          fontSize: 16,
          fontWeight: 500,
          color: "#2a7aee",
          outline: "none",
          boxShadow: "0 1px 4px #2a7aee22",
          textAlign: "center",
          marginBottom: 4,
        }}
      />
      <div style={{ fontSize: 13, color: "#888" }}>(Min: 2, Max: 20)</div>
    </div>
  );
}
