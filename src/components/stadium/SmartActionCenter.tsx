'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStadium } from '@/store/stadiumStore';
import { stadiumsList, getDensityColor } from '@/data/mockData';
import { Zone, Gate } from '@/types';
import {
  AlertTriangle,
  ArrowRightLeft,
  CloudRain,
  DoorOpen,
  ShieldCheck,
  Zap,
  Droplets,
  ThermometerSun,
} from 'lucide-react';

interface SuggestedAction {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'info';
  action: () => void;
  actionLabel: string;
}

export default function SmartActionCenter() {
  const { state, dispatch } = useStadium();
  const config = stadiumsList[state.selectedStadiumId];

  // ============================================================
  // Dynamically generate suggested actions from live state
  // ============================================================
  const suggestions: SuggestedAction[] = [];

  // 1. Congested gate rerouting
  const congestedGates = state.gates.filter((g) => g.status === 'congested');
  const openGates = state.gates.filter((g) => g.status === 'open');
  congestedGates.forEach((cg) => {
    const nearbyOpen = openGates.find(
      (og) =>
        og.position === cg.position ||
        og.flowRate < og.maxFlowRate * 0.6
    );
    if (nearbyOpen) {
      suggestions.push({
        id: `reroute-${cg.id}`,
        icon: <ArrowRightLeft className="w-4 h-4" />,
        title: `Reroute ${cg.name} Congestion`,
        description: `${cg.name} is at ${Math.round((cg.flowRate / cg.maxFlowRate) * 100)}% capacity. Redirect traffic to ${nearbyOpen.name} (${Math.round((nearbyOpen.flowRate / nearbyOpen.maxFlowRate) * 100)}% load).`,
        severity: 'warning',
        actionLabel: 'Reroute Traffic',
        action: () => {
          dispatch({
            type: 'BULK_UPDATE',
            payload: {
              gates: state.gates.map((g) => {
                if (g.id === cg.id) return { ...g, status: 'open' as const, flowRate: Math.round(g.maxFlowRate * 0.5) };
                if (g.id === nearbyOpen.id) return { ...g, flowRate: Math.min(g.maxFlowRate, g.flowRate + Math.round(cg.flowRate * 0.4)) };
                return g;
              }),
            },
          });
        },
      });
    }
  });

  // 2. Critical density zones
  const criticalZones = state.zones.filter((z) => z.density === 'critical');
  criticalZones.forEach((cz) => {
    suggestions.push({
      id: `critical-${cz.id}`,
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `${cz.name}: Critical Density`,
      description: `Occupancy at ${Math.round((cz.currentOccupancy / cz.maxCapacity) * 100)}% (${cz.currentOccupancy.toLocaleString()} / ${cz.maxCapacity.toLocaleString()}). Recommend crowd dispersal.`,
      severity: 'danger',
      actionLabel: 'Disperse Crowd',
      action: () => {
        dispatch({
          type: 'BULK_UPDATE',
          payload: {
            zones: state.zones.map((z) =>
              z.id === cz.id
                ? { ...z, currentOccupancy: Math.round(z.maxCapacity * 0.7), density: 'high' as const, trend: 'falling' as const }
                : z
            ),
          },
        });
      },
    });
  });

  // 3. High density rising
  const risingHighZones = state.zones.filter((z) => z.density === 'high' && z.trend === 'rising');
  risingHighZones.forEach((rz) => {
    suggestions.push({
      id: `rising-${rz.id}`,
      icon: <Zap className="w-4 h-4" />,
      title: `${rz.name}: Rapidly Filling`,
      description: `Occupancy trending up at ${Math.round((rz.currentOccupancy / rz.maxCapacity) * 100)}%. Deploy stewards to manage flow.`,
      severity: 'warning',
      actionLabel: 'Deploy Stewards',
      action: () => {
        dispatch({
          type: 'BULK_UPDATE',
          payload: {
            zones: state.zones.map((z) =>
              z.id === rz.id ? { ...z, trend: 'stable' as const } : z
            ),
          },
        });
      },
    });
  });

  // 4. Weather — rain on uncovered zones
  const rainChance = state.weather?.current?.rainProbability ?? 0;
  const uncoveredZones = state.zones.filter((z) => !z.isCovered);
  if (rainChance > 40 && uncoveredZones.length > 0) {
    suggestions.push({
      id: 'weather-rain',
      icon: <CloudRain className="w-4 h-4" />,
      title: `Rain Alert — ${uncoveredZones.length} Uncovered Zone${uncoveredZones.length > 1 ? 's' : ''}`,
      description: `${rainChance}% rain probability. ${uncoveredZones.map((z) => z.shortName).join(', ')} are open-air. Alert field staff to deploy cover.`,
      severity: 'info',
      actionLabel: 'Alert Field Staff',
      action: () => {
        // Mark them as "covered" to simulate shelter deployment
        dispatch({
          type: 'BULK_UPDATE',
          payload: {
            zones: state.zones.map((z) =>
              !z.isCovered ? { ...z, isCovered: true } : z
            ),
          },
        });
      },
    });
  }

  // 5. No hydration in high-density zones
  const dehydrationRisk = state.zones.filter((z) => !z.hasHydration && (z.density === 'high' || z.density === 'critical'));
  if (dehydrationRisk.length > 0) {
    suggestions.push({
      id: 'hydration-alert',
      icon: <Droplets className="w-4 h-4" />,
      title: `Hydration Alert — ${dehydrationRisk.length} Zone${dehydrationRisk.length > 1 ? 's' : ''}`,
      description: `${dehydrationRisk.map((z) => z.shortName).join(', ')} ${dehydrationRisk.length > 1 ? 'have' : 'has'} no hydration stations but high crowd density. Deploy water tankers.`,
      severity: 'warning',
      actionLabel: 'Deploy Water',
      action: () => {
        dispatch({
          type: 'BULK_UPDATE',
          payload: {
            zones: state.zones.map((z) =>
              !z.hasHydration && (z.density === 'high' || z.density === 'critical')
                ? { ...z, hasHydration: true }
                : z
            ),
          },
        });
      },
    });
  }

  // 6. All gates open? Suggest closing unused ones
  const closedGates = state.gates.filter((g) => g.status === 'closed');
  if (closedGates.length > 0 && state.eventStatus === 'post-event') {
    suggestions.push({
      id: 'close-gates',
      icon: <DoorOpen className="w-4 h-4" />,
      title: 'Post-Event: Secure Perimeter',
      description: `Event has ended. ${closedGates.length} gate${closedGates.length > 1 ? 's are' : ' is'} already closed. Close all remaining gates to secure the venue.`,
      severity: 'info',
      actionLabel: 'Close All Gates',
      action: () => {
        dispatch({
          type: 'BULK_UPDATE',
          payload: {
            gates: state.gates.map((g) => ({
              ...g,
              status: 'closed' as const,
              flowRate: 0,
            })),
          },
        });
      },
    });
  }

  const severityConfig = {
    danger: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', btn: 'bg-red-600 hover:bg-red-700 text-white' },
    warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
    info: { border: 'border-sky-500/30', bg: 'bg-sky-500/10', text: 'text-sky-400', btn: 'bg-sky-600 hover:bg-sky-700 text-white' },
  };

  if (suggestions.length === 0) {
    return (
      <motion.div
        className="bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-5 shadow-2xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-[14px] font-semibold text-white">Smart Operations Center</h3>
        </div>
        <p className="text-[12px] text-emerald-400/90 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          All systems nominal. No actions required.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl px-5 pt-5 pb-4 shadow-2xl"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-[14px] font-semibold text-white">Smart Operations Center</h3>
          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{suggestions.length} Action{suggestions.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s, i) => {
            const cfg = severityConfig[s.severity];
            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.border} ${cfg.bg}`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${cfg.text}`}>{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-white">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{s.description}</p>
                </div>
                <button
                  onClick={s.action}
                  className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${cfg.btn}`}
                >
                  {s.actionLabel}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
