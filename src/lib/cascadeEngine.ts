import { Zone, Gate } from '@/types';
import { getDensityLevel } from '@/data/mockData';

// Stadium graph topology
// Nodes represent zones/gates, edges represent crowd routing pathways.
export interface GraphLink {
  from: string;
  to: string;
  weight: number; // routing preference/proximity weight (lower is closer)
}

export const stadiumLinks: GraphLink[] = [
  // Gate to Zone connections
  { from: 'gate-a', to: 'north-stand', weight: 1 },
  { from: 'gate-a', to: 'concourse-north', weight: 1.5 },
  { from: 'gate-b', to: 'north-stand', weight: 1 },
  { from: 'gate-b', to: 'east-stand', weight: 1.5 },
  { from: 'gate-c', to: 'east-stand', weight: 1 },
  { from: 'gate-c', to: 'south-stand', weight: 1.5 },
  { from: 'gate-d', to: 'south-stand', weight: 1 },
  { from: 'gate-d', to: 'concourse-south', weight: 1.5 },
  { from: 'gate-e', to: 'west-stand', weight: 1 },
  { from: 'gate-e', to: 'concourse-south', weight: 1.5 },
  { from: 'gate-f', to: 'vip-lounge', weight: 1 },
  { from: 'gate-f', to: 'west-stand', weight: 1.2 },

  // Internal zone to zone (spillover) connections
  { from: 'concourse-north', to: 'north-stand', weight: 1 },
  { from: 'concourse-north', to: 'east-stand', weight: 2 },
  { from: 'concourse-north', to: 'west-stand', weight: 2 },
  { from: 'concourse-south', to: 'south-stand', weight: 1 },
  { from: 'concourse-south', to: 'east-stand', weight: 2 },
  { from: 'concourse-south', to: 'west-stand', weight: 2 },
  { from: 'vip-lounge', to: 'field-level', weight: 2 },
];

export interface Prediction {
  zoneId: string;
  timeToBreachMinutes: number; // minutes until critical density (>90%)
  reason: string;
  recommendation: string;
}

/**
 * Custom Cascade Flow Engine (Wow #1)
 * Simulates real-time crowd redistribution based on gate status changes.
 */
