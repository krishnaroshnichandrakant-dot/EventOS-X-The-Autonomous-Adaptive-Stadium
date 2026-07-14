'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  DoorClosed,
  CloudRain,
  Users,
  Thermometer,
  Zap,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { RiskLevel } from '@/types';

const riskIcons: Record<string, typeof ShieldAlert> = {
  'door-closed': DoorClosed,
  'cloud-rain': CloudRain,
  users: Users,
  thermometer: Thermometer,
  zap: Zap,
};

const riskConfig: Record<RiskLevel, { bg: string; text: string; badge: string; barColor: string }> = {
  low: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'badge-success',
    barColor: '#10B981',
  },
  medium: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'badge-warning',
    barColor: '#F59E0B',
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    badge: 'badge-danger',
    barColor: '#F97316',
  },
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'badge-danger',
    barColor: '#EF4444',
  },
};

export default function RiskPanel() {
  const { state, dispatch } = useStadium();

  const activeRisks = state.risks
    .filter((r) => r.isActive)
    .sort((a, b) => {
      const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });

  const inactiveRisks = state.risks.filter((r) => !r.isActive);

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Risk Assessment</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {activeRisks.length} active scenario{activeRisks.length !== 1 ? 's' : ''} detected
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">Live</span>
        </div>
      </div>

      {/* Active Risks */}
      <div className="space-y-2.5">
        {activeRisks.map((risk, i) => {
          const config = riskConfig[risk.riskLevel];
          const Icon = riskIcons[risk.icon] || ShieldAlert;

          return (
            <motion.button
              key={risk.id}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${config.bg} border-transparent`}
              onClick={() => dispatch({ type: 'SELECT_RISK', payload: risk.id })}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg bg-white/80 flex-shrink-0`}
                >
                  <Icon className={`w-4.5 h-4.5 ${config.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-gray-900 truncate">
                      {risk.name}
                    </span>
                    <span className={`badge text-[9px] ${config.badge}`}>
                      {risk.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  {/* Probability Bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: config.barColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${risk.probability}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">
                      {risk.probability}%
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 line-clamp-2">
                    {risk.recommendedActions[0]}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Inactive Risks */}
      {inactiveRisks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">
            Monitoring ({inactiveRisks.length})
          </p>
          <div className="space-y-1.5">
            {inactiveRisks.map((risk) => {
              const Icon = riskIcons[risk.icon] || ShieldAlert;
              return (
                <div
                  key={risk.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => dispatch({ type: 'SELECT_RISK', payload: risk.id })}
                >
                  <Icon className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-[12px] text-gray-400">{risk.name}</span>
                  <span className="ml-auto text-[10px] text-gray-300">
                    {risk.probability}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
