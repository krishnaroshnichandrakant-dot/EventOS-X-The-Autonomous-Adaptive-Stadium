'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Minus, Users, Droplets, Shield } from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { getDensityColor } from '@/data/mockData';

export default function ZoneDetailPanel() {
  const { state, dispatch } = useStadium();
  const zone = state.zones.find((z) => z.id === state.selectedZoneId);

  const close = () => dispatch({ type: 'SELECT_ZONE', payload: null });

  const pct = zone
    ? Math.round((zone.currentOccupancy / zone.maxCapacity) * 100)
    : 0;

  const TrendIcon =
    zone?.trend === 'rising'
      ? TrendingUp
      : zone?.trend === 'falling'
      ? TrendingDown
      : Minus;

  const trendColor =
    zone?.trend === 'rising'
      ? 'text-red-500'
      : zone?.trend === 'falling'
      ? 'text-emerald-500'
      : 'text-gray-400';

  return (
    <AnimatePresence>
      {zone && (
        <motion.div
          className="card p-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-gray-900">{zone.name}</h3>
            <button
              onClick={close}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Density Ring */}
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={getDensityColor(zone.density)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 327} 327`}
                  initial={{ strokeDasharray: '0 327' }}
                  animate={{ strokeDasharray: `${(pct / 100) * 327} 327` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{pct}%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                  Density
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Occupancy</span>
              </div>
              <div className="text-[14px] font-semibold text-gray-900">
                {zone.currentOccupancy.toLocaleString()}
                <span className="text-gray-400 font-normal text-[12px]">
                  {' '}
                  / {zone.maxCapacity.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                <span className="text-[11px] text-gray-400">Trend</span>
              </div>
              <div className={`text-[14px] font-semibold capitalize ${trendColor}`}>
                {zone.trend}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Covered</span>
              </div>
              <div className="text-[14px] font-semibold text-gray-900">
                {zone.isCovered ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1.5 mb-1">
                <Droplets className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Hydration</span>
              </div>
              <div className="text-[14px] font-semibold text-gray-900">
                {zone.hasHydration ? 'Active' : 'None'}
              </div>
            </div>
          </div>

          {/* Density Level Badge */}
          <div
            className={`p-3 rounded-lg border-l-4 text-[12px] risk-bg-${zone.density}`}
            style={{ borderColor: getDensityColor(zone.density) }}
          >
            <span className="font-semibold capitalize">{zone.density} Density</span>
            <span className="text-gray-500">
              {zone.density === 'critical'
                ? ' — Immediate attention required. Risk of overcrowding.'
                : zone.density === 'high'
                ? ' — Approaching capacity. Monitor closely.'
                : zone.density === 'medium'
                ? ' — Normal operations. Steady flow.'
                : ' — Well within capacity. No concerns.'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
