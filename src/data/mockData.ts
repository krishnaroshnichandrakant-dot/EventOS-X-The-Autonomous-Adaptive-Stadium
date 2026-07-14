import { Zone, Gate, DensityLevel, TrendDirection } from '@/types';

// ============================================================
// Helper: compute density level from occupancy percentage
// ============================================================
export function getDensityLevel(current: number, max: number): DensityLevel {
  const pct = (current / max) * 100;
  if (pct >= 90) return 'critical';
  if (pct >= 70) return 'high';
  if (pct >= 45) return 'medium';
  return 'low';
}

export function getDensityColor(density: DensityLevel): string {
  switch (density) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#F97316';
    case 'critical': return '#EF4444';
  }
}

export function getDensityBg(density: DensityLevel): string {
  switch (density) {
    case 'low': return '#ECFDF5';
    case 'medium': return '#FFFBEB';
    case 'high': return '#FFF7ED';
    case 'critical': return '#FEF2F2';
  }
}

// ============================================================
// Initial Zone Data (8 zones, ~60,000 total capacity)
// ============================================================
export const initialZones: Zone[] = [
  {
    id: 'north-stand',
    name: 'North Stand',
    shortName: 'N',
    maxCapacity: 12000,
    currentOccupancy: 7200,
    density: 'medium',
    trend: 'rising',
    isCovered: true,
    hasHydration: true,
    svgPathId: 'zone-north',
  },
  {
    id: 'south-stand',
    name: 'South Stand',
    shortName: 'S',
    maxCapacity: 12000,
    currentOccupancy: 9600,
    density: 'high',
    trend: 'stable',
    isCovered: true,
    hasHydration: true,
    svgPathId: 'zone-south',
  },
  {
    id: 'east-stand',
    name: 'East Stand',
    shortName: 'E',
    maxCapacity: 10000,
    currentOccupancy: 5500,
    density: 'medium',
    trend: 'rising',
    isCovered: false,
    hasHydration: false,
    svgPathId: 'zone-east',
  },
  {
    id: 'west-stand',
    name: 'West Stand',
    shortName: 'W',
    maxCapacity: 10000,
    currentOccupancy: 4000,
    density: 'low',
    trend: 'falling',
    isCovered: false,
    hasHydration: true,
    svgPathId: 'zone-west',
  },
  {
    id: 'vip-lounge',
    name: 'VIP Lounge',
    shortName: 'VIP',
    maxCapacity: 3000,
    currentOccupancy: 2100,
    density: 'high',
    trend: 'stable',
    isCovered: true,
    hasHydration: true,
    svgPathId: 'zone-vip',
  },
  {
    id: 'concourse-north',
    name: 'Concourse North',
    shortName: 'CN',
    maxCapacity: 5000,
    currentOccupancy: 1500,
    density: 'low',
    trend: 'stable',
    isCovered: true,
    hasHydration: true,
    svgPathId: 'zone-concourse-n',
  },
  {
    id: 'concourse-south',
    name: 'Concourse South',
    shortName: 'CS',
    maxCapacity: 5000,
    currentOccupancy: 2000,
    density: 'low',
    trend: 'rising',
    isCovered: true,
    hasHydration: false,
    svgPathId: 'zone-concourse-s',
  },
  {
    id: 'field-level',
    name: 'Field Level',
    shortName: 'FL',
    maxCapacity: 3000,
    currentOccupancy: 1200,
    density: 'low',
    trend: 'stable',
    isCovered: false,
    hasHydration: false,
    svgPathId: 'zone-field',
  },
];

// ============================================================
// Initial Gate Data (6 gates)
// ============================================================
export const initialGates: Gate[] = [
  {
    id: 'gate-a',
    name: 'Gate A',
    status: 'open',
    flowRate: 120,
    maxFlowRate: 200,
    connectedZones: ['north-stand', 'concourse-north'],
    position: 'north',
  },
  {
    id: 'gate-b',
    name: 'Gate B',
    status: 'open',
    flowRate: 85,
    maxFlowRate: 200,
    connectedZones: ['north-stand', 'east-stand'],
    position: 'north',
  },
  {
    id: 'gate-c',
    name: 'Gate C',
    status: 'open',
    flowRate: 150,
    maxFlowRate: 200,
    connectedZones: ['east-stand', 'south-stand'],
    position: 'east',
  },
  {
    id: 'gate-d',
    name: 'Gate D',
    status: 'congested',
    flowRate: 190,
    maxFlowRate: 200,
    connectedZones: ['south-stand', 'concourse-south'],
    position: 'south',
  },
  {
    id: 'gate-e',
    name: 'Gate E',
    status: 'open',
    flowRate: 60,
    maxFlowRate: 200,
    connectedZones: ['west-stand', 'concourse-south'],
    position: 'west',
  },
  {
    id: 'gate-f',
    name: 'Gate F',
    status: 'open',
    flowRate: 100,
    maxFlowRate: 150,
    connectedZones: ['vip-lounge', 'west-stand'],
    position: 'west',
  },
];

// ============================================================
// Crowd Fluctuation — nudge occupancy ±2-5% per tick
// ============================================================
export function simulateCrowdFluctuation(zones: Zone[]): Zone[] {
  return zones.map((zone) => {
    const maxDelta = Math.floor(zone.maxCapacity * 0.03); // ±3%
    const delta = Math.floor(Math.random() * maxDelta * 2) - maxDelta;
    const newOccupancy = Math.max(
      0,
      Math.min(zone.maxCapacity, zone.currentOccupancy + delta)
    );

    let trend: TrendDirection = 'stable';
    if (delta > maxDelta * 0.3) trend = 'rising';
    else if (delta < -maxDelta * 0.3) trend = 'falling';

    return {
      ...zone,
      currentOccupancy: newOccupancy,
      density: getDensityLevel(newOccupancy, zone.maxCapacity),
      trend,
    };
  });
}

/** Total stadium stats */
export function getStadiumStats(zones: Zone[], gates: Gate[]) {
  const totalCapacity = zones.reduce((sum, z) => sum + z.maxCapacity, 0);
  const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
  const openGates = gates.filter((g) => g.status === 'open').length;
  const congestedGates = gates.filter((g) => g.status === 'congested').length;
  const totalFlowRate = gates
    .filter((g) => g.status !== 'closed')
    .reduce((sum, g) => sum + g.flowRate, 0);

  return {
    totalCapacity,
    totalOccupancy,
    occupancyPercent: Math.round((totalOccupancy / totalCapacity) * 100),
    openGates,
    congestedGates,
    closedGates: gates.length - openGates - congestedGates,
    totalFlowRate,
  };
}
