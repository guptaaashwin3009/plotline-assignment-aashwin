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
    // Normalize CSV fields and convert times to hh:mm:ss
    const trains = data.map(row => ({
      trainNumber: row['Train Number'],
      priority: row['Priority'],
      arrivalTime: row['Arrival Time'] && row['Arrival Time'].length === 5 ? row['Arrival Time'] + ':00' : row['Arrival Time'],
      departureTime: row['Departure Time'] && row['Departure Time'].length === 5 ? row['Departure Time'] + ':00' : row['Departure Time'],
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
      <ReportTable allTrains={scheduler.allTrains} />
    </div>
  );
}

export default App;
