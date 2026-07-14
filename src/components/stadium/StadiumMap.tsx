'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStadium } from '@/store/stadiumStore';
import { stadiumsList, getDensityColor } from '@/data/mockData';
import { DensityLevel, Zone } from '@/types';
import { ShieldAlert, Layers, Droplets, Umbrella, Grid3X3, Eye, EyeOff } from 'lucide-react';

export default function StadiumMap() {
  const { state, dispatch } = useStadium();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSeating, setShowSeating] = useState(true);
  const [showAmenities, setShowAmenities] = useState(true);

  const config = stadiumsList[state.selectedStadiumId];
  const layout = config?.layout || 'oval';

  const handleZoneClick = (zoneId: string) => {
    dispatch({
      type: 'SELECT_ZONE',
      payload: state.selectedZoneId === zoneId ? null : zoneId,
    });
  };

  const getZone = (id: string) => state.zones.find((z) => z.id === id);
  const pct = (zoneId: string) => {
    const z = getZone(zoneId);
    if (!z) return 0;
    return Math.round((z.currentOccupancy / z.maxCapacity) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredZoneData = hoveredZone ? getZone(hoveredZone) : null;

  // ============================================================
  // Map Layout Renderers
  // ============================================================
  const renderOvalLayout = () => (
    <>
      <g opacity="0.3">
        <rect x="260" y="180" width="280" height="140" rx="4" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="400" y1="180" x2="400" y2="320" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="400" cy="250" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" />
      </g>
      <ZP id="field-level" d="M 250,170 L 550,170 L 550,330 L 250,330 Z" zone={getZone('field-level')} sel={state.selectedZoneId === 'field-level'} onClick={() => handleZoneClick('field-level')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="north-stand" d="M 160,60 Q 400,15 640,60 L 590,150 Q 400,120 210,150 Z" zone={getZone('north-stand')} sel={state.selectedZoneId === 'north-stand'} onClick={() => handleZoneClick('north-stand')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="south-stand" d="M 210,350 Q 400,380 590,350 L 640,440 Q 400,485 160,440 Z" zone={getZone('south-stand')} sel={state.selectedZoneId === 'south-stand'} onClick={() => handleZoneClick('south-stand')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="east-stand" d="M 600,155 L 645,65 Q 740,130 760,250 Q 740,370 645,435 L 600,345 Q 670,290 670,250 Q 670,210 600,155 Z" zone={getZone('east-stand')} sel={state.selectedZoneId === 'east-stand'} onClick={() => handleZoneClick('east-stand')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="west-stand" d="M 200,155 L 155,65 Q 60,130 40,250 Q 60,370 155,435 L 200,345 Q 130,290 130,250 Q 130,210 200,155 Z" zone={getZone('west-stand')} sel={state.selectedZoneId === 'west-stand'} onClick={() => handleZoneClick('west-stand')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="vip-lounge" d="M 310,330 L 490,330 L 490,370 Q 400,375 310,370 Z" zone={getZone('vip-lounge')} sel={state.selectedZoneId === 'vip-lounge'} onClick={() => handleZoneClick('vip-lounge')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="concourse-north" d="M 220,148 Q 400,118 580,148 L 585,158 Q 400,128 215,158 Z" zone={getZone('concourse-north')} sel={state.selectedZoneId === 'concourse-north'} onClick={() => handleZoneClick('concourse-north')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="concourse-south" d="M 215,342 Q 400,372 585,342 L 580,352 Q 400,382 220,352 Z" zone={getZone('concourse-south')} sel={state.selectedZoneId === 'concourse-south'} onClick={() => handleZoneClick('concourse-south')} heatmap={showHeatmap} onHover={setHoveredZone} />
    </>
  );

  const renderConcentricLayout = () => (
    <>
      <g opacity="0.3">
        <rect x="330" y="205" width="140" height="90" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="400" cy="250" r="18" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
        <line x1="400" y1="205" x2="400" y2="295" stroke="#38bdf8" strokeWidth="0.8" />
      </g>
      <ZP id="pitch-side" d="M 330,205 L 470,205 L 470,295 L 330,295 Z" zone={getZone('pitch-side')} sel={state.selectedZoneId === 'pitch-side'} onClick={() => handleZoneClick('pitch-side')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="lower-tier" d="M 400,120 A 130,130 0 1,0 400,380 A 130,130 0 1,0 400,120 M 400,165 A 85,85 0 1,1 400,335 A 85,85 0 1,1 400,165 Z" zone={getZone('lower-tier')} sel={state.selectedZoneId === 'lower-tier'} onClick={() => handleZoneClick('lower-tier')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="vip-suites" d="M 400,95 A 155,155 0 1,0 400,405 A 155,155 0 1,0 400,95 M 400,120 A 130,130 0 1,1 400,380 A 130,130 0 1,1 400,120 Z" zone={getZone('vip-suites')} sel={state.selectedZoneId === 'vip-suites'} onClick={() => handleZoneClick('vip-suites')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="mid-tier" d="M 400,50 A 200,200 0 1,0 400,450 A 200,200 0 1,0 400,50 M 400,95 A 155,155 0 1,1 400,405 A 155,155 0 1,1 400,95 Z" zone={getZone('mid-tier')} sel={state.selectedZoneId === 'mid-tier'} onClick={() => handleZoneClick('mid-tier')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="west-concourse" d="M 200,125 A 250,250 0 0,0 200,375 L 180,350 A 220,220 0 0,1 180,150 Z" zone={getZone('west-concourse')} sel={state.selectedZoneId === 'west-concourse'} onClick={() => handleZoneClick('west-concourse')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="east-concourse" d="M 600,125 A 250,250 0 0,1 600,375 L 620,350 A 220,220 0 0,0 620,150 Z" zone={getZone('east-concourse')} sel={state.selectedZoneId === 'east-concourse'} onClick={() => handleZoneClick('east-concourse')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="upper-tier" d="M 400,10 A 240,240 0 1,0 400,490 A 240,240 0 1,0 400,10 M 400,50 A 200,200 0 1,1 400,450 A 200,200 0 1,1 400,50 Z" zone={getZone('upper-tier')} sel={state.selectedZoneId === 'upper-tier'} onClick={() => handleZoneClick('upper-tier')} heatmap={showHeatmap} onHover={setHoveredZone} />
    </>
  );

  const renderRectangularLayout = () => (
    <>
      <g opacity="0.3">
        <rect x="330" y="205" width="140" height="90" rx="2" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="400" y1="205" x2="400" y2="295" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="400" cy="250" r="22" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
      </g>
      <ZP id="field-level" d="M 270,160 L 530,160 L 530,340 L 270,340 Z M 310,190 L 310,310 L 490,310 L 490,190 Z" zone={getZone('field-level')} sel={state.selectedZoneId === 'field-level'} onClick={() => handleZoneClick('field-level')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="club-level" d="M 220,120 L 580,120 L 580,380 L 220,380 Z M 270,160 L 270,340 L 530,340 L 530,160 Z" zone={getZone('club-level')} sel={state.selectedZoneId === 'club-level'} onClick={() => handleZoneClick('club-level')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="north-endzone" d="M 220,30 L 580,30 L 580,110 L 220,110 Z" zone={getZone('north-endzone')} sel={state.selectedZoneId === 'north-endzone'} onClick={() => handleZoneClick('north-endzone')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="south-endzone" d="M 220,390 L 580,390 L 580,470 L 220,470 Z" zone={getZone('south-endzone')} sel={state.selectedZoneId === 'south-endzone'} onClick={() => handleZoneClick('south-endzone')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="west-sideline" d="M 70,120 L 210,120 L 210,380 L 70,380 Z" zone={getZone('west-sideline')} sel={state.selectedZoneId === 'west-sideline'} onClick={() => handleZoneClick('west-sideline')} heatmap={showHeatmap} onHover={setHoveredZone} />
      <ZP id="east-sideline" d="M 590,120 L 730,120 L 730,380 L 590,380 Z" zone={getZone('east-sideline')} sel={state.selectedZoneId === 'east-sideline'} onClick={() => handleZoneClick('east-sideline')} heatmap={showHeatmap} onHover={setHoveredZone} />
    </>
  );

  // ============================================================
  // Gate & Label Positions
  // ============================================================
  const gatePositions: Record<string, Record<string, { x: number; y: number }>> = {
    oval: { 'gate-a': { x: 230, y: 48 }, 'gate-b': { x: 540, y: 48 }, 'gate-c': { x: 760, y: 250 }, 'gate-d': { x: 530, y: 465 }, 'gate-e': { x: 35, y: 370 }, 'gate-f': { x: 35, y: 140 } },
    concentric: { 'gate-1': { x: 625, y: 145 }, 'gate-2': { x: 540, y: 435 }, 'gate-3': { x: 260, y: 435 }, 'gate-4': { x: 175, y: 145 }, 'gate-5': { x: 180, y: 250 } },
    rectangular: { 'gate-north': { x: 400, y: 20 }, 'gate-east': { x: 745, y: 250 }, 'gate-south': { x: 400, y: 480 }, 'gate-west': { x: 55, y: 250 } },
  };

  const labelPositions: Record<string, Record<string, { x: number; y: number }>> = {
    oval: { 'north-stand': { x: 400, y: 95 }, 'south-stand': { x: 400, y: 405 }, 'east-stand': { x: 690, y: 250 }, 'west-stand': { x: 110, y: 250 }, 'vip-lounge': { x: 400, y: 352 }, 'concourse-north': { x: 400, y: 155 }, 'concourse-south': { x: 400, y: 348 }, 'field-level': { x: 400, y: 250 } },
    concentric: { 'upper-tier': { x: 400, y: 32 }, 'mid-tier': { x: 400, y: 76 }, 'vip-suites': { x: 400, y: 110 }, 'lower-tier': { x: 400, y: 145 }, 'pitch-side': { x: 400, y: 250 }, 'east-concourse': { x: 610, y: 250 }, 'west-concourse': { x: 190, y: 250 } },
    rectangular: { 'north-endzone': { x: 400, y: 70 }, 'south-endzone': { x: 400, y: 430 }, 'east-sideline': { x: 660, y: 250 }, 'west-sideline': { x: 140, y: 250 }, 'club-level': { x: 400, y: 140 }, 'field-level': { x: 400, y: 325 } },
  };

  const curGatePos = gatePositions[layout] || gatePositions.oval;
  const curLabelPos = labelPositions[layout] || labelPositions.oval;

  // ============================================================
  // Seating Lines
  // ============================================================
  const renderSeatingLines = () => {
    if (!showSeating) return null;
    if (layout === 'concentric') {
      return (
        <g opacity="0.08" stroke="#64748b" strokeWidth="0.5" fill="none">
          {[70, 85, 100, 115, 135, 150, 165, 185, 205, 225].map((r) => (
            <circle key={r} cx="400" cy="250" r={r} />
          ))}
        </g>
      );
    }
    if (layout === 'rectangular') {
      return (
        <g opacity="0.06" stroke="#64748b" strokeWidth="0.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={`h-${i}`} x1="70" y1={60 + i * 55} x2="730" y2={60 + i * 55} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={`v-${i}`} x1={120 + i * 90} y1="30" x2={120 + i * 90} y2="470" />
          ))}
        </g>
      );
    }
    return (
      <g opacity="0.06" stroke="#64748b" strokeWidth="0.5" fill="none">
        {[140, 160, 180, 200, 230, 260, 290, 310, 330, 350].map((ry, i) => (
          <ellipse key={i} cx="400" cy="250" rx={Math.round(ry * 1.5)} ry={ry} />
        ))}
      </g>
    );
  };

  // ============================================================
  // Amenity Icons
  // ============================================================
  const renderAmenities = () => {
    if (!showAmenities) return null;
    const positions = curLabelPos;
    return (
      <g>
        {state.zones.map((zone) => {
          const pos = positions[zone.id];
          if (!pos) return null;
          const icons = [];
          if (zone.isCovered) icons.push({ label: '☂', dx: -10 });
          if (zone.hasHydration) icons.push({ label: '💧', dx: icons.length > 0 ? 10 : 0 });
          return (
            <g key={`amenity-${zone.id}`}>
              {icons.map((icon, i) => (
                <text key={i} x={pos.x + icon.dx} y={pos.y + 22} textAnchor="middle" fill="#64748b" style={{ fontSize: '10px', pointerEvents: 'none' }}>{icon.label}</text>
              ))}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <motion.div
      className="bg-slate-900 border border-slate-700/50 shadow-2xl relative overflow-hidden rounded-2xl text-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-white">{config?.name || 'Stadium Overview'}</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">{config?.city} · {config?.capacity.toLocaleString()} capacity · Live HUD</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Layer Toggle Buttons */}
          <button onClick={() => setShowHeatmap(!showHeatmap)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${showHeatmap ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            {showHeatmap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Heatmap
          </button>
          <button onClick={() => setShowSeating(!showSeating)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${showSeating ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            <Grid3X3 className="w-3 h-3" /> Seating
          </button>
          <button onClick={() => setShowAmenities(!showAmenities)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${showAmenities ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            <Droplets className="w-3 h-3" /> Amenities
          </button>
        </div>
      </div>

      {/* Density Legend + Emergency Button */}
      <div className="flex items-center justify-between px-5 pb-3">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />Low</span>
          <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-amber-500" />Medium</span>
          <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-orange-500" />High</span>
          <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Critical</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'OPEN_ALL_GATES' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-bold hover:bg-red-600/40 transition-all cursor-pointer uppercase tracking-wider"
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Emergency: Open All Gates
        </button>
      </div>

      {/* SVG Map */}
      <div className="relative w-full aspect-[16/10] max-h-[420px] mx-5 mb-5 bg-[#020617] rounded-xl border border-slate-800/80 overflow-hidden shadow-inner" onMouseMove={handleMouseMove} style={{ width: 'calc(100% - 40px)' }}>
        {/* Grid backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:25px_25px]" />

        <svg viewBox="0 0 800 500" className="w-full h-full relative z-10">
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="grad-low" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" /><stop offset="100%" stopColor="#10b981" stopOpacity="0.25" /></linearGradient>
            <linearGradient id="grad-medium" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" /><stop offset="100%" stopColor="#ea580c" stopOpacity="0.25" /></linearGradient>
            <linearGradient id="grad-high" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f97316" stopOpacity="0.35" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0.35" /></linearGradient>
            <linearGradient id="grad-critical" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" /><stop offset="100%" stopColor="#b91c1c" stopOpacity="0.55" /></linearGradient>
          </defs>

          {/* Radar guides */}
          <g opacity="0.08">
            <line x1="400" y1="10" x2="400" y2="490" stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="20" y1="250" x2="780" y2="250" stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="400" cy="250" r="100" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="400" cy="250" r="200" fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
          </g>

          {/* Seating Lines */}
          {renderSeatingLines()}

          {/* Dynamic Layout */}
          {layout === 'oval' && renderOvalLayout()}
          {layout === 'concentric' && renderConcentricLayout()}
          {layout === 'rectangular' && renderRectangularLayout()}

          {/* Amenities */}
          {renderAmenities()}

          {/* Gate Labels */}
          {state.gates.map((gate) => {
            const pos = curGatePos[gate.id];
            if (!pos) return null;
            return <GateLabel key={gate.id} x={pos.x} y={pos.y} gate={gate} />;
          })}

          {/* Zone Labels */}
          {state.zones.map((zone) => {
            const pos = curLabelPos[zone.id];
            if (!pos) return null;
            return (
              <g key={zone.id}>
                <text x={pos.x} y={pos.y - 6} textAnchor="middle" fill="#e2e8f0" style={{ fontSize: '11px', fontWeight: 700, pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}>{zone.shortName}</text>
                <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill="#94a3b8" style={{ fontSize: '9px', fontWeight: 600, pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}>{pct(zone.id)}%</text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredZoneData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 pointer-events-none bg-slate-900/95 border border-slate-600/60 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md"
              style={{ left: Math.min(mousePos.x + 16, 320), top: Math.min(mousePos.y - 10, 260) }}
            >
              <div className="text-[13px] font-bold text-white mb-1.5">{hoveredZoneData.name}</div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Occupancy</span>
                  <span className="font-semibold" style={{ color: getDensityColor(hoveredZoneData.density) }}>
                    {hoveredZoneData.currentOccupancy.toLocaleString()} / {hoveredZoneData.maxCapacity.toLocaleString()} ({Math.round((hoveredZoneData.currentOccupancy / hoveredZoneData.maxCapacity) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Density</span>
                  <span className="font-semibold capitalize" style={{ color: getDensityColor(hoveredZoneData.density) }}>{hoveredZoneData.density}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Trend</span>
                  <span className="font-semibold text-slate-200">{hoveredZoneData.trend === 'rising' ? '📈 Rising' : hoveredZoneData.trend === 'falling' ? '📉 Falling' : '➡️ Stable'}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-slate-700/50 mt-1">
                  <span className="text-slate-400">{hoveredZoneData.isCovered ? '☂ Covered' : '☀️ Open-Air'}</span>
                  <span className="text-slate-400">{hoveredZoneData.hasHydration ? '💧 Hydration' : '🚫 No Water'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Predictions */}
      {state.predictions && state.predictions.length > 0 && (
        <div className="mx-5 mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-dot" />
            <h4 className="text-[12px] font-bold text-rose-300 uppercase tracking-wider">Active Cascade Predictions</h4>
          </div>
          <div className="space-y-1">
            {state.predictions.map((p, i) => (
              <div key={i} className="text-[12px] text-rose-200 leading-normal">
                ⚠️ <span className="font-semibold">{p.reason}</span> — breach in <span className="font-bold text-red-400">{p.timeToBreachMinutes}min</span>. {p.recommendation}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Zone Path (shortened name: ZP)
// ============================================================
interface ZPProps {
  id: string;
  d: string;
  zone: Zone | undefined;
  sel: boolean;
  onClick: () => void;
  heatmap: boolean;
  onHover: (id: string | null) => void;
}

function ZP({ id, d, zone, sel, onClick, heatmap, onHover }: ZPProps) {
  if (!zone) return <path d={d} fill="#1e293b" opacity="0.15" />;
  const fillVal = heatmap ? `url(#grad-${zone.density})` : 'rgba(30,41,59,0.3)';
  const borderColors: Record<DensityLevel, string> = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
  const borderColor = sel ? '#38bdf8' : (heatmap ? borderColors[zone.density] : '#334155');

  return (
    <motion.path
      d={d}
      fill={fillVal}
      stroke={borderColor}
      strokeWidth={sel ? 3 : 1}
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => onHover(zone.id)}
      onMouseLeave={() => onHover(null)}
      filter={sel ? 'url(#neon-glow)' : 'none'}
      whileHover={{ strokeWidth: sel ? 4 : 2, fillOpacity: 0.7 }}
      transition={{ duration: 0.12 }}
      style={{ strokeLinejoin: 'round', fillRule: 'evenodd' }}
    >
      <title>{zone.name}: {zone.currentOccupancy.toLocaleString()} / {zone.maxCapacity.toLocaleString()}</title>
    </motion.path>
  );
}

// ============================================================
// Gate Label
// ============================================================
function GateLabel({ x, y, gate }: { x: number; y: number; gate: any }) {
  if (!gate) return null;
  const color = gate.status === 'open' ? '#10B981' : gate.status === 'congested' ? '#F59E0B' : '#EF4444';
  return (
    <g className="cursor-pointer">
      {gate.status !== 'open' && (
        <circle cx={x} cy={y} r={16} fill="none" stroke={color} strokeWidth={1} opacity="0.25">
          <animate attributeName="r" values="11;18;11" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={x} cy={y} r={11} fill="#020617" stroke={color} strokeWidth={2} />
      <text x={x} y={y + 3.5} textAnchor="middle" fill={color} style={{ fontSize: '8px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
        {gate.name.replace(/^Gate\s*/i, '').substring(0, 3)}
      </text>
    </g>
  );
}
