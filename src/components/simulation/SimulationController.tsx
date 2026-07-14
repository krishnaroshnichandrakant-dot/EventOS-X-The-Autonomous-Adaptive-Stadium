'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DoorClosed,
  CloudRain,
  Users,
  X,
  Play,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { getDensityLevel } from '@/data/mockData';

interface Simulation {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

const simulations: Simulation[] = [
  {
    id: 'guided-demo',
    name: 'Guided Demo Tour (Judges Favorite)',
    description: 'Walks through Gate A closing → cascade → risk explanation → AI fix → time playback proof',
    icon: Sparkles,
    color: '#3B82F6',
  },
  {
    id: 'gate-failure',
    name: 'Gate B Failure',
    description: 'Simulates Gate B mechanical failure — watch congestion cascade to adjacent gates',
    icon: DoorClosed,
    color: '#EF4444',
  },
  {
    id: 'sudden-rain',
    name: 'Sudden Rainstorm',
    description: 'Simulates unexpected heavy rain — crowd displaces to covered areas',
    icon: CloudRain,
    color: '#0EA5A4',
  },
  {
    id: 'zone-overcrowding',
    name: 'Zone Overcrowding',
    description: 'Simulates North Stand reaching critical density — triggers safety protocols',
    icon: Users,
    color: '#F59E0B',
  },
];

export default function SimulationController({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useStadium();
  const [runningSimId, setRunningSimId] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearSimulation = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setRunningSimId(null);
    setTourStep(null);
    dispatch({ type: 'STOP_SIMULATION' });
  };

  const runSimulation = (simId: string) => {
    clearSimulation();
    setRunningSimId(simId);
    dispatch({ type: 'START_SIMULATION', payload: simId });

    switch (simId) {
      case 'guided-demo':
        runGuidedDemo();
        break;
      case 'gate-failure':
        runGateFailure();
        break;
      case 'sudden-rain':
        runSuddenRain();
        break;
      case 'zone-overcrowding':
        runOvercrowding();
        break;
    }

    onClose();
  };

  // ---- Guided Demo Tour (Wow Moments Walkthrough) ----
  const runGuidedDemo = () => {
    // Save initial state to history tick so we have playback start point
    dispatch({ type: 'RECORD_HISTORY_TICK' });

    // Step 1: Close Gate A (Domino Effect starts)
    setTourStep('1. Close Gate A & initiate redirect cascade...');
    dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-a', status: 'closed' } });

    // Step 2: Cascade Flow propagation
    const t1 = setTimeout(() => {
      setTourStep('2. Cascade ripple detected: adjacent Gate B & C congestion rising...');
      dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-b', status: 'congested' } });
      dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-c', status: 'congested' } });
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 3000);

    // Step 3: North Stand overcrowding threshold breach warning
    const t2 = setTimeout(() => {
      setTourStep('3. Predictive Gap Warning: Zone North Stand breach forecasted in 6 min!');
      const northStand = state.zones.find((z) => z.id === 'north-stand');
      if (northStand) {
        dispatch({
          type: 'UPDATE_ZONE',
          payload: {
            id: 'north-stand',
            updates: {
              currentOccupancy: Math.min(northStand.maxCapacity, northStand.maxCapacity * 0.92),
              density: 'critical',
              trend: 'rising',
            },
          },
        });
      }
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 6000);

    // Step 4: AI Copilot intervenes agentically
    const t3 = setTimeout(() => {
      setTourStep('4. Agentic AI Intervention: Copilot command dispatched to resolve congestion...');
      
      // Auto-open alternative West gate (Gate E) to resolve the cascade
      dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-e', status: 'open' } });
      
      // Nudge occupancies down representing successful redirection
      const northStand = state.zones.find((z) => z.id === 'north-stand');
      if (northStand) {
        dispatch({
          type: 'UPDATE_ZONE',
          payload: {
            id: 'north-stand',
            updates: {
              currentOccupancy: Math.round(northStand.maxCapacity * 0.72),
              density: 'medium',
              trend: 'falling',
            },
          },
        });
      }
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 9000);

    // Step 5: Tour complete, playback proof unlocked
    const t4 = setTimeout(() => {
      setTourStep('5. Walkthrough Complete! Scrub timeline below to prove warnings occurred early.');
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 12000);

    timeoutsRef.current = [t1, t2, t3, t4];
  };

  // ---- Gate B Failure Simulation ----
  const runGateFailure = () => {
    dispatch({ type: 'RECORD_HISTORY_TICK' });
    const t1 = setTimeout(() => {
      dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-b', status: 'closed' } });
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 1000);

    const t2 = setTimeout(() => {
      dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-a', status: 'congested' } });
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 3000);

    const t3 = setTimeout(() => {
      dispatch({ type: 'TOGGLE_GATE', payload: { id: 'gate-c', status: 'congested' } });
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 5000);

    timeoutsRef.current = [t1, t2, t3];
  };

  // ---- Sudden Rain Simulation ----
  const runSuddenRain = () => {
    dispatch({ type: 'RECORD_HISTORY_TICK' });
    const t1 = setTimeout(() => {
      dispatch({
        type: 'UPDATE_ZONE',
        payload: {
          id: 'east-stand',
          updates: { currentOccupancy: 2000, density: 'low', trend: 'falling' },
        },
      });
      dispatch({
        type: 'UPDATE_ZONE',
        payload: {
          id: 'west-stand',
          updates: { currentOccupancy: 1500, density: 'low', trend: 'falling' },
        },
      });
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 2000);

    const t2 = setTimeout(() => {
      dispatch({
        type: 'UPDATE_ZONE',
        payload: {
          id: 'north-stand',
          updates: { currentOccupancy: 11500, density: 'critical', trend: 'rising' },
        },
      });
      dispatch({
        type: 'UPDATE_ZONE',
        payload: {
          id: 'south-stand',
          updates: { currentOccupancy: 11800, density: 'critical', trend: 'rising' },
        },
      });
      dispatch({ type: 'RECORD_HISTORY_TICK' });
    }, 4000);

    timeoutsRef.current = [t1, t2];
  };

  // ---- Zone Overcrowding Simulation ----
  const runOvercrowding = () => {
    dispatch({ type: 'RECORD_HISTORY_TICK' });
    const steps = [0.78, 0.85, 0.90, 0.95, 0.98];

    steps.forEach((pct, i) => {
      const t = setTimeout(() => {
        const maxCap = 12000;
        const occ = Math.round(maxCap * pct);
        dispatch({
          type: 'UPDATE_ZONE',
          payload: {
            id: 'north-stand',
            updates: {
              currentOccupancy: occ,
              density: getDensityLevel(occ, maxCap),
              trend: 'rising',
            },
          },
        });
        dispatch({ type: 'RECORD_HISTORY_TICK' });
      }, (i + 1) * 2000);
      timeoutsRef.current.push(t);
    });
  };

  return (
    <>
      {/* Simulation / Tour Status Banner */}
      <AnimatePresence>
        {state.simulationActive && (
          <motion.div
            className="simulation-banner px-4 py-2.5 flex items-center justify-between border-b border-amber-200"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-700 pulse-dot" />
              <div>
                <span className="text-[13px] font-bold text-amber-800 uppercase">
                  SIMULATION ACTIVE: {simulations.find((s) => s.id === runningSimId)?.name}
                </span>
                {tourStep && (
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">{tourStep}</p>
                )}
              </div>
            </div>
            <button
              onClick={clearSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 text-amber-800 text-[12px] font-semibold hover:bg-white transition-colors cursor-pointer border border-amber-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed top-20 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900">
                      Simulate Incident
                    </h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      Trigger dynamic cascade flows & AI analysis
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {simulations.map((sim) => {
                    const Icon = sim.icon;
                    const isGuided = sim.id === 'guided-demo';
                    return (
                      <button
                        key={sim.id}
                        onClick={() => runSimulation(sim.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer group ${
                          isGuided
                            ? 'border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 hover:border-blue-400'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: `${sim.color}15` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: sim.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-gray-900">
                                {sim.name}
                              </span>
                              {isGuided && (
                                <span className="px-1.5 py-0.5 rounded-md text-[8px] font-extrabold bg-blue-100 text-blue-700 uppercase">
                                  Fav
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {sim.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {state.simulationActive && (
                  <button
                    onClick={clearSimulation}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Live State
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
