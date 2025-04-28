import { useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import { comparePriority, parseTimeString } from '../utils/priorityUtils';

function getInitialState(platformCount) {
  const now = new Date();
  return {
    platformCount,
    platforms: Array(platformCount).fill(null),
    waiting: [],
    completed: [],
    now,
    allTrains: [],
    startTime: now,
    lastUpdate: now,
  };
}

function getStayDuration(scheduledArrival, scheduledDeparture) {
  if (!scheduledArrival || !scheduledDeparture) return 0;
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
  if (!date) return null;
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

function processTrains(trains, baseDate) {
  return trains.map((t, i) => {
    const scheduledArrival = parseTimeString(t.arrivalTime, baseDate);
    const scheduledDeparture = parseTimeString(t.departureTime, baseDate);
    if (!scheduledArrival || !scheduledDeparture) {
      console.warn(`Invalid time format for train ${t.trainNumber}`);
      return null;
    }
    return {
      ...t,
      csvIndex: i,
      status: 'waiting',
      scheduledArrival,
      scheduledDeparture,
      actualArrival: null,
      actualDeparture: null,
    };
  }).filter(Boolean);
}

function assignTrainsToPlatforms({ now, platformCount, allTrains }) {
  if (!now || !allTrains?.length || platformCount < 1) {
    return {
      platforms: Array(platformCount || 0).fill(null),
      waiting: [],
      completed: []
    };
  }

  let platforms = Array(platformCount).fill(null);
  let waiting = [];
  let completed = [];

  // Find trains that are currently on a platform
  const onPlatform = allTrains.filter(t => 
    t.actualArrival && 
    t.actualDeparture && 
    t.actualArrival <= now && 
    now < t.actualDeparture
  );

  // Sort and assign to platforms
  onPlatform
    .sort(comparePriority)
    .slice(0, platformCount)
    .forEach((train, idx) => {
      platforms[idx] = { train };
    });

  // Mark completed trains
  completed = allTrains.filter(t => 
    t.actualDeparture && 
    now >= t.actualDeparture
  );

  // Find eligible waiting trains
  waiting = allTrains.filter(t => 
    t.scheduledArrival && 
    t.scheduledArrival <= now &&
    (!t.actualArrival || now < t.actualArrival) &&
    !onPlatform.some(p => p.csvIndex === t.csvIndex) &&
    (!t.actualDeparture || now < t.actualDeparture)
  ).sort(comparePriority);

  return { platforms, waiting, completed };
}

function assignWaitingTrains(platforms, waiting, now) {
  const updatedPlatforms = [...platforms];
  const updatedWaiting = [...waiting];
  const updatedTrains = [];

  const freeIndexes = platforms
    .map((p, i) => p ? null : i)
    .filter(i => i !== null);

  freeIndexes.forEach(idx => {
    const waitingIdx = updatedWaiting.findIndex(t => 
      t.scheduledArrival && 
      t.scheduledArrival <= now
    );

    if (waitingIdx !== -1) {
      const train = updatedWaiting[waitingIdx];
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

      updatedPlatforms[idx] = { train: updatedTrain };
      updatedTrains.push({ index: train.csvIndex, train: updatedTrain });
      updatedWaiting.splice(waitingIdx, 1);
    }
  });

  return { platforms: updatedPlatforms, waiting: updatedWaiting, updatedTrains };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLATFORMS': {
      if (state.platformCount === action.platformCount) {
        return state;
      }

      const now = state.now || new Date();
      const newState = {
        ...getInitialState(action.platformCount),
        now,
        startTime: state.startTime || now,
        lastUpdate: now,
        allTrains: state.allTrains
      };

      if (state.allTrains?.length) {
        const { platforms, waiting, completed } = assignTrainsToPlatforms({
          now,
          platformCount: action.platformCount,
          allTrains: state.allTrains
        });

        const { platforms: updatedPlatforms, waiting: updatedWaiting, updatedTrains } = 
          assignWaitingTrains(platforms, waiting, now);

        const allTrains = [...state.allTrains];
        updatedTrains.forEach(({ index, train }) => {
          allTrains[index] = train;
        });

        return {
          ...newState,
          platforms: updatedPlatforms,
          waiting: updatedWaiting,
          completed,
          allTrains
        };
      }

      return newState;
    }

    case 'LOAD_TRAINS': {
      const now = new Date();
      const baseDate = getMidnightToday();
      
      // Process and validate trains
      const processedTrains = processTrains(action.trains, baseDate);
      if (!processedTrains.length) {
        return {
          ...state,
          lastUpdate: now
        };
      }

      // Sort by priority
      const allTrains = processedTrains.sort(comparePriority);

      // Initial platform assignment
      const { platforms, waiting, completed } = assignTrainsToPlatforms({
        now,
        platformCount: state.platformCount,
        allTrains
      });

      // Assign waiting trains to free platforms
      const { platforms: updatedPlatforms, waiting: updatedWaiting, updatedTrains } = 
        assignWaitingTrains(platforms, waiting, now);

      // Update train states
      updatedTrains.forEach(({ index, train }) => {
        allTrains[index] = train;
      });

      return {
        ...state,
        platforms: updatedPlatforms,
        waiting: updatedWaiting,
        completed,
        allTrains,
        now,
        startTime: now,
        lastUpdate: now
      };
    }

    case 'TICK': {
      const now = new Date();
      if (!state.startTime || !state.allTrains?.length || now - state.lastUpdate < 1000) {
        return state;
      }

      const allTrains = state.allTrains.map(t => ({ ...t }));
      
      const { platforms, waiting, completed } = assignTrainsToPlatforms({
        now,
        platformCount: state.platformCount,
        allTrains
      });

      const { platforms: updatedPlatforms, waiting: updatedWaiting, updatedTrains } = 
        assignWaitingTrains(platforms, waiting, now);

      updatedTrains.forEach(({ index, train }) => {
        allTrains[index] = train;
      });

      return {
        ...state,
        platforms: updatedPlatforms,
        waiting: updatedWaiting,
        completed,
        allTrains,
        now,
        lastUpdate: now
      };
    }

    case 'DELAY_TRAIN': {
      const now = new Date();
      const { trainNumber, minutes } = action;
      if (!trainNumber || !minutes || !state.allTrains?.length) {
        return state;
      }

      const allTrains = state.allTrains.map(train => {
        if (train.trainNumber !== trainNumber) return train;

        const updatedTrain = { ...train };
        if (updatedTrain.actualArrival) {
          updatedTrain.actualArrival = new Date(updatedTrain.actualArrival.getTime() + minutes * 60000);
        }
        if (updatedTrain.actualDeparture) {
          updatedTrain.actualDeparture = new Date(updatedTrain.actualDeparture.getTime() + minutes * 60000);
          if (updatedTrain.actualDeparture < updatedTrain.actualArrival) {
            updatedTrain.actualDeparture = adjustDateForNextDay(updatedTrain.actualDeparture);
          }
        }
        if (updatedTrain.scheduledArrival) {
          updatedTrain.scheduledArrival = new Date(updatedTrain.scheduledArrival.getTime() + minutes * 60000);
        }
        if (updatedTrain.scheduledDeparture) {
          updatedTrain.scheduledDeparture = new Date(updatedTrain.scheduledDeparture.getTime() + minutes * 60000);
          if (updatedTrain.scheduledDeparture < updatedTrain.scheduledArrival) {
            updatedTrain.scheduledDeparture = adjustDateForNextDay(updatedTrain.scheduledDeparture);
          }
        }
        return updatedTrain;
      });

      const { platforms, waiting, completed } = assignTrainsToPlatforms({
        now,
        platformCount: state.platformCount,
        allTrains
      });

      return {
        ...state,
        platforms,
        waiting,
        completed,
        allTrains,
        now,
        lastUpdate: now
      };
    }

    default:
      return state;
  }
}

export default function useTrainScheduler(platformCount) {
  const [state, dispatch] = useReducer(reducer, platformCount, getInitialState);
  const intervalRef = useRef(null);
  const platformCountRef = useRef(platformCount);
  const isInitialMount = useRef(true);

  const loadTrains = useCallback((trains) => {
    if (!trains?.length) return;
    dispatch({ type: 'LOAD_TRAINS', trains });
  }, []);

  const delayTrain = useCallback((trainNumber, minutes) => {
    if (!trainNumber || !minutes) return;
    dispatch({ type: 'DELAY_TRAIN', trainNumber, minutes });
  }, []);

  const tick = useCallback(() => {
    dispatch({ type: 'TICK' });
  }, []);

  // Handle platform count changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (platformCountRef.current !== platformCount) {
      platformCountRef.current = platformCount;
      dispatch({ type: 'SET_PLATFORMS', platformCount });
    }
  }, [platformCount]);

  // Set up the tick interval
  useEffect(() => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(tick, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tick]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    ...state,
    loadTrains,
    delayTrain,
  }), [state, loadTrains, delayTrain]);
} 