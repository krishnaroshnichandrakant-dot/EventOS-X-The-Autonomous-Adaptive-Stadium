'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Clock, Users, DoorOpen, Activity, ChevronDown } from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { getStadiumStats, stadiumsList } from '@/data/mockData';

interface TopBarProps {
  onSimulate: () => void;
}

export default function TopBar({ onSimulate }: TopBarProps) {
  const { state, dispatch } = useStadium();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = getStadiumStats(state.zones, state.gates);

  const eventStatusLabel: Record<string, { text: string; class: string }> = {
    'pre-event': { text: 'Pre-Event', class: 'badge-info' },
    live: { text: 'Event Live', class: 'badge-success' },
    halftime: { text: 'Halftime', class: 'badge-warning' },
    'post-event': { text: 'Post-Event', class: 'badge-neutral' },
  };

  const status = eventStatusLabel[state.eventStatus];

  return (
    <header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between flex-shrink-0">
      {/* Left: Stadium Info */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3 py-1.5 transition-all">
              <select
                value={state.selectedStadiumId}
                onChange={(e) => dispatch({ type: 'SET_STADIUM', payload: e.target.value })}
                className="text-[13px] font-bold text-slate-800 bg-transparent pr-6 focus:outline-none cursor-pointer appearance-none"
              >
                {Object.values(stadiumsList).map((stadium) => (
                  <option key={stadium.id} value={stadium.id}>
                    {stadium.name} ({stadium.city})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
            </div>
            <span className={`badge ${status.class}`}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  state.eventStatus === 'live' ? 'bg-emerald-500 pulse-dot' : 'bg-current'
                }`}
              />
              {status.text}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>
              {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Quick Stats */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 text-[13px]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {stats.totalOccupancy.toLocaleString()}
              <span className="text-gray-400 font-normal">
                {' '}
                / {stats.totalCapacity.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-gray-400">{stats.occupancyPercent}% Capacity</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        <div className="flex items-center gap-2 text-[13px]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
            <DoorOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {stats.openGates}
              <span className="text-gray-400 font-normal"> open</span>
              {stats.congestedGates > 0 && (
                <span className="text-amber-500 font-normal">
                  {' '}
                  · {stats.congestedGates} congested
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400">Gate Status</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        <div className="flex items-center gap-2 text-[13px]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {stats.totalFlowRate.toLocaleString()}
              <span className="text-gray-400 font-normal"> ppl/min</span>
            </div>
            <div className="text-[10px] text-gray-400">Total Flow</div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {state.simulationActive && (
          <span className="badge badge-warning text-[11px]">
            ⚡ SIMULATION ACTIVE
          </span>
        )}

        <button
          onClick={onSimulate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Simulate Incident
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
