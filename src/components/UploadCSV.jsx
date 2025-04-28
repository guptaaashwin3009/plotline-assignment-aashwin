import React, { useRef, useState } from "react";
import Papa from "papaparse";

export default function UploadCSV({ onUpload }) {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onUpload(results.data);
      },
    });
  };

  return (
    <div
      style={{
        margin: "2rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <label
        htmlFor="csv-upload"
        style={{
          background: "#2a7aee",
          color: "#fff",
          padding: "10px 24px",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 16,
          boxShadow: "0 2px 8px #2a7aee33",
          transition: "background 0.2s",
          marginBottom: 8,
        }}
      >
        {fileName ? "Change CSV File" : "Upload CSV File"}
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>
      {fileName && (
        <div style={{ color: "#2a7aee", fontWeight: 500, marginTop: 4 }}>
          {fileName}
        </div>
      )}
    </div>
  );
}
