import { RiskScenario } from '@/types';

// ============================================================
// 5 Pre-Built Risk Scenarios with Explainable Risk Indicators (Wow #2)
// ============================================================

export const riskScenarios: RiskScenario[] = [
  {
    id: 'gate-failure',
    name: 'Gate B Mechanical Failure',
    description:
      'Gate B has reported intermittent mechanical issues. A full failure redirecting all traffic to Gates A and C could cause severe crowd flow bottlenecks.',
    riskLevel: 'high',
    probability: 35,
    riskScore: 68,
    breakdown: [
      { label: 'Gate B Mechanical Alert', value: 25 },
      { label: 'Flow Redirection Index', value: 23 },
      { label: 'Connected Zone Load', value: 20 },
    ],
    impact:
      'Gate closure forces 200+ people/min to reroute. Adjacent gates reach congestion within 8 minutes. North Stand and East Stand entry delayed by 15-20 min.',
    affectedZones: ['North Stand', 'East Stand', 'Concourse North'],
    recommendedActions: [
      'Deploy additional staff to Gates A and C for crowd management',
      'Activate digital signage redirecting foot traffic to Gate E (west side)',
      'Pre-position maintenance crew at Gate B for rapid repair',
      'Open overflow lane at Gate A to increase throughput',
      'Notify security to monitor for crowd pressure buildup',
    ],
    triggerConditions: [
      'Gate B flow rate drops below 50 people/min',
      'Gate B reports mechanical sensor alert',
      'Adjacent gate congestion exceeds 85% capacity',
    ],
    icon: 'door-closed',
    isActive: true,
  },
  {
    id: 'sudden-rain',
    name: 'Sudden Rainstorm',
    description:
      'Unexpected heavy rainfall approaching. Open-air zones (East Stand, West Stand, Field Level) will see rapid crowd displacement to covered areas.',
    riskLevel: 'medium',
    probability: 55,
    riskScore: 50,
    breakdown: [
      { label: 'Rain Probability', value: 30 },
      { label: 'Wind/Precipitation Index', value: 10 },
      { label: 'Uncovered Spectator Load', value: 10 },
    ],
    impact:
      'Up to 10,700 spectators in uncovered zones may rush to covered areas. North Stand and South Stand could exceed safe capacity within 12 minutes. Slip hazards on concourse surfaces.',
    affectedZones: ['East Stand', 'West Stand', 'Field Level', 'North Stand', 'South Stand'],
    recommendedActions: [
      'Activate retractable roof sections if available',
      'Open Concourse North and South as overflow shelter',
      'Deploy wet-weather safety matting on concourse walkways',
      'Broadcast calm-and-shelter advisory on PA system',
      'Pre-position first aid teams near covered transition points',
    ],
    triggerConditions: [
      'Rain probability exceeds 70% within next 30 minutes',
      'Weather radar shows storm cell within 5km',
      'Wind speed exceeds 40 km/h with precipitation',
    ],
    icon: 'cloud-rain',
    isActive: true,
  },
  {
    id: 'zone-overcrowding',
    name: 'North Stand Overcrowding',
    description:
      'North Stand is approaching critical density due to primary gate access patterns.',
    riskLevel: 'high',
    probability: 65,
    riskScore: 78,
    breakdown: [
      { label: 'Crowd density (Zone North)', value: 34 },
      { label: 'Gate Access Congestion', value: 24 },
      { label: 'Flow Rate Spillover', value: 20 },
    ],
    impact:
      'Exceeding 95% capacity creates stampede risk. Emergency evacuation time increases from 4 min to 11 min. Medical access corridors become blocked.',
    affectedZones: ['North Stand', 'Concourse North'],
    recommendedActions: [
      'Activate crowd diversion to West Stand via PA announcement',
      'Temporarily restrict Gate A and B entry to reduce inflow',
      'Open additional seating in East Stand upper tier',
      'Deploy crowd density monitoring team to North Stand aisles',
      'Pre-position emergency evacuation team at North Stand exits',
    ],
    triggerConditions: [
      'North Stand occupancy exceeds 90% capacity',
      'Occupancy trend has been rising for 15+ minutes',
      'Gate A+B combined flow rate exceeds 300 people/min',
    ],
    icon: 'users',
    isActive: true,
  },
  {
    id: 'medical-emergency',
    name: 'Heat-Related Medical Incidents',
    description:
      'Multiple heat-related complaints reported from open-air zones due to extreme temperatures.',
    riskLevel: 'medium',
    probability: 40,
    riskScore: 45,
    breakdown: [
      { label: 'Ambient Temperature Contribution', value: 20 },
      { label: 'UV Index Contribution', value: 15 },
      { label: 'Exposed Crowd Factor', value: 10 },
    ],
    impact:
      'Up to 50-100 heat-related incidents possible in open zones during peak sun hours. Medical team capacity of 12 could be overwhelmed.',
    affectedZones: ['East Stand', 'West Stand', 'Field Level'],
    recommendedActions: [
      'Activate all hydration stations and distribute free water',
      'Broadcast heat advisory with sunscreen and shade reminders',
      'Deploy additional medical personnel to open-air zones',
      'Open shaded rest areas in Concourse North and South',
      'Consider intermission extension for cooling period',
    ],
    triggerConditions: [
      'Temperature exceeds 35°C',
      'UV index exceeds 8',
      'More than 3 medical calls from same zone in 30 minutes',
    ],
    icon: 'thermometer',
    isActive: false,
  },
  {
    id: 'power-dip',
    name: 'Partial Power Loss — East Stand',
    description:
      'Voltage fluctuations in East Stand electrical grid risk lighting loss.',
    riskLevel: 'low',
    probability: 20,
    riskScore: 25,
    breakdown: [
      { label: 'Grid Voltage Fluctuation', value: 15 },
      { label: 'UPS Battery Load', value: 5 },
      { label: 'Flicker Frequency', value: 5 },
    ],
    impact:
      'Lighting loss in East Stand creates fall/trip hazards. Emergency exit signs may go dark. CCTV coverage lost.',
    affectedZones: ['East Stand'],
    recommendedActions: [
      'Switch East Stand to backup generator power',
      'Deploy portable emergency lighting to affected aisles',
      'Notify broadcast team of potential camera power loss',
      'Station electrical maintenance crew at East Stand junction box',
      'Verify emergency exit lighting on independent battery backup',
    ],
    triggerConditions: [
      'Voltage drop exceeds 10% in East Stand grid',
      'UPS systems report switchover event',
      'Lighting flicker detected by maintenance sensors',
    ],
    icon: 'zap',
    isActive: false,
  },
];
