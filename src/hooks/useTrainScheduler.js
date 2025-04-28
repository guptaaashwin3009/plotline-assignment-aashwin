import { useReducer, useEffect, useRef } from 'react';
import { comparePriority, parseTimeString } from '../utils/priorityUtils';

function getInitialState(platformCount) {
  return {
    platformCount,
    platforms: Array(platformCount).fill(null),
    waiting: [],
    completed: [],
    now: null,
    allTrains: [],
    startTime: null,
  };
}

function getStayDuration(scheduledArrival, scheduledDeparture) {
  if (scheduledDeparture < scheduledArrival) {
    scheduledDeparture = new Date(scheduledDeparture.getTime() + 24 * 60 * 60 * 1000);
  }
  return scheduledDeparture - scheduledArrival;
}

function getMidnightToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function adjustDateForNextDay(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

function assignTrainsToPlatforms({ now, platformCount, allTrains }) {
  // Remove departed trains from platforms
  let platforms = Array(platformCount).fill(null);
  let waiting = [];
  let completed = [];
  // Find trains that are currently on a platform (actualArrival <= now < actualDeparture)
  const onPlatform = allTrains.filter(
    t => t.actualArrival && t.actualDeparture && t.actualArrival <= now && now < t.actualDeparture
  );
  // Assign them to platforms in priority order
  onPlatform.sort(comparePriority).slice(0, platformCount).forEach((train, idx) => {
    platforms[idx] = { train };
  });
  // Mark completed trains
  completed = allTrains.filter(t => t.actualDeparture && now >= t.actualDeparture);
  // Find eligible waiting trains (scheduledArrival <= now, not on platform, not departed)
  waiting = allTrains.filter(
    t => t.scheduledArrival <= now &&
      (!t.actualArrival || now < t.actualArrival) &&
      !onPlatform.some(p => p.csvIndex === t.csvIndex) &&
      (!t.actualDeparture || now < t.actualDeparture)
  );
  return { platforms, waiting, completed };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLATFORMS':
      return getInitialState(action.platformCount);
    case 'LOAD_TRAINS': {
      const now = new Date();
      const baseDate = getMidnightToday();
      let trains = action.trains.map((t, i) => {
        const scheduledArrival = parseTimeString(t.arrivalTime, baseDate);
        const scheduledDeparture = parseTimeString(t.departureTime, baseDate);
        return {
          ...t,
          csvIndex: i,
          status: 'waiting',
          scheduledArrival,
          scheduledDeparture,
          actualArrival: null,
          actualDeparture: null,
        };
      });
      trains = trains.sort(comparePriority);
      // Assign as many trains as possible to platforms
      let allTrains = trains.map(t => ({ ...t }));
      let { platforms, waiting, completed } = assignTrainsToPlatforms({ now, platformCount: state.platformCount, allTrains });
      // For each free platform, assign a waiting train
      let freeIndexes = platforms.map((p, i) => (p ? null : i)).filter(i => i !== null);
      waiting = waiting.sort(comparePriority);
      freeIndexes.forEach(idx => {
        const nextIdx = waiting.findIndex(t => t.scheduledArrival <= now);
        if (nextIdx !== -1) {
          const train = waiting[nextIdx];
          const actualArrival = now;
          const stay = getStayDuration(train.scheduledArrival, train.scheduledDeparture);
          let actualDeparture = new Date(now.getTime() + stay);
          if (actualDeparture < actualArrival) {
            actualDeparture = adjustDateForNextDay(actualDeparture);
          }
          const updatedTrain = {
            ...train,
            status: 'onPlatform',
            actualArrival,
            actualDeparture,
          };
          platforms[idx] = { train: updatedTrain };
          allTrains[train.csvIndex] = updatedTrain;
          waiting.splice(nextIdx, 1);
        }
      });
      return { ...getInitialState(state.platformCount), platforms, waiting, completed, allTrains, now, startTime: now };
    }
    case 'TICK': {
      if (!state.startTime) return state;
      const now = new Date(state.startTime.getTime() + (Date.now() - state.startTime.getTime()));
      let allTrains = state.allTrains.map(t => ({ ...t }));
      // Remove departed trains from platforms, assign new arrivals
      let { platforms, waiting, completed } = assignTrainsToPlatforms({ now, platformCount: state.platformCount, allTrains });
      // For each free platform, assign a waiting train
      let freeIndexes = platforms.map((p, i) => (p ? null : i)).filter(i => i !== null);
      waiting = waiting.sort(comparePriority);
      freeIndexes.forEach(idx => {
        const nextIdx = waiting.findIndex(t => t.scheduledArrival <= now);
        if (nextIdx !== -1) {
          const train = waiting[nextIdx];
          const actualArrival = now;
          const stay = getStayDuration(train.scheduledArrival, train.scheduledDeparture);
          let actualDeparture = new Date(now.getTime() + stay);
          if (actualDeparture < actualArrival) {
            actualDeparture = adjustDateForNextDay(actualDeparture);
          }
          const updatedTrain = {
            ...train,
            status: 'onPlatform',
            actualArrival,
            actualDeparture,
          };
          platforms[idx] = { train: updatedTrain };
          allTrains[train.csvIndex] = updatedTrain;
          waiting.splice(nextIdx, 1);
        }
      });
      return { ...state, platforms, waiting, completed, allTrains, now };
    }
    case 'DELAY_TRAIN': {
      const { trainNumber, minutes } = action;
      let { platforms, waiting, allTrains } = state;
      platforms = platforms.map(slot => {
        if (slot && slot.train.trainNumber === trainNumber) {
          const train = { ...slot.train };
          train.actualArrival = new Date(train.actualArrival.getTime() + minutes * 60000);
          train.actualDeparture = new Date(train.actualDeparture.getTime() + minutes * 60000);
          if (train.actualDeparture < train.actualArrival) {
            train.actualDeparture = adjustDateForNextDay(train.actualDeparture);
          }
          allTrains[train.csvIndex] = train;
          return { train };
        }
        return slot;
      });
      waiting = waiting.map(t => {
        if (t.trainNumber === trainNumber) {
          const updated = { 
            ...t, 
            scheduledArrival: new Date(t.scheduledArrival.getTime() + minutes * 60000),
            scheduledDeparture: new Date(t.scheduledDeparture.getTime() + minutes * 60000)
          };
          if (updated.scheduledDeparture < updated.scheduledArrival) {
            updated.scheduledDeparture = adjustDateForNextDay(updated.scheduledDeparture);
          }
          allTrains[t.csvIndex] = updated;
          return updated;
        }
        return t;
      });
      return { ...state, platforms, waiting, allTrains };
    }
    default:
      return state;
  }
}

export default function useTrainScheduler(platformCount) {
  const [state, dispatch] = useReducer(reducer, getInitialState(platformCount));
  const intervalRef = useRef();

  useEffect(() => {
    dispatch({ type: 'SET_PLATFORMS', platformCount });
  }, [platformCount]);

  useEffect(() => {
    intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return {
    ...state,
    loadTrains: trains => dispatch({ type: 'LOAD_TRAINS', trains }),
    delayTrain: (trainNumber, minutes) => dispatch({ type: 'DELAY_TRAIN', trainNumber, minutes }),
  };
} 