'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { StadiumState, StadiumAction, Zone, Gate, HistoryItem } from '@/types';
import { initialZones, initialGates, simulateCrowdFluctuation, getInitialDataForStadium } from '@/data/mockData';
import { riskScenarios } from '@/data/scenarios';
import { evaluateRisks } from '@/lib/riskEngine';
import { calculateCascade } from '@/lib/cascadeEngine';

// ============================================================
// Initial State
// ============================================================
const initialState: StadiumState = {
  selectedStadiumId: 'wembley',
  zones: initialZones,
  gates: initialGates,
  weather: null,
  risks: riskScenarios,
  eventStatus: 'live',
  simulationActive: false,
  selectedZoneId: null,
  selectedRiskId: null,
  history: [],
  playbackIndex: null,
  predictions: [],
};

// Helper: runs cascade engine + risk evaluations on the next state
function runSimUpdates(state: StadiumState, zones: Zone[], gates: Gate[]): Partial<StadiumState> {
  const cascadeRes = calculateCascade(zones, gates, 0);
  const updatedRisks = evaluateRisks(cascadeRes.updatedZones, cascadeRes.updatedGates, state.weather);
  return {
    zones: cascadeRes.updatedZones,
    gates: cascadeRes.updatedGates,
    predictions: cascadeRes.predictions,
    risks: updatedRisks,
  };
}

// ============================================================
// Reducer
// ============================================================
function stadiumReducer(state: StadiumState, action: StadiumAction): StadiumState {
  switch (action.type) {
    case 'SET_STADIUM': {
      const stadiumId = action.payload;
      const { zones, gates } = getInitialDataForStadium(stadiumId);
      const updates = runSimUpdates(state, zones, gates);
      return {
        ...state,
        ...updates,
        selectedStadiumId: stadiumId,
        selectedZoneId: null,
        selectedRiskId: null,
        history: [],
        playbackIndex: null,
      };
    }

    case 'SET_ZONES': {
      const updates = runSimUpdates(state, action.payload, state.gates);
      return { ...state, ...updates };
    }

    case 'UPDATE_ZONE': {
      const updatedZones = state.zones.map((z) =>
        z.id === action.payload.id ? { ...z, ...action.payload.updates } : z
      );
      const updates = runSimUpdates(state, updatedZones, state.gates);
      return { ...state, ...updates };
    }

    case 'SET_GATES': {
      const updates = runSimUpdates(state, state.zones, action.payload);
      return { ...state, ...updates };
    }

    case 'TOGGLE_GATE': {
      const updatedGates = state.gates.map((g) =>
        g.id === action.payload.id
          ? {
              ...g,
              status: action.payload.status,
              flowRate: action.payload.status === 'closed' ? 0 : g.flowRate,
            }
          : g
      );
      const updates = runSimUpdates(state, state.zones, updatedGates);
      return { ...state, ...updates };
    }

    case 'SET_WEATHER': {
      const updatedRisks = evaluateRisks(state.zones, state.gates, action.payload);
      return { ...state, weather: action.payload, risks: updatedRisks };
    }

    case 'SET_RISKS':
      return { ...state, risks: action.payload };

    case 'UPDATE_RISK':
      return {
        ...state,
        risks: state.risks.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };

    case 'SET_EVENT_STATUS':
      return { ...state, eventStatus: action.payload };

    case 'START_SIMULATION':
      return { ...state, simulationActive: true };

    case 'STOP_SIMULATION': {
      const { zones: defaultZones, gates: defaultGates } = getInitialDataForStadium(state.selectedStadiumId);
      const cleanRisks = evaluateRisks(defaultZones, defaultGates, state.weather);
      return {
        ...state,
        simulationActive: false,
        zones: defaultZones,
        gates: defaultGates,
        risks: cleanRisks,
        predictions: [],
      };
    }

    case 'SELECT_ZONE':
      return { ...state, selectedZoneId: action.payload };

    case 'SELECT_RISK':
      return { ...state, selectedRiskId: action.payload };

    case 'BULK_UPDATE':
      return { ...state, ...action.payload };

    case 'RECORD_HISTORY_TICK': {
      const newHistoryItem: HistoryItem = {
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        zones: JSON.parse(JSON.stringify(state.zones)),
        gates: JSON.parse(JSON.stringify(state.gates)),
        risks: JSON.parse(JSON.stringify(state.risks)),
      };
      // Keep only last 20 snapshots
      const updatedHistory = [...state.history, newHistoryItem].slice(-20);
      return { ...state, history: updatedHistory };
    }

    case 'SET_PLAYBACK_INDEX':
      return { ...state, playbackIndex: action.payload };

    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================
interface StadiumContextValue {
  state: StadiumState;
  dispatch: React.Dispatch<StadiumAction>;
}

const StadiumContext = createContext<StadiumContextValue | undefined>(undefined);

// ============================================================
// Provider
// ============================================================
export function StadiumProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(stadiumReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Global state recording timer (every 10s)
  useEffect(() => {
    const historyInterval = setInterval(() => {
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 10000);
    return () => clearInterval(historyInterval);
  }, []);

  // Crowd updates timer (every 4 seconds)
  useEffect(() => {
    const crowdInterval = setInterval(() => {
      const current = stateRef.current;
      // Do not run crowd fluctuation while playing back history
      if (current.playbackIndex !== null) return;

      if (current.simulationActive) {
        // If simulation is active, let the cascade flow propagate dynamically
        const updates = runSimUpdates(current, current.zones, current.gates);
        dispatch({ type: 'BULK_UPDATE', payload: updates });
      } else {
        // Normal operations fluctuation
        const updatedZones = simulateCrowdFluctuation(current.zones);
        dispatch({ type: 'SET_ZONES', payload: updatedZones });
      }
    }, 4000);
    return () => clearInterval(crowdInterval);
  }, []);

  return (
    <StadiumContext.Provider value={{ state, dispatch }}>
      {children}
    </StadiumContext.Provider>
  );
}

export function useStadium() {
  const context = useContext(StadiumContext);
  if (!context) {
    throw new Error('useStadium must be used within a StadiumProvider');
  }
  const { state, dispatch } = context;

  const activeState = state.playbackIndex !== null && state.history[state.playbackIndex]
    ? {
        ...state,
        zones: state.history[state.playbackIndex].zones,
        gates: state.history[state.playbackIndex].gates,
        risks: state.history[state.playbackIndex].risks,
      }
    : state;

  return {
    state: activeState,
    dispatch,
    rawState: state,
  };
}
