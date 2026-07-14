'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useStadium } from '@/store/stadiumStore';
import { getDensityColor, getDensityBg } from '@/data/mockData';

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

  return (
    <motion.div
      className="card-lg p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Stadium Overview</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Live zone density map</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical
          </span>
        </div>
      </div>

      {/* SVG Stadium Map */}
      <div className="relative w-full aspect-[16/10] max-h-[420px]">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))' }}
        >
          {/* Stadium Outline */}
          <ellipse
            cx="400"
            cy="250"
            rx="370"
            ry="220"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />

          {/* Field (center) */}
          <ZonePath
            id="field-level"
            d="M 250,170 L 550,170 L 550,330 L 250,330 Z"
            zone={getZone('field-level')}
            isSelected={state.selectedZoneId === 'field-level'}
            onClick={() => handleZoneClick('field-level')}
          />
          {/* Field markings */}
          <rect x="260" y="180" width="280" height="140" rx="4" fill="none" stroke="#86EFAC" strokeWidth="1.5" opacity="0.6" />
          <line x1="400" y1="180" x2="400" y2="320" stroke="#86EFAC" strokeWidth="1" opacity="0.6" />
          <circle cx="400" cy="250" r="30" fill="none" stroke="#86EFAC" strokeWidth="1" opacity="0.6" />

          {/* North Stand (top) */}
          <ZonePath
            id="north-stand"
            d="M 160,60 Q 400,15 640,60 L 590,150 Q 400,120 210,150 Z"
            zone={getZone('north-stand')}
            isSelected={state.selectedZoneId === 'north-stand'}
            onClick={() => handleZoneClick('north-stand')}
          />

          {/* South Stand (bottom) */}
          <ZonePath
            id="south-stand"
            d="M 210,350 Q 400,380 590,350 L 640,440 Q 400,485 160,440 Z"
            zone={getZone('south-stand')}
            isSelected={state.selectedZoneId === 'south-stand'}
            onClick={() => handleZoneClick('south-stand')}
          />

          {/* East Stand (right) */}
          <ZonePath
            id="east-stand"
            d="M 600,155 L 645,65 Q 740,130 760,250 Q 740,370 645,435 L 600,345 Q 670,290 670,250 Q 670,210 600,155 Z"
            zone={getZone('east-stand')}
            isSelected={state.selectedZoneId === 'east-stand'}
            onClick={() => handleZoneClick('east-stand')}
          />

          {/* West Stand (left) */}
          <ZonePath
            id="west-stand"
            d="M 200,155 L 155,65 Q 60,130 40,250 Q 60,370 155,435 L 200,345 Q 130,290 130,250 Q 130,210 200,155 Z"
            zone={getZone('west-stand')}
            isSelected={state.selectedZoneId === 'west-stand'}
            onClick={() => handleZoneClick('west-stand')}
          />

          {/* VIP Lounge (bottom-center, inside) */}
          <ZonePath
            id="vip-lounge"
            d="M 310,330 L 490,330 L 490,370 Q 400,375 310,370 Z"
            zone={getZone('vip-lounge')}
            isSelected={state.selectedZoneId === 'vip-lounge'}
            onClick={() => handleZoneClick('vip-lounge')}
          />

          {/* Concourse North (thin strip) */}
          <ZonePath
            id="concourse-north"
            d="M 220,148 Q 400,118 580,148 L 585,158 Q 400,128 215,158 Z"
            zone={getZone('concourse-north')}
            isSelected={state.selectedZoneId === 'concourse-north'}
            onClick={() => handleZoneClick('concourse-north')}
          />

          {/* Concourse South (thin strip) */}
          <ZonePath
            id="concourse-south"
            d="M 215,342 Q 400,372 585,342 L 580,352 Q 400,382 220,352 Z"
            zone={getZone('concourse-south')}
            isSelected={state.selectedZoneId === 'concourse-south'}
            onClick={() => handleZoneClick('concourse-south')}
          />

          {/* Gate Labels */}
          <GateLabel x={230} y={48} gate={state.gates.find(g => g.id === 'gate-a')} />
          <GateLabel x={540} y={48} gate={state.gates.find(g => g.id === 'gate-b')} />
          <GateLabel x={760} y={250} gate={state.gates.find(g => g.id === 'gate-c')} />
          <GateLabel x={530} y={465} gate={state.gates.find(g => g.id === 'gate-d')} />
          <GateLabel x={35} y={370} gate={state.gates.find(g => g.id === 'gate-e')} />
          <GateLabel x={35} y={140} gate={state.gates.find(g => g.id === 'gate-f')} />

          {/* Zone Labels */}
          {state.zones.map((zone) => {
            const positions: Record<string, { x: number; y: number }> = {
              'north-stand': { x: 400, y: 95 },
              'south-stand': { x: 400, y: 405 },
              'east-stand': { x: 690, y: 250 },
              'west-stand': { x: 110, y: 250 },
              'vip-lounge': { x: 400, y: 352 },
              'concourse-north': { x: 400, y: 155 },
              'concourse-south': { x: 400, y: 348 },
              'field-level': { x: 400, y: 250 },
            };
            const pos = positions[zone.id];
            if (!pos) return null;
            const isField = zone.id === 'field-level';
            return (
              <g key={zone.id}>
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  className="text-[11px] font-semibold"
                  fill={isField ? '#166534' : '#374151'}
                  style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
                >
                  {zone.shortName}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 8}
                  textAnchor="middle"
                  className="text-[10px]"
                  fill={isField ? '#166534' : '#6B7280'}
                  style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
                >
                  {pct(zone.id)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Predictive Warnings (Wow #1) */}
      {state.predictions && state.predictions.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-100 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <h4 className="text-[12px] font-bold text-rose-800 uppercase tracking-wider">
              Active Cascade Predictions
            </h4>
          </div>
          <div className="space-y-1">
            {state.predictions.map((p, i) => (
              <div key={i} className="text-[12px] text-rose-700 leading-normal">
                ⚠️ <span className="font-semibold">{p.reason}</span> Will breach 90% threshold in{' '}
                <span className="font-bold">{p.timeToBreachMinutes} minutes</span>. Recommended: {p.recommendation}
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
  if (!zone) return <path d={d} fill="#F3F4F6" />;
  const fillColor = getDensityColor(zone.density);
  return (
    <motion.path
      d={d}
      fill={fillColor}
      fillOpacity={0.35}
      stroke={isSelected ? '#2563EB' : 'white'}
      strokeWidth={isSelected ? 3 : 2}
      className="stadium-zone"
      onClick={onClick}
      whileHover={{ fillOpacity: 0.5 }}
      transition={{ duration: 0.2 }}
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
    <g>
      <circle cx={x} cy={y} r={12} fill="white" stroke={color} strokeWidth={2} />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={color}
        style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
      >
        {gate.name.replace('Gate ', '')}
      </text>
    </g>
  );
}
