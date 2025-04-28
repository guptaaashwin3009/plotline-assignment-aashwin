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
  return new Date(scheduledDeparture) - new Date(scheduledArrival);
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLATFORMS':
      return getInitialState(action.platformCount);
    case 'LOAD_TRAINS': {
      const now = new Date();
      let trains = action.trains.map((t, i) => {
        const scheduledArrival = parseTimeString(t.arrivalTime, now);
        const scheduledDeparture = parseTimeString(t.departureTime, now);
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
      const waiting = [];
      const allTrains = trains.map(t => ({ ...t }));
      let used = 0;
      for (let i = 0; i < trains.length; ++i) {
        if (used < state.platformCount && trains[i].scheduledArrival <= now) {
          // For initial trains, actual = scheduled
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
        } else {
          waiting.push(trains[i]);
        }
      }
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
            const delay = now - train.scheduledArrival;
            const stay = getStayDuration(train.scheduledArrival, train.scheduledDeparture);
            const actualArrival = now;
            const actualDeparture = new Date(now.getTime() + stay);
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
          allTrains[train.csvIndex] = train;
          return { train };
        }
        return slot;
      });
      waiting = waiting.map(t => {
        if (t.trainNumber === trainNumber) {
          const updated = { ...t, scheduledArrival: new Date(t.scheduledArrival.getTime() + minutes * 60000), scheduledDeparture: new Date(t.scheduledDeparture.getTime() + minutes * 60000) };
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