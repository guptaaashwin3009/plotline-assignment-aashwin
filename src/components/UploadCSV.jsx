import React from 'react';
import Papa from 'papaparse';

export default function UploadCSV({ onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onUpload(results.data);
      },
    });
  };
  return (
    <div style={{ margin: '1rem 0' }}>
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
} 