export function calculateCascade(
  zones: Zone[],
  gates: Gate[],
  ticksElapsed: number
): {
  updatedZones: Zone[];
  updatedGates: Gate[];
  predictions: Prediction[];
} {
  // Deep copy so we don't mutate state directly
  const nextZones = JSON.parse(JSON.stringify(zones)) as Zone[];
  const nextGates = JSON.parse(JSON.stringify(gates)) as Gate[];
  const predictions: Prediction[] = [];

  // Determine active redirections (due to closed gates)
  const closedGates = nextGates.filter((g) => g.status === 'closed');
  const openGates = nextGates.filter((g) => g.status === 'open' || g.status === 'congested');

  // 1. Calculate redirected flows
  closedGates.forEach((closedGate) => {
    // Find closest open gates based on coordinates/positions
    // Redirection target is determined by position
    const targets = openGates.filter((og) => {
      if (closedGate.position === 'north') return og.position === 'north' || og.position === 'east' || og.position === 'west';
      if (closedGate.position === 'south') return og.position === 'south' || og.position === 'east' || og.position === 'west';
      return true;
    });

    if (targets.length > 0) {
      // Split closed gate flow evenly among nearest gates
      const redistributedFlow = 150 / targets.length; // Assume default inflow of 150 ppl/min
      targets.forEach((target) => {
        const index = nextGates.findIndex((g) => g.id === target.id);
        if (index !== -1) {
          nextGates[index].flowRate = Math.min(
            nextGates[index].maxFlowRate,
            nextGates[index].flowRate + redistributedFlow
          );
          // If flow exceeds 85% of max flow rate, gate becomes congested
          if (nextGates[index].flowRate >= nextGates[index].maxFlowRate * 0.85) {
            nextGates[index].status = 'congested';
          }
        }
      });
    }
  });

  // 2. Accumulate flows into zones
  // Each gate feeds into its connected zones based on weights
  nextGates.forEach((gate) => {
    if (gate.status === 'closed') return;

    const totalWeight = gate.connectedZones.reduce((sum, zoneId) => {
      const link = stadiumLinks.find((l) => l.from === gate.id && l.to === zoneId);
      return sum + (link ? 1 / link.weight : 0.5);
    }, 0);

    gate.connectedZones.forEach((zoneId) => {
      const zoneIndex = nextZones.findIndex((z) => z.id === zoneId);
      if (zoneIndex !== -1) {
        const link = stadiumLinks.find((l) => l.from === gate.id && l.to === zoneId);
        const weight = link ? 1 / link.weight : 0.5;
        const share = weight / (totalWeight || 1);
        const addedOccupancy = gate.flowRate * share * 2; // scale factor per simulation tick

        const targetZone = nextZones[zoneIndex];
        const newOccupancy = Math.min(
          targetZone.maxCapacity,
          targetZone.currentOccupancy + addedOccupancy
        );

        nextZones[zoneIndex].currentOccupancy = Math.round(newOccupancy);
        nextZones[zoneIndex].density = getDensityLevel(
          nextZones[zoneIndex].currentOccupancy,
          targetZone.maxCapacity
        );
        nextZones[zoneIndex].trend = addedOccupancy > 5 ? 'rising' : 'stable';
      }
    });
  });

  // 3. Overflow spillovers (if a concourse is critical, it spills into stands)
  const concourses = nextZones.filter((z) => z.id.startsWith('concourse'));
  concourses.forEach((concourse) => {
    const ratio = concourse.currentOccupancy / concourse.maxCapacity;
    if (ratio > 0.8) {
      // Find connected stands
      const spillTargets = nextZones.filter((z) => {
        const link = stadiumLinks.find((l) => l.from === concourse.id && l.to === z.id);
        return link !== undefined;
      });

      const spillFlow = (ratio - 0.8) * concourse.maxCapacity * 0.05; // 5% of excess occupancy per tick
      spillTargets.forEach((target) => {
        const targetIndex = nextZones.findIndex((z) => z.id === target.id);
        if (targetIndex !== -1) {
          const spill = Math.min(
            nextZones[targetIndex].maxCapacity - nextZones[targetIndex].currentOccupancy,
            spillFlow
          );
          nextZones[targetIndex].currentOccupancy += Math.round(spill);
          nextZones[targetIndex].density = getDensityLevel(
            nextZones[targetIndex].currentOccupancy,
            nextZones[targetIndex].maxCapacity
          );
          nextZones[targetIndex].trend = 'rising';
        }
      });
    }
  });

  // 4. Generate predictive warnings
  nextZones.forEach((zone) => {
    const occupancyPct = zone.currentOccupancy / zone.maxCapacity;
    // Calculate net inflow rate (approx. occupancy growth rate over past ticks)
    // For MVP, we can estimate inflow rate based on active gate connections
    let netInflowRate = 0;
    nextGates.forEach((gate) => {
      if (gate.status !== 'closed' && gate.connectedZones.includes(zone.id)) {
        netInflowRate += gate.flowRate * 0.4; // approx contribution per minute
      }
    });

    if (occupancyPct >= 0.7 && occupancyPct < 0.9 && netInflowRate > 0) {
      const remainingCapacity = zone.maxCapacity * 0.9 - zone.currentOccupancy;
      const minutesToBreach = remainingCapacity / netInflowRate;

      if (minutesToBreach > 0 && minutesToBreach <= 12) {
        predictions.push({
          zoneId: zone.id,
          timeToBreachMinutes: Math.round(minutesToBreach * 10) / 10,
          reason: `${zone.name} is filling rapidly due to redirection of flow from closed gates.`,
          recommendation: `Open auxiliary gates or redirect incoming fans to alternate entrances.`,
        });
      }
    }
  });

  return {
    updatedZones: nextZones,
    updatedGates: nextGates,
    predictions,
  };
}
