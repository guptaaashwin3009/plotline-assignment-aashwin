import { useReducer, useEffect, useRef } from 'react';
import { comparePriority } from '../utils/priorityUtils';

function getInitialState(platformCount) {
  return {
    platformCount,
    platforms: Array(platformCount).fill(null), // Each platform: {train, until}
    waiting: [], // Trains waiting for platform
    completed: [], // Trains that have departed
    now: new Date(),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLATFORMS':
      return getInitialState(action.platformCount);
    case 'LOAD_TRAINS': {
      const waiting = action.trains.map((t, i) => ({ ...t, csvIndex: i, status: 'waiting' }));
      return { ...getInitialState(state.platformCount), waiting };
    }
    case 'TICK': {
      const now = new Date();
      let { platforms, waiting, completed } = state;
      // Depart trains whose time is up
      platforms = platforms.map((slot, idx) => {
        if (slot && now >= slot.train.actualDeparture) {
          completed = [
            ...completed,
            { ...slot.train, status: 'departed', actualDeparture: slot.train.actualDeparture },
          ];
          return null;
        }
        return slot;
      });
      // Allocate free platforms
      let freeIndexes = platforms.map((p, i) => (p ? null : i)).filter(i => i !== null);
      if (freeIndexes.length && waiting.length) {
        // Sort waiting by priority
        waiting = [...waiting].sort(comparePriority);
        freeIndexes.forEach(idx => {
          if (waiting.length) {
            const train = { ...waiting.shift(), status: 'onPlatform', actualArrival: now, actualDeparture: new Date(now.getTime() + 60000 * 5) };
            platforms[idx] = { train };
          }
        });
      }
      return { ...state, platforms, waiting, completed, now };
    }
    case 'DELAY_TRAIN': {
      // Delay a train in waiting or on platform
      const { trainNumber, minutes } = action;
      let { platforms, waiting } = state;
      platforms = platforms.map(slot => {
        if (slot && slot.train.trainNumber === trainNumber) {
          const train = { ...slot.train };
          train.actualArrival = new Date(train.actualArrival.getTime() + minutes * 60000);
          train.actualDeparture = new Date(train.actualDeparture.getTime() + minutes * 60000);
          return { train };
        }
        return slot;
      });
      waiting = waiting.map(t => {
        if (t.trainNumber === trainNumber) {
          return { ...t, scheduledArrival: new Date(new Date(t.scheduledArrival).getTime() + minutes * 60000), scheduledDeparture: new Date(new Date(t.scheduledDeparture).getTime() + minutes * 60000) };
        }
        return t;
      });
      return { ...state, platforms, waiting };
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