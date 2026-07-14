'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DoorOpen, DoorClosed, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { GateStatus } from '@/types';

export default function GateStatusList() {
  const { state, dispatch } = useStadium();

  const toggleGate = (gateId: string, currentStatus: GateStatus) => {
    const nextStatus: GateStatus =
      currentStatus === 'open' ? 'closed' : currentStatus === 'closed' ? 'open' : 'open';
    dispatch({ type: 'TOGGLE_GATE', payload: { id: gateId, status: nextStatus } });
  };

  const statusConfig = {
    open: {
      icon: DoorOpen,
      label: 'Open',
      badgeClass: 'badge-success',
      btnLabel: 'Close',
      btnClass: 'text-red-500 hover:bg-red-50',
    },
    closed: {
      icon: DoorClosed,
      label: 'Closed',
      badgeClass: 'badge-danger',
      btnLabel: 'Open',
      btnClass: 'text-emerald-500 hover:bg-emerald-50',
    },
    congested: {
      icon: AlertTriangle,
      label: 'Congested',
      badgeClass: 'badge-warning',
      btnLabel: 'Reset',
      btnClass: 'text-blue-500 hover:bg-blue-50',
    },
  };

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Gate Status</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Real-time gate monitoring</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {state.gates.map((gate, i) => {
          const config = statusConfig[gate.status];
          const Icon = config.icon;
          const flowPct = gate.maxFlowRate > 0 ? (gate.flowRate / gate.maxFlowRate) * 100 : 0;

          return (
            <motion.div
              key={gate.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/70 hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Icon */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  gate.status === 'open'
                    ? 'bg-emerald-50'
                    : gate.status === 'congested'
                    ? 'bg-amber-50'
                    : 'bg-red-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    gate.status === 'open'
                      ? 'text-emerald-600'
                      : gate.status === 'congested'
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-gray-900">
                    {gate.name}
                  </span>
                  <span className={`badge text-[10px] ${config.badgeClass}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-gray-400">
                    {gate.flowRate}/{gate.maxFlowRate} ppl/min
                  </span>
                  {/* Flow bar */}
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[60px]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${flowPct}%`,
                        backgroundColor:
                          flowPct > 85 ? '#EF4444' : flowPct > 60 ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleGate(gate.id, gate.status)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${config.btnClass}`}
              >
                {config.btnLabel}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
