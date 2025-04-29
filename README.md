# Train Platform Scheduler

A React-based application for scheduling trains across multiple platforms. The application allows users to upload train schedules via CSV and visualizes the platform allocation along with waiting trains.

## Features

- **Dynamic Platform Management**: 
  - Configure number of platforms (1-5)
  - Platform count becomes locked after CSV upload for scheduling stability
  - Visual feedback for locked state with helper messages

- **CSV Upload System**:
  - Upload train schedules via CSV format
  - Automatic parsing and validation of train data
  - Supports time format: HH:mm or HH:mm:ss

- **Real-time Visualization**:
  - Platform Dashboard showing current train allocations
  - Waiting Trains Table
  - Comprehensive Reports Table

## Recent Changes

1. **Platform Count Immutability**:
   - Added platform count locking after CSV upload
   - Implemented visual feedback for locked state
   - Added helper message for modifying platforms

2. **UI/UX Improvements**:
   - Enhanced platform selector styling
   - Added disabled state styling
   - Improved user feedback messages

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## CSV Format

The application expects CSV files in the following format:

```csv
Train Number,Priority,Arrival Time,Departure Time
1,1,10:00,10:30
2,1,10:15,10:45
...
```

### Field Descriptions:
- **Train Number**: Unique identifier for each train
- **Priority**: Train priority level
- **Arrival Time**: Expected arrival time (format: HH:mm or HH:mm:ss)
- **Departure Time**: Expected departure time (format: HH:mm or HH:mm:ss)

## Usage Instructions

1. **Initial Setup**:
   - When the application loads, you can set the desired number of platforms (1-5)
   - This can only be done before uploading a CSV file

2. **Upload Schedule**:
   - Click "Upload CSV" to import your train schedule
   - Once uploaded, the platform count will be locked
   - The scheduler will automatically allocate trains to platforms

3. **View Results**:
   - Platform Dashboard shows current platform allocations
   - Waiting Trains table shows trains waiting for platform assignment
   - Reports Table provides comprehensive scheduling information

4. **Modify Schedule**:
   - To modify the platform count, you'll need to upload a new CSV file
   - This ensures scheduling stability during operation

## Technical Implementation

The application uses several key components:

- **PlatformSelector**: Manages platform count with locking mechanism
- **UploadCSV**: Handles CSV file upload and parsing
- **PlatformDashboard**: Visualizes current platform allocations
- **TrainTable**: Displays waiting trains
- **ReportTable**: Shows comprehensive scheduling information

The scheduler uses a custom hook (`useTrainScheduler`) to manage train assignments and platform allocation logic.

## Development

To modify or extend the application:

1. Main application logic is in `src/App.js`
2. Component-specific code is in `src/components/`
3. Scheduling logic is in the custom hook directory
4. Utility functions are in `src/utils/`

## Troubleshooting

Common issues and solutions:

1. **CSV Upload Issues**:
   - Ensure CSV follows the required format
   - Check for proper time formatting (HH:mm or HH:mm:ss)
   - Verify all required fields are present

2. **Platform Changes Locked**:
   - This is expected behavior after CSV upload
   - Upload a new CSV file to modify platform count

3. **Display Issues**:
   - Clear browser cache and reload
   - Check console for any error messages 