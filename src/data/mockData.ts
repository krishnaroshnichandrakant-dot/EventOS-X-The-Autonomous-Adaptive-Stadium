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
// Layout Types
// ============================================================
export type LayoutType = 'oval' | 'concentric' | 'rectangular';

// ============================================================
// Stadium Config Interface
// ============================================================
export interface StadiumConfig {
  id: string;
  name: string;
  city: string;
  capacity: number;
  layout: LayoutType;
  zones: Zone[];
  gates: Gate[];
}

// ============================================================
// Base Layout Templates (zones + gates as fractions of total)
// ============================================================

interface ZoneTemplate {
  id: string;
  name: string;
  shortName: string;
  capacityFraction: number;
  occupancyFraction: number; // fraction of its own capacity
  density: DensityLevel;
  trend: TrendDirection;
  isCovered: boolean;
  hasHydration: boolean;
  svgPathId: string;
}

interface GateTemplate {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'congested';
  flowFraction: number;
  maxFlowRate: number;
  connectedZones: string[];
  position: 'north' | 'south' | 'east' | 'west';
}

const ovalZoneTemplates: ZoneTemplate[] = [
  { id: 'north-stand', name: 'North Stand', shortName: 'N', capacityFraction: 0.20, occupancyFraction: 0.60, density: 'medium', trend: 'rising', isCovered: true, hasHydration: true, svgPathId: 'zone-north' },
  { id: 'south-stand', name: 'South Stand', shortName: 'S', capacityFraction: 0.20, occupancyFraction: 0.80, density: 'high', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-south' },
  { id: 'east-stand', name: 'East Stand', shortName: 'E', capacityFraction: 0.17, occupancyFraction: 0.55, density: 'medium', trend: 'rising', isCovered: false, hasHydration: false, svgPathId: 'zone-east' },
  { id: 'west-stand', name: 'West Stand', shortName: 'W', capacityFraction: 0.17, occupancyFraction: 0.40, density: 'low', trend: 'falling', isCovered: false, hasHydration: true, svgPathId: 'zone-west' },
  { id: 'vip-lounge', name: 'VIP Pavilion', shortName: 'VIP', capacityFraction: 0.05, occupancyFraction: 0.70, density: 'high', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-vip' },
  { id: 'concourse-north', name: 'North Concourse', shortName: 'CN', capacityFraction: 0.08, occupancyFraction: 0.30, density: 'low', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-concourse-n' },
  { id: 'concourse-south', name: 'South Concourse', shortName: 'CS', capacityFraction: 0.08, occupancyFraction: 0.40, density: 'low', trend: 'rising', isCovered: true, hasHydration: false, svgPathId: 'zone-concourse-s' },
  { id: 'field-level', name: 'Field Level', shortName: 'FL', capacityFraction: 0.05, occupancyFraction: 0.40, density: 'low', trend: 'stable', isCovered: false, hasHydration: false, svgPathId: 'zone-field' },
];

const ovalGateTemplates: GateTemplate[] = [
  { id: 'gate-a', name: 'Gate A', status: 'open', flowFraction: 0.60, maxFlowRate: 200, connectedZones: ['north-stand', 'concourse-north'], position: 'north' },
  { id: 'gate-b', name: 'Gate B', status: 'open', flowFraction: 0.42, maxFlowRate: 200, connectedZones: ['north-stand', 'east-stand'], position: 'north' },
  { id: 'gate-c', name: 'Gate C', status: 'open', flowFraction: 0.75, maxFlowRate: 200, connectedZones: ['east-stand', 'south-stand'], position: 'east' },
  { id: 'gate-d', name: 'Gate D', status: 'congested', flowFraction: 0.95, maxFlowRate: 200, connectedZones: ['south-stand', 'concourse-south'], position: 'south' },
  { id: 'gate-e', name: 'Gate E', status: 'open', flowFraction: 0.30, maxFlowRate: 200, connectedZones: ['west-stand', 'concourse-south'], position: 'west' },
  { id: 'gate-f', name: 'Gate F', status: 'open', flowFraction: 0.67, maxFlowRate: 150, connectedZones: ['vip-lounge', 'west-stand'], position: 'west' },
];

const concentricZoneTemplates: ZoneTemplate[] = [
  { id: 'lower-tier', name: 'Lower Tier', shortName: 'L1', capacityFraction: 0.30, occupancyFraction: 0.73, density: 'high', trend: 'rising', isCovered: true, hasHydration: true, svgPathId: 'zone-lower' },
  { id: 'mid-tier', name: 'Mid Tier', shortName: 'L2', capacityFraction: 0.30, occupancyFraction: 0.60, density: 'medium', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-mid' },
  { id: 'upper-tier', name: 'Upper Tier', shortName: 'L3', capacityFraction: 0.20, occupancyFraction: 0.50, density: 'medium', trend: 'rising', isCovered: false, hasHydration: false, svgPathId: 'zone-upper' },
  { id: 'vip-suites', name: 'VIP Suites', shortName: 'VIP', capacityFraction: 0.04, occupancyFraction: 0.80, density: 'high', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-vip-suites' },
  { id: 'pitch-side', name: 'Pitch Side', shortName: 'PITCH', capacityFraction: 0.03, occupancyFraction: 0.40, density: 'low', trend: 'falling', isCovered: false, hasHydration: true, svgPathId: 'zone-pitch' },
  { id: 'east-concourse', name: 'East Concourse', shortName: 'EC', capacityFraction: 0.06, occupancyFraction: 0.40, density: 'low', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-east-c' },
  { id: 'west-concourse', name: 'West Concourse', shortName: 'WC', capacityFraction: 0.07, occupancyFraction: 0.70, density: 'medium', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-west-c' },
];

const concentricGateTemplates: GateTemplate[] = [
  { id: 'gate-1', name: 'Gate 1', status: 'open', flowFraction: 0.60, maxFlowRate: 250, connectedZones: ['lower-tier', 'east-concourse'], position: 'east' },
  { id: 'gate-2', name: 'Gate 2', status: 'open', flowFraction: 0.36, maxFlowRate: 250, connectedZones: ['mid-tier', 'east-concourse'], position: 'south' },
  { id: 'gate-3', name: 'Gate 3', status: 'open', flowFraction: 0.44, maxFlowRate: 250, connectedZones: ['mid-tier', 'west-concourse'], position: 'south' },
  { id: 'gate-4', name: 'Gate 4', status: 'congested', flowFraction: 0.88, maxFlowRate: 250, connectedZones: ['upper-tier', 'west-concourse'], position: 'north' },
  { id: 'gate-5', name: 'Gate VIP', status: 'open', flowFraction: 0.40, maxFlowRate: 100, connectedZones: ['vip-suites', 'pitch-side'], position: 'west' },
];

const rectangularZoneTemplates: ZoneTemplate[] = [
  { id: 'north-endzone', name: 'North Endzone', shortName: 'NE', capacityFraction: 0.22, occupancyFraction: 0.75, density: 'high', trend: 'rising', isCovered: false, hasHydration: true, svgPathId: 'zone-ne' },
  { id: 'south-endzone', name: 'South Endzone', shortName: 'SE', capacityFraction: 0.22, occupancyFraction: 0.85, density: 'critical', trend: 'stable', isCovered: false, hasHydration: true, svgPathId: 'zone-se' },
  { id: 'east-sideline', name: 'East Sideline', shortName: 'ES', capacityFraction: 0.24, occupancyFraction: 0.60, density: 'medium', trend: 'rising', isCovered: true, hasHydration: false, svgPathId: 'zone-es' },
  { id: 'west-sideline', name: 'West Sideline', shortName: 'WS', capacityFraction: 0.24, occupancyFraction: 0.47, density: 'medium', trend: 'falling', isCovered: true, hasHydration: true, svgPathId: 'zone-ws' },
  { id: 'club-level', name: 'Club Level', shortName: 'CLUB', capacityFraction: 0.05, occupancyFraction: 0.69, density: 'high', trend: 'stable', isCovered: true, hasHydration: true, svgPathId: 'zone-club' },
  { id: 'field-level', name: 'Field Level', shortName: 'FL', capacityFraction: 0.03, occupancyFraction: 0.30, density: 'low', trend: 'stable', isCovered: false, hasHydration: false, svgPathId: 'zone-field' },
];

const rectangularGateTemplates: GateTemplate[] = [
  { id: 'gate-north', name: 'North Gate', status: 'open', flowFraction: 0.60, maxFlowRate: 300, connectedZones: ['north-endzone', 'west-sideline'], position: 'north' },
  { id: 'gate-west', name: 'West Gate', status: 'open', flowFraction: 0.47, maxFlowRate: 300, connectedZones: ['west-sideline', 'club-level'], position: 'west' },
  { id: 'gate-south', name: 'South Gate', status: 'congested', flowFraction: 0.97, maxFlowRate: 300, connectedZones: ['south-endzone', 'east-sideline'], position: 'south' },
  { id: 'gate-east', name: 'East Gate', status: 'open', flowFraction: 0.50, maxFlowRate: 300, connectedZones: ['east-sideline', 'field-level'], position: 'east' },
];

// ============================================================
// Stadium Generator — Scales templates to target capacity
// ============================================================
function generateStadiumData(
  id: string,
  name: string,
  city: string,
  capacity: number,
  layout: LayoutType
): StadiumConfig {
  const zoneTemplates = layout === 'oval' ? ovalZoneTemplates : layout === 'concentric' ? concentricZoneTemplates : rectangularZoneTemplates;
  const gateTemplates = layout === 'oval' ? ovalGateTemplates : layout === 'concentric' ? concentricGateTemplates : rectangularGateTemplates;

  const zones: Zone[] = zoneTemplates.map((t) => {
    const maxCap = Math.round(capacity * t.capacityFraction);
    const currentOcc = Math.round(maxCap * t.occupancyFraction);
    return {
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      maxCapacity: maxCap,
      currentOccupancy: currentOcc,
      density: getDensityLevel(currentOcc, maxCap),
      trend: t.trend,
      isCovered: t.isCovered,
      hasHydration: t.hasHydration,
      svgPathId: t.svgPathId,
    };
  });

  const gates: Gate[] = gateTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    flowRate: Math.round(t.maxFlowRate * t.flowFraction),
    maxFlowRate: t.maxFlowRate,
    connectedZones: t.connectedZones,
    position: t.position,
  }));

  return { id, name, city, capacity, layout, zones, gates };
}

// ============================================================
// 9 Indian Stadiums
// ============================================================
export const stadiumsList: Record<string, StadiumConfig> = {
  'narendra-modi': generateStadiumData('narendra-modi', 'Narendra Modi Stadium', 'Ahmedabad', 132000, 'concentric'),
  'eden-gardens': generateStadiumData('eden-gardens', 'Eden Gardens', 'Kolkata', 68000, 'oval'),
  'wankhede': generateStadiumData('wankhede', 'Wankhede Stadium', 'Mumbai', 33000, 'oval'),
  'chinnaswamy': generateStadiumData('chinnaswamy', 'M. Chinnaswamy Stadium', 'Bengaluru', 40000, 'concentric'),
  'chepauk': generateStadiumData('chepauk', 'MA Chidambaram Stadium', 'Chennai', 50000, 'concentric'),
  'arun-jaitley': generateStadiumData('arun-jaitley', 'Arun Jaitley Stadium', 'Delhi', 41000, 'rectangular'),
  'hpca': generateStadiumData('hpca', 'HPCA Stadium', 'Dharamshala', 23000, 'oval'),
  'rajiv-gandhi': generateStadiumData('rajiv-gandhi', 'Rajiv Gandhi Stadium', 'Hyderabad', 55000, 'concentric'),
  'dy-patil': generateStadiumData('dy-patil', 'DY Patil Stadium', 'Navi Mumbai', 55000, 'rectangular'),
};

// Default stadium
const defaultStadiumId = 'narendra-modi';

// Export Narendra Modi Stadium's default data as the fallback for initialization
export const initialZones: Zone[] = stadiumsList[defaultStadiumId].zones;
export const initialGates: Gate[] = stadiumsList[defaultStadiumId].gates;
export const defaultStadium = defaultStadiumId;

// Helper to get fresh data copy for any stadium
export function getInitialDataForStadium(stadiumId: string) {
  const config = stadiumsList[stadiumId] || stadiumsList[defaultStadiumId];
  return {
    zones: JSON.parse(JSON.stringify(config.zones)) as Zone[],
    gates: JSON.parse(JSON.stringify(config.gates)) as Gate[],
    layout: config.layout,
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
