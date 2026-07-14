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
// Stadiums Configurations Data
// ============================================================
export interface StadiumConfig {
  id: string;
  name: string;
  capacity: number;
  zones: Zone[];
  gates: Gate[];
}

export const stadiumsList: Record<string, StadiumConfig> = {
  wembley: {
    id: 'wembley',
    name: 'Wembley Stadium',
    capacity: 60000,
    zones: [
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
    ],
    gates: [
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
    ]
  },
  'camp-nou': {
    id: 'camp-nou',
    name: 'Camp Nou',
    capacity: 98000,
    zones: [
      {
        id: 'lower-tier',
        name: 'Lower Tier',
        shortName: 'L1',
        maxCapacity: 30000,
        currentOccupancy: 22000,
        density: 'high',
        trend: 'rising',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-lower',
      },
      {
        id: 'mid-tier',
        name: 'Mid Tier',
        shortName: 'L2',
        maxCapacity: 35000,
        currentOccupancy: 24500,
        density: 'medium',
        trend: 'stable',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-mid',
      },
      {
        id: 'upper-tier',
        name: 'Upper Tier',
        shortName: 'L3',
        maxCapacity: 22000,
        currentOccupancy: 11000,
        density: 'medium',
        trend: 'rising',
        isCovered: false,
        hasHydration: false,
        svgPathId: 'zone-upper',
      },
      {
        id: 'vip-suites',
        name: 'VIP Suites',
        shortName: 'VIP',
        maxCapacity: 4000,
        currentOccupancy: 3200,
        density: 'high',
        trend: 'stable',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-vip-suites',
      },
      {
        id: 'pitch-side',
        name: 'Pitch Side',
        shortName: 'PITCH',
        maxCapacity: 3000,
        currentOccupancy: 1200,
        density: 'low',
        trend: 'falling',
        isCovered: false,
        hasHydration: true,
        svgPathId: 'zone-pitch',
      },
      {
        id: 'east-concourse',
        name: 'East Concourse',
        shortName: 'EC',
        maxCapacity: 2000,
        currentOccupancy: 800,
        density: 'low',
        trend: 'stable',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-east-c',
      },
      {
        id: 'west-concourse',
        name: 'West Concourse',
        shortName: 'WC',
        maxCapacity: 2000,
        currentOccupancy: 1400,
        density: 'medium',
        trend: 'stable',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-west-c',
      },
    ],
    gates: [
      {
        id: 'gate-1',
        name: 'Gate 1',
        status: 'open',
        flowRate: 150,
        maxFlowRate: 250,
        connectedZones: ['lower-tier', 'east-concourse'],
        position: 'east',
      },
      {
        id: 'gate-2',
        name: 'Gate 2',
        status: 'open',
        flowRate: 90,
        maxFlowRate: 250,
        connectedZones: ['mid-tier', 'east-concourse'],
        position: 'south',
      },
      {
        id: 'gate-3',
        name: 'Gate 3',
        status: 'open',
        flowRate: 110,
        maxFlowRate: 250,
        connectedZones: ['mid-tier', 'west-concourse'],
        position: 'south',
      },
      {
        id: 'gate-4',
        name: 'Gate 4',
        status: 'congested',
        flowRate: 220,
        maxFlowRate: 250,
        connectedZones: ['upper-tier', 'west-concourse'],
        position: 'north',
      },
      {
        id: 'gate-5',
        name: 'Gate VIP',
        status: 'open',
        flowRate: 40,
        maxFlowRate: 100,
        connectedZones: ['vip-suites', 'pitch-side'],
        position: 'west',
      },
    ]
  },
  metlife: {
    id: 'metlife',
    name: 'MetLife Stadium',
    capacity: 82500,
    zones: [
      {
        id: 'north-endzone',
        name: 'North Endzone',
        shortName: 'NE',
        maxCapacity: 18000,
        currentOccupancy: 13500,
        density: 'high',
        trend: 'rising',
        isCovered: false,
        hasHydration: true,
        svgPathId: 'zone-ne',
      },
      {
        id: 'south-endzone',
        name: 'South Endzone',
        shortName: 'SE',
        maxCapacity: 18000,
        currentOccupancy: 15300,
        density: 'critical',
        trend: 'stable',
        isCovered: false,
        hasHydration: true,
        svgPathId: 'zone-se',
      },
      {
        id: 'east-sideline',
        name: 'East Sideline',
        shortName: 'ES',
        maxCapacity: 20000,
        currentOccupancy: 12000,
        density: 'medium',
        trend: 'rising',
        isCovered: true,
        hasHydration: false,
        svgPathId: 'zone-es',
      },
      {
        id: 'west-sideline',
        name: 'West Sideline',
        shortName: 'WS',
        maxCapacity: 20000,
        currentOccupancy: 9500,
        density: 'low',
        trend: 'falling',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-ws',
      },
      {
        id: 'club-level',
        name: 'Club Level',
        shortName: 'CLUB',
        maxCapacity: 4500,
        currentOccupancy: 3100,
        density: 'high',
        trend: 'stable',
        isCovered: true,
        hasHydration: true,
        svgPathId: 'zone-club',
      },
      {
        id: 'field-level',
        name: 'Field Level',
        shortName: 'FL',
        maxCapacity: 2000,
        currentOccupancy: 600,
        density: 'low',
        trend: 'stable',
        isCovered: false,
        hasHydration: false,
        svgPathId: 'zone-field',
      },
    ],
    gates: [
      {
        id: 'gate-verizon',
        name: 'Verizon Gate',
        status: 'open',
        flowRate: 180,
        maxFlowRate: 300,
        connectedZones: ['north-endzone', 'west-sideline'],
        position: 'north',
      },
      {
        id: 'gate-metlife',
        name: 'MetLife Gate',
        status: 'open',
        flowRate: 140,
        maxFlowRate: 300,
        connectedZones: ['west-sideline', 'club-level'],
        position: 'west',
      },
      {
        id: 'gate-pepsi',
        name: 'Pepsi Gate',
        status: 'congested',
        flowRate: 290,
        maxFlowRate: 300,
        connectedZones: ['south-endzone', 'east-sideline'],
        position: 'south',
      },
      {
        id: 'gate-budlight',
        name: 'Bud Light Gate',
        status: 'open',
        flowRate: 150,
        maxFlowRate: 300,
        connectedZones: ['east-sideline', 'field-level'],
        position: 'east',
      },
    ]
  }
};

// Export Wembley's default data as the fallback for initialization
export const initialZones: Zone[] = stadiumsList.wembley.zones;
export const initialGates: Gate[] = stadiumsList.wembley.gates;

// Helper to get fresh data copy for any stadium
export function getInitialDataForStadium(stadiumId: string) {
  const config = stadiumsList[stadiumId] || stadiumsList.wembley;
  return {
    zones: JSON.parse(JSON.stringify(config.zones)) as Zone[],
    gates: JSON.parse(JSON.stringify(config.gates)) as Gate[]
  };
}

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
