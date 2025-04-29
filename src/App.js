import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import UploadCSV from "./components/UploadCSV";
import PlatformSelector from "./components/PlatformSelector";
import PlatformDashboard from "./components/PlatformDashboard";
import TrainTable from "./components/TrainTable";
import ReportTable from "./components/ReportTable";
import useTrainScheduler from "./hooks/useTrainScheduler";
import uploadedTrains from "./data/uploadedTrains";

function App() {
  const [platformCount, setPlatformCount] = useState(2);
  const [csvData, setCsvData] = useState(uploadedTrains);
  const [isLocked, setIsLocked] = useState(false);
  const scheduler = useTrainScheduler(platformCount);
  const lastTrainsRef = useRef(csvData);

  const handleCSV = (data) => {
    // Normalize CSV fields and convert times to hh:mm:ss
    console.log('Parsed CSV data:', data);
    const trains = data.map((row) => ({
      trainNumber: row["Train Number"],
      priority: row["Priority"],
      arrivalTime:
        row["Arrival Time"] && row["Arrival Time"].length === 5
          ? row["Arrival Time"] + ":00"
          : row["Arrival Time"],
      departureTime:
        row["Departure Time"] && row["Departure Time"].length === 5
          ? row["Departure Time"] + ":00"
          : row["Departure Time"],
    }));
    setCsvData(trains);
    lastTrainsRef.current = trains;
    scheduler.loadTrains(trains);
    setIsLocked(true); // Lock platform count after CSV upload
    // Save to file
    saveUploadedTrains(trains);
  };

  // Save uploaded trains to src/data/uploadedTrains.js
  function saveUploadedTrains(trains) {
    const fs = window.require ? window.require('fs') : null;
    if (!fs) return;
    const fileContent = `// This file is auto-generated to store the last uploaded CSV data\n// Do not edit manually\n\nconst uploadedTrains = ${JSON.stringify(trains, null, 2)};\n\nexport default uploadedTrains;\n`;
    fs.writeFileSync('src/data/uploadedTrains.js', fileContent);
  }

  const handlePlatformChange = (count) => {
    if (!isLocked) {
      // Ensure count is within valid range
      const validCount = Math.max(2, Math.min(20, count));
      setPlatformCount(validCount);
    }
  };

  // Only reload trains when platform count changes
  useEffect(() => {
    const trains = lastTrainsRef.current;
    if (trains && trains.length > 0) {
      // Small delay to ensure scheduler is ready
      const timer = setTimeout(() => {
        scheduler.loadTrains(trains);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [platformCount]); // Remove scheduler dependency

  return (
    <div
      className="App"
      style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}
    >
      <h2>Train Platform Dashboard</h2>
      <PlatformSelector 
        value={platformCount} 
        onChange={handlePlatformChange}
        disabled={isLocked}
      />
      <UploadCSV onUpload={handleCSV} />
      <PlatformDashboard platforms={scheduler.platforms} now={scheduler.now} />
      <TrainTable waiting={scheduler.waiting} />
      <ReportTable allTrains={scheduler.allTrains} />
    </div>
  );
}

export default App;
