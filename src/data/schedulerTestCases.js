// Test cases for the train scheduler app
// Each test case: { name, platformCount, trains: [{ trainNumber, priority, arrivalTime, departureTime }] }

const schedulerTestCases = [
  {
    name: 'Simple Sequential Arrivals',
    platformCount: 1,
    trains: [
      { trainNumber: '10001', priority: 'P1', arrivalTime: '10:00:00', departureTime: '10:10:00' },
      { trainNumber: '10002', priority: 'P2', arrivalTime: '10:12:00', departureTime: '10:20:00' },
      { trainNumber: '10003', priority: 'P3', arrivalTime: '10:22:00', departureTime: '10:30:00' },
    ],
  },
  {
    name: 'Simultaneous Arrivals, More Trains Than Platforms',
    platformCount: 2,
    trains: [
      { trainNumber: '20001', priority: 'P2', arrivalTime: '11:00:00', departureTime: '11:10:00' },
      { trainNumber: '20002', priority: 'P1', arrivalTime: '11:00:00', departureTime: '11:12:00' },
      { trainNumber: '20003', priority: 'P3', arrivalTime: '11:00:00', departureTime: '11:15:00' },
    ],
  },
  {
    name: 'Overlapping Departures and Arrivals',
    platformCount: 1,
    trains: [
      { trainNumber: '30001', priority: 'P1', arrivalTime: '12:00:00', departureTime: '12:10:00' },
      { trainNumber: '30002', priority: 'P2', arrivalTime: '12:05:00', departureTime: '12:15:00' },
      { trainNumber: '30003', priority: 'P3', arrivalTime: '12:10:00', departureTime: '12:20:00' },
    ],
  },
  {
    name: 'All Platforms Busy, New Arrivals Wait',
    platformCount: 2,
    trains: [
      { trainNumber: '40001', priority: 'P1', arrivalTime: '13:00:00', departureTime: '13:20:00' },
      { trainNumber: '40002', priority: 'P2', arrivalTime: '13:00:00', departureTime: '13:20:00' },
      { trainNumber: '40003', priority: 'P3', arrivalTime: '13:05:00', departureTime: '13:25:00' },
      { trainNumber: '40004', priority: 'P1', arrivalTime: '13:10:00', departureTime: '13:30:00' },
    ],
  },
  {
    name: 'Gaps and Idle Platforms',
    platformCount: 2,
    trains: [
      { trainNumber: '50001', priority: 'P1', arrivalTime: '14:00:00', departureTime: '14:10:00' },
      { trainNumber: '50002', priority: 'P2', arrivalTime: '14:30:00', departureTime: '14:40:00' },
    ],
  },
  {
    name: 'All Trains Arrive in the Past',
    platformCount: 1,
    trains: [
      { trainNumber: '60001', priority: 'P1', arrivalTime: '08:00:00', departureTime: '08:10:00' },
      { trainNumber: '60002', priority: 'P2', arrivalTime: '08:05:00', departureTime: '08:15:00' },
    ],
  },
  {
    name: 'Rapid Arrivals and Departures',
    platformCount: 1,
    trains: [
      { trainNumber: '70001', priority: 'P1', arrivalTime: '15:00:00', departureTime: '15:01:00' },
      { trainNumber: '70002', priority: 'P2', arrivalTime: '15:01:00', departureTime: '15:02:00' },
      { trainNumber: '70003', priority: 'P3', arrivalTime: '15:02:00', departureTime: '15:03:00' },
    ],
  },
];

export default schedulerTestCases; 