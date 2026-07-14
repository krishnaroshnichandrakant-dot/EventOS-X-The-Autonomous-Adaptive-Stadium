'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useStadium } from '@/store/stadiumStore';
import { getDensityColor, getDensityBg } from '@/data/mockData';
import { DensityLevel } from '@/types';

export default function StadiumMap() {
  const { state, dispatch } = useStadium();

  const handleZoneClick = (zoneId: string) => {
    dispatch({
      type: 'SELECT_ZONE',
      payload: state.selectedZoneId === zoneId ? null : zoneId,
    });
  };

  // Find zone by id for tooltip data
  const getZone = (id: string) => state.zones.find((z) => z.id === id);

  // Calculate occupancy percentage
  const pct = (zoneId: string) => {
    const z = getZone(zoneId);
    if (!z) return 0;
    return Math.round((z.currentOccupancy / z.maxCapacity) * 100);
  };

  const renderMapLayout = () => {
    switch (state.selectedStadiumId) {
      case 'camp-nou':
        return (
          <>
            {/* Camp Nou Layout - Concentric Tiers */}
            {/* Pitch Markings */}
            <g opacity="0.3">
              <rect x="330" y="205" width="140" height="90" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="400" cy="250" r="18" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="400" y1="205" x2="400" y2="295" stroke="#38bdf8" strokeWidth="0.8" />
            </g>
            
            {/* Pitch Side */}
            <ZonePath
              id="pitch-side"
              d="M 330,205 L 470,205 L 470,295 L 330,295 Z"
              zone={getZone('pitch-side')}
              isSelected={state.selectedZoneId === 'pitch-side'}
              onClick={() => handleZoneClick('pitch-side')}
            />

            {/* Lower Tier - Donut Ring */}
            <ZonePath
              id="lower-tier"
              d="M 400,120 A 130,130 0 1,0 400,380 A 130,130 0 1,0 400,120 M 400,165 A 85,85 0 1,1 400,335 A 85,85 0 1,1 400,165 Z"
              zone={getZone('lower-tier')}
              isSelected={state.selectedZoneId === 'lower-tier'}
              onClick={() => handleZoneClick('lower-tier')}
            />

            {/* VIP Suites - Concentric Ring */}
            <ZonePath
              id="vip-suites"
              d="M 400,95 A 155,155 0 1,0 400,405 A 155,155 0 1,0 400,95 M 400,120 A 130,130 0 1,1 400,380 A 130,130 0 1,1 400,120 Z"
              zone={getZone('vip-suites')}
              isSelected={state.selectedZoneId === 'vip-suites'}
              onClick={() => handleZoneClick('vip-suites')}
            />

            {/* Mid Tier - Large Donut Ring */}
            <ZonePath
              id="mid-tier"
              d="M 400,50 A 200,200 0 1,0 400,450 A 200,200 0 1,0 400,50 M 400,95 A 155,155 0 1,1 400,405 A 155,155 0 1,1 400,95 Z"
              zone={getZone('mid-tier')}
              isSelected={state.selectedZoneId === 'mid-tier'}
              onClick={() => handleZoneClick('mid-tier')}
            />

            {/* West Concourse (Left outer wing arc) */}
            <ZonePath
              id="west-concourse"
              d="M 200,125 A 250,250 0 0,0 200,375 L 180,350 A 220,220 0 0,1 180,150 Z"
              zone={getZone('west-concourse')}
              isSelected={state.selectedZoneId === 'west-concourse'}
              onClick={() => handleZoneClick('west-concourse')}
            />

            {/* East Concourse (Right outer wing arc) */}
            <ZonePath
              id="east-concourse"
              d="M 600,125 A 250,250 0 0,1 600,375 L 620,350 A 220,220 0 0,0 620,150 Z"
              zone={getZone('east-concourse')}
              isSelected={state.selectedZoneId === 'east-concourse'}
              onClick={() => handleZoneClick('east-concourse')}
            />

            {/* Upper Tier - Outer concentric ring */}
            <ZonePath
              id="upper-tier"
              d="M 400,10 A 240,240 0 1,0 400,490 A 240,240 0 1,0 400,10 M 400,50 A 200,200 0 1,1 400,450 A 200,200 0 1,1 400,50 Z"
              zone={getZone('upper-tier')}
              isSelected={state.selectedZoneId === 'upper-tier'}
              onClick={() => handleZoneClick('upper-tier')}
            />
          </>
        );
      case 'metlife':
        return (
          <>
            {/* MetLife Layout - Rectangular Grid */}
            {/* Inner Pitch */}
            <g opacity="0.3">
              <rect x="330" y="205" width="140" height="90" rx="2" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="400" y1="205" x2="400" y2="295" stroke="#38bdf8" strokeWidth="0.8" />
              <circle cx="400" cy="250" r="22" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
            </g>

            {/* Field Level */}
            <ZonePath
              id="field-level"
              d="M 270,160 L 530,160 L 530,340 L 270,340 Z M 310,190 L 310,310 L 490,310 L 490,190 Z"
              zone={getZone('field-level')}
              isSelected={state.selectedZoneId === 'field-level'}
              onClick={() => handleZoneClick('field-level')}
            />

            {/* Club Level */}
            <ZonePath
              id="club-level"
              d="M 220,120 L 580,120 L 580,380 L 220,380 Z M 270,160 L 270,340 L 530,340 L 530,160 Z"
              zone={getZone('club-level')}
              isSelected={state.selectedZoneId === 'club-level'}
              onClick={() => handleZoneClick('club-level')}
            />

            {/* North Endzone */}
            <ZonePath
              id="north-endzone"
              d="M 220,30 L 580,30 L 580,110 L 220,110 Z"
              zone={getZone('north-endzone')}
              isSelected={state.selectedZoneId === 'north-endzone'}
              onClick={() => handleZoneClick('north-endzone')}
            />

            {/* South Endzone */}
            <ZonePath
              id="south-endzone"
              d="M 220,390 L 580,390 L 580,470 L 220,470 Z"
              zone={getZone('south-endzone')}
              isSelected={state.selectedZoneId === 'south-endzone'}
              onClick={() => handleZoneClick('south-endzone')}
            />

            {/* West Sideline */}
            <ZonePath
              id="west-sideline"
              d="M 70,120 L 210,120 L 210,380 L 70,380 Z"
              zone={getZone('west-sideline')}
              isSelected={state.selectedZoneId === 'west-sideline'}
              onClick={() => handleZoneClick('west-sideline')}
            />

            {/* East Sideline */}
            <ZonePath
              id="east-sideline"
              d="M 590,120 L 730,120 L 730,380 L 590,380 Z"
              zone={getZone('east-sideline')}
              isSelected={state.selectedZoneId === 'east-sideline'}
              onClick={() => handleZoneClick('east-sideline')}
            />
          </>
        );
      case 'wembley':
      default:
        return (
          <>
            {/* Wembley Layout (Oval shape) */}
            {/* Field markings */}
            <g opacity="0.3">
              <rect x="260" y="180" width="280" height="140" rx="4" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="400" y1="180" x2="400" y2="320" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="400" cy="250" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" />
            </g>

            {/* Field Level */}
            <ZonePath
              id="field-level"
              d="M 250,170 L 550,170 L 550,330 L 250,330 Z"
              zone={getZone('field-level')}
              isSelected={state.selectedZoneId === 'field-level'}
              onClick={() => handleZoneClick('field-level')}
            />

            {/* North Stand */}
            <ZonePath
              id="north-stand"
              d="M 160,60 Q 400,15 640,60 L 590,150 Q 400,120 210,150 Z"
              zone={getZone('north-stand')}
              isSelected={state.selectedZoneId === 'north-stand'}
              onClick={() => handleZoneClick('north-stand')}
            />

            {/* South Stand */}
            <ZonePath
              id="south-stand"
              d="M 210,350 Q 400,380 590,350 L 640,440 Q 400,485 160,440 Z"
              zone={getZone('south-stand')}
              isSelected={state.selectedZoneId === 'south-stand'}
              onClick={() => handleZoneClick('south-stand')}
            />

            {/* East Stand */}
            <ZonePath
              id="east-stand"
              d="M 600,155 L 645,65 Q 740,130 760,250 Q 740,370 645,435 L 600,345 Q 670,290 670,250 Q 670,210 600,155 Z"
              zone={getZone('east-stand')}
              isSelected={state.selectedZoneId === 'east-stand'}
              onClick={() => handleZoneClick('east-stand')}
            />

            {/* West Stand */}
            <ZonePath
              id="west-stand"
              d="M 200,155 L 155,65 Q 60,130 40,250 Q 60,370 155,435 L 200,345 Q 130,290 130,250 Q 130,210 200,155 Z"
              zone={getZone('west-stand')}
              isSelected={state.selectedZoneId === 'west-stand'}
              onClick={() => handleZoneClick('west-stand')}
            />

            {/* VIP Lounge */}
            <ZonePath
              id="vip-lounge"
              d="M 310,330 L 490,330 L 490,370 Q 400,375 310,370 Z"
              zone={getZone('vip-lounge')}
              isSelected={state.selectedZoneId === 'vip-lounge'}
              onClick={() => handleZoneClick('vip-lounge')}
            />

            {/* Concourse North */}
            <ZonePath
              id="concourse-north"
              d="M 220,148 Q 400,118 580,148 L 585,158 Q 400,128 215,158 Z"
              zone={getZone('concourse-north')}
              isSelected={state.selectedZoneId === 'concourse-north'}
              onClick={() => handleZoneClick('concourse-north')}
            />

            {/* Concourse South */}
            <ZonePath
              id="concourse-south"
              d="M 215,342 Q 400,372 585,342 L 580,352 Q 400,382 220,352 Z"
              zone={getZone('concourse-south')}
              isSelected={state.selectedZoneId === 'concourse-south'}
              onClick={() => handleZoneClick('concourse-south')}
            />
          </>
        );
    }
  };

  const renderGates = () => {
    switch (state.selectedStadiumId) {
      case 'camp-nou':
        return (
          <>
            <GateLabel x={625} y={145} gate={state.gates.find((g) => g.id === 'gate-1')} />
            <GateLabel x={540} y={405} gate={state.gates.find((g) => g.id === 'gate-2')} />
            <GateLabel x={260} y={405} gate={state.gates.find((g) => g.id === 'gate-3')} />
            <GateLabel x={175} y={145} gate={state.gates.find((g) => g.id === 'gate-4')} />
            <GateLabel x={180} y={250} gate={state.gates.find((g) => g.id === 'gate-5')} />
          </>
        );
      case 'metlife':
        return (
          <>
            <GateLabel x={400} y={25} gate={state.gates.find((g) => g.id === 'gate-verizon')} />
            <GateLabel x={745} y={250} gate={state.gates.find((g) => g.id === 'gate-budlight')} />
            <GateLabel x={400} y={475} gate={state.gates.find((g) => g.id === 'gate-pepsi')} />
            <GateLabel x={55} y={250} gate={state.gates.find((g) => g.id === 'gate-metlife')} />
          </>
        );
      case 'wembley':
      default:
        return (
          <>
            <GateLabel x={230} y={48} gate={state.gates.find((g) => g.id === 'gate-a')} />
            <GateLabel x={540} y={48} gate={state.gates.find((g) => g.id === 'gate-b')} />
            <GateLabel x={760} y={250} gate={state.gates.find((g) => g.id === 'gate-c')} />
            <GateLabel x={530} y={465} gate={state.gates.find((g) => g.id === 'gate-d')} />
            <GateLabel x={35} y={370} gate={state.gates.find((g) => g.id === 'gate-e')} />
            <GateLabel x={35} y={140} gate={state.gates.find((g) => g.id === 'gate-f')} />
          </>
        );
    }
  };

  const renderZoneLabels = () => {
    const labelPositions: Record<string, Record<string, { x: number; y: number; isDarkLabel?: boolean }>> = {
      'wembley': {
        'north-stand': { x: 400, y: 95 },
        'south-stand': { x: 400, y: 405 },
        'east-stand': { x: 690, y: 250 },
        'west-stand': { x: 110, y: 250 },
        'vip-lounge': { x: 400, y: 352 },
        'concourse-north': { x: 400, y: 155 },
        'concourse-south': { x: 400, y: 348 },
        'field-level': { x: 400, y: 250, isDarkLabel: true },
      },
      'camp-nou': {
        'upper-tier': { x: 400, y: 32 },
        'mid-tier': { x: 400, y: 76 },
        'vip-suites': { x: 400, y: 110 },
        'lower-tier': { x: 400, y: 145 },
        'pitch-side': { x: 400, y: 250, isDarkLabel: true },
        'east-concourse': { x: 610, y: 250 },
        'west-concourse': { x: 190, y: 250 },
      },
      'metlife': {
        'north-endzone': { x: 400, y: 70 },
        'south-endzone': { x: 400, y: 430 },
        'east-sideline': { x: 660, y: 250 },
        'west-sideline': { x: 140, y: 250 },
        'club-level': { x: 400, y: 140 },
        'field-level': { x: 400, y: 325, isDarkLabel: true },
      }
    };

    const currentPositions = labelPositions[state.selectedStadiumId] || labelPositions.wembley;

    return state.zones.map((zone) => {
      const pos = currentPositions[zone.id];
      if (!pos) return null;
      return (
        <g key={zone.id}>
          <text
            x={pos.x}
            y={pos.y - 6}
            textAnchor="middle"
            className="text-[11px] font-bold"
            fill={pos.isDarkLabel ? '#10b981' : '#f8fafc'}
            style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
          >
            {zone.shortName}
          </text>
          <text
            x={pos.x}
            y={pos.y + 8}
            textAnchor="middle"
            className="text-[10px] font-semibold"
            fill={pos.isDarkLabel ? '#047857' : '#94a3b8'}
            style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
          >
            {pct(zone.id)}%
          </text>
        </g>
      );
    });
  };

  return (
    <motion.div
      className="bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden rounded-2xl p-5 text-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-white">Stadium Overview</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Live zone density HUD map</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Low
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> High
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" /> Critical
          </span>
        </div>
      </div>

      {/* SVG Stadium Map */}
      <div className="relative w-full aspect-[16/10] max-h-[420px] bg-[#020617] rounded-xl border border-slate-800/80 overflow-hidden shadow-inner">
        
        {/* Futuristic Radar Grid Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full relative z-10"
        >
          <defs>
            {/* Neon Glow Filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients for Density Fills */}
            <linearGradient id="grad-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="grad-medium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="grad-high" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad-critical" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.55" />
            </linearGradient>

            {/* Hover state gradients */}
            <linearGradient id="grad-low-hover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-medium-hover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-high-hover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="grad-critical-hover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Holographic Radar Backdrop Lines */}
          <g opacity="0.12">
            <line x1="400" y1="20" x2="400" y2="480" stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="20" y1="250" x2="780" y2="250" stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="400" cy="250" r="100" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="400" cy="250" r="180" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="400" cy="250" r="260" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
          </g>

          {/* Stadium Boundary Rings */}
          <ellipse
            cx="400"
            cy="250"
            rx="370"
            ry="220"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Dynamic Map Layout */}
          {renderMapLayout()}

          {/* Gate Labels */}
          {renderGates()}

          {/* Zone Labels */}
          {renderZoneLabels()}
        </svg>
      </div>

      {/* Active Predictive Warnings (Wow #1) */}
      {state.predictions && state.predictions.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-dot" />
            <h4 className="text-[12px] font-bold text-rose-300 uppercase tracking-wider">
              Active Cascade Predictions
            </h4>
          </div>
          <div className="space-y-1">
            {state.predictions.map((p, i) => (
              <div key={i} className="text-[12px] text-rose-200 leading-normal">
                ⚠️ <span className="font-semibold">{p.reason}</span> Will breach 90% threshold in{' '}
                <span className="font-bold text-red-400">{p.timeToBreachMinutes} minutes</span>. Recommended: {p.recommendation}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Zone Path Component
// ============================================================

interface ZonePathProps {
  id: string;
  d: string;
  zone: ReturnType<typeof Object.assign> | undefined;
  isSelected: boolean;
  onClick: () => void;
}

function ZonePath({ id, d, zone, isSelected, onClick }: ZonePathProps) {
  if (!zone) return <path d={d} fill="#1e293b" opacity="0.2" />;

  const gradId = `url(#grad-${zone.density})`;
  const hoverGradId = `url(#grad-${zone.density}-hover)`;

  const borderColors: Record<DensityLevel, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  };

  const activeBorder = isSelected ? '#38bdf8' : borderColors[zone.density];

  return (
    <motion.path
      d={d}
      fill={gradId}
      stroke={activeBorder}
      strokeWidth={isSelected ? 3.5 : 1.2}
      className="stadium-zone cursor-pointer"
      onClick={onClick}
      filter={isSelected ? 'url(#neon-glow)' : 'none'}
      whileHover={{ fill: hoverGradId, strokeWidth: isSelected ? 4 : 2.0 }}
      transition={{ duration: 0.15 }}
      style={{
        strokeLinejoin: 'round',
        fillRule: 'evenodd',
      }}
    >
      <title>
        {zone.name}: {zone.currentOccupancy.toLocaleString()} / {zone.maxCapacity.toLocaleString()} ({Math.round((zone.currentOccupancy / zone.maxCapacity) * 100)}%)
      </title>
    </motion.path>
  );
}

// ============================================================
// Gate Label Component
// ============================================================

function GateLabel({ x, y, gate }: { x: number; y: number; gate: any }) {
  if (!gate) return null;
  
  const color =
    gate.status === 'open'
      ? '#10B981'
      : gate.status === 'congested'
      ? '#F59E0B'
      : '#EF4444';

  return (
    <g className="cursor-pointer">
      {/* Outer pulsing ring for warning states */}
      {gate.status !== 'open' && (
        <circle
          cx={x}
          cy={y}
          r={17}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity="0.3"
          className="animate-ping"
          style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2s' }}
        />
      )}
      <circle cx={x} cy={y} r={11} fill="#020617" stroke={color} strokeWidth={2} />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        fill={color}
        style={{ fontSize: '8.5px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}
      >
        {gate.name.replace('Gate ', '').substring(0, 3)}
      </text>
    </g>
  );
}
