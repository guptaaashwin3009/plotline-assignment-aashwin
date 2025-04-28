import { useReducer, useEffect, useRef } from 'react';
import { comparePriority, parseTimeString } from '../utils/priorityUtils';

function getInitialState(platformCount) {
  return {
    platformCount,
    platforms: Array(platformCount).fill(null), // Each platform: {train}
    waiting: [], // Trains waiting for platform
    completed: [], // Trains that have departed
    now: null, // Will be set on CSV upload
    allTrains: [], // For dashboard
    startTime: null, // Reference time for all calculations
  };
}

function getStayDuration(scheduledArrival, scheduledDeparture) {
  // Handle case where departure is on next day
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
      const platforms = Array(state.platformCount).fill(null);
      let waiting = [];
      const allTrains = trains.map(t => ({ ...t }));
      let used = 0;
      // Assign as many trains as possible to platforms
      for (let i = 0; i < trains.length; ++i) {
        if (used < state.platformCount && trains[i].scheduledArrival <= now) {
          const actualArrival = trains[i].scheduledArrival;
          const actualDeparture = trains[i].scheduledDeparture;
          platforms[used] = {
            train: {
              ...trains[i],
              status: 'onPlatform',
              actualArrival,
              actualDeparture,
            },
          };
          allTrains[trains[i].csvIndex] = {
            ...trains[i],
            status: 'onPlatform',
            actualArrival,
            actualDeparture,
          };
          used++;
        }
      }
      // Waiting: only those whose scheduledArrival <= now and not on platform
      waiting = trains.filter(
        t => t.scheduledArrival <= now &&
        !platforms.some(slot => slot && slot.train && slot.train.csvIndex === t.csvIndex)
      );
      console.log('allTrains after LOAD_TRAINS:', allTrains);
      return { ...getInitialState(state.platformCount), platforms, waiting, allTrains, now, startTime: now };
    }
    case 'TICK': {
      if (!state.startTime) return state;
      const now = new Date(state.startTime.getTime() + (Date.now() - state.startTime.getTime()));
      let { platforms, waiting, completed, allTrains } = state;
      platforms = platforms.map((slot, idx) => {
        if (slot && now >= slot.train.actualDeparture) {
          completed = [
            ...completed,
            { ...slot.train, status: 'departed', actualDeparture: slot.train.actualDeparture },
          ];
          allTrains[slot.train.csvIndex] = { ...slot.train, status: 'departed', actualDeparture: slot.train.actualDeparture };
          return null;
        }
        return slot;
      });
      let freeIndexes = platforms.map((p, i) => (p ? null : i)).filter(i => i !== null);
      if (freeIndexes.length && waiting.length) {
        waiting = [...waiting].sort(comparePriority);
        freeIndexes.forEach(idx => {
          const nextIdx = waiting.findIndex(t => t.scheduledArrival <= now);
          if (nextIdx !== -1) {
            const train = waiting[nextIdx];
            const stay = getStayDuration(train.scheduledArrival, train.scheduledDeparture);
            const actualArrival = now;
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
      }
      // Waiting: only those whose scheduledArrival <= now and not on platform
      const allWaiting = allTrains.filter(
        t => t.scheduledArrival <= now &&
        !platforms.some(slot => slot && slot.train && slot.train.csvIndex === t.csvIndex) &&
        (!t.actualDeparture || now < t.actualDeparture)
      );
      return { ...state, platforms, waiting: allWaiting, completed, allTrains, now };
    }
    case 'DELAY_TRAIN': {
      const { trainNumber, minutes } = action;
      let { platforms, waiting, allTrains } = state;
      platforms = platforms.map(slot => {
        if (slot && slot.train.trainNumber === trainNumber) {
          const train = { ...slot.train };
          train.actualArrival = new Date(train.actualArrival.getTime() + minutes * 60000);
          train.actualDeparture = new Date(train.actualDeparture.getTime() + minutes * 60000);
          
          // Handle date rollover for delayed departures
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
          
          // Handle date rollover for delayed scheduled times
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