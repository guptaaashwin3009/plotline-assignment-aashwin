import React, { useState } from 'react';
import './App.css';
import UploadCSV from './components/UploadCSV';
import PlatformSelector from './components/PlatformSelector';
import PlatformDashboard from './components/PlatformDashboard';
import TrainTable from './components/TrainTable';
import ReportTable from './components/ReportTable';
import useTrainScheduler from './hooks/useTrainScheduler';

function App() {
  const [platformCount, setPlatformCount] = useState(3);
  const scheduler = useTrainScheduler(platformCount);

  const handleCSV = (data) => {
    // Normalize CSV fields and convert times to Date objects
    const trains = data.map(row => ({
      trainNumber: row['Train Number'],
      priority: row['Priority'],
      arrivalTime: row['Arrival Time'],
      departureTime: row['Departure Time'],
      scheduledArrival: row['Arrival Time'],
      scheduledDeparture: row['Departure Time'],
    }));
    scheduler.loadTrains(trains);
  };

  return (
    <div className="App" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Plotline Train Platform Dashboard</h2>
      <PlatformSelector value={platformCount} onChange={setPlatformCount} />
      <UploadCSV onUpload={handleCSV} />
      <PlatformDashboard platforms={scheduler.platforms} now={scheduler.now} />
      <TrainTable waiting={scheduler.waiting} />
      <ReportTable completed={scheduler.completed} />
    </div>
  );
}

export default App;
