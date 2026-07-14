import { Zone, Gate, WeatherData, RiskScenario, RiskLevel, WeatherAlert } from '@/types';
import { riskScenarios } from '@/data/scenarios';

// ============================================================
// Rule-Based Risk Evaluation Engine (Wow #2 — Explainable Risk)
// ============================================================

export function evaluateRisks(
  zones: Zone[],
  gates: Gate[],
  weather: WeatherData | null
): RiskScenario[] {
  return riskScenarios.map((scenario) => {
    switch (scenario.id) {
      case 'gate-failure':
        return evaluateGateFailure(scenario, gates, zones);
      case 'sudden-rain':
        return evaluateRainRisk(scenario, weather, zones);
      case 'zone-overcrowding':
        return evaluateOvercrowding(scenario, zones, gates);
      case 'medical-emergency':
        return evaluateMedicalRisk(scenario, zones, weather);
      case 'power-dip':
        return evaluatePowerRisk(scenario, zones);
      default:
        return scenario;
    }
  });
}

function evaluateGateFailure(scenario: RiskScenario, gates: Gate[], zones: Zone[]): RiskScenario {
  const congestedGates = gates.filter((g) => g.status === 'congested').length;
  const closedGates = gates.filter((g) => g.status === 'closed').length;

  const baseMechanicalValue = closedGates > 0 ? 30 : congestedGates > 0 ? 15 : 5;
  const redirectionIndexValue = closedGates * 25 + congestedGates * 10;
  
  // Calculate load of connected zones (e.g. North Stand density)
  const northStand = zones.find((z) => z.id === 'north-stand');
  const zoneLoadPct = northStand ? (northStand.currentOccupancy / northStand.maxCapacity) : 0.5;
  const connectedZoneValue = Math.round(zoneLoadPct * 30);

  const riskScore = Math.min(100, baseMechanicalValue + redirectionIndexValue + connectedZoneValue);
  const probability = Math.round(riskScore * 0.85);

  let riskLevel: RiskLevel = 'low';
  if (riskScore >= 75) riskLevel = 'critical';
  else if (riskScore >= 55) riskLevel = 'high';
  else if (riskScore >= 35) riskLevel = 'medium';

  const breakdown = [
    { label: 'Gate Mechanical Alerts', value: baseMechanicalValue },
    { label: 'Flow Redirection Index', value: Math.min(40, redirectionIndexValue) },
    { label: 'Connected Zone Load', value: connectedZoneValue },
  ];

  return {
    ...scenario,
    probability,
    riskScore,
    riskLevel,
    breakdown,
    isActive: riskScore > 30,
  };
}

function evaluateRainRisk(scenario: RiskScenario, weather: WeatherData | null, zones: Zone[]): RiskScenario {
  if (!weather) return scenario;

  const rainProb = weather.current.rainProbability;
  const windSpeed = weather.current.windSpeed;
  const uncoveredOccupancy = zones
    .filter((z) => !z.isCovered)
    .reduce((sum, z) => sum + z.currentOccupancy, 0);
  const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0) || 1;

  const rainProbVal = Math.round(rainProb * 0.6); // up to 60 points
  const windVal = Math.round(Math.min(20, windSpeed * 0.4)); // up to 20 points
  const uncoveredVal = Math.round(Math.min(20, (uncoveredOccupancy / totalOccupancy) * 30));

  const riskScore = Math.min(100, rainProbVal + windVal + uncoveredVal);
  const probability = rainProb;

  let riskLevel: RiskLevel = 'low';
  if (riskScore >= 75) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';

  const breakdown = [
    { label: 'Rain Probability', value: rainProbVal },
    { label: 'Wind/Precipitation Index', value: windVal },
    { label: 'Uncovered Spectator Load', value: uncoveredVal },
  ];

  return {
    ...scenario,
    probability,
    riskScore,
    riskLevel,
    breakdown,
    isActive: riskScore > 25,
  };
}

function evaluateOvercrowding(scenario: RiskScenario, zones: Zone[], gates: Gate[]): RiskScenario {
  const northStand = zones.find((z) => z.id === 'north-stand');
  const southStand = zones.find((z) => z.id === 'south-stand');
  const maxOccupancyPct = Math.max(
    northStand ? northStand.currentOccupancy / northStand.maxCapacity : 0,
    southStand ? southStand.currentOccupancy / southStand.maxCapacity : 0
  );

  const densityVal = Math.round(maxOccupancyPct * 60); // up to 60 points
  
  // Rate of inflow based on active gate flows connected to north/south stands
  const connectedGates = gates.filter((g) =>
    g.connectedZones.includes('north-stand') || g.connectedZones.includes('south-stand')
  );
  const totalFlow = connectedGates.reduce((sum, g) => sum + (g.status !== 'closed' ? g.flowRate : 0), 0);
  const flowVal = Math.round(Math.min(25, totalFlow * 0.08));

  // Closed adjacent gates increase overcrowding risk
  const closedGatesCount = gates.filter((g) => g.status === 'closed').length;
  const closedGatesVal = closedGatesCount * 7.5;

  const riskScore = Math.min(100, densityVal + flowVal + closedGatesVal);
  const probability = Math.round(riskScore * 0.9);

  let riskLevel: RiskLevel = 'low';
  if (riskScore >= 80) riskLevel = 'critical';
  else if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';

  const breakdown = [
    { label: 'Crowd Density contribution', value: densityVal },
    { label: 'Gate Access Congestion', value: flowVal },
    { label: 'Flow Rate Spillover', value: Math.round(closedGatesVal) },
  ];

  return {
    ...scenario,
    probability,
    riskScore,
    riskLevel,
    breakdown,
    isActive: riskScore > 35,
  };
}

function evaluateMedicalRisk(
  scenario: RiskScenario,
  zones: Zone[],
  weather: WeatherData | null
): RiskScenario {
  if (!weather) return scenario;

  const temp = weather.current.temp;
  const uv = weather.current.uvIndex;
  const uncoveredOccupancy = zones
    .filter((z) => !z.isCovered)
    .reduce((sum, z) => sum + z.currentOccupancy, 0);

  const tempVal = Math.round(Math.min(40, Math.max(0, (temp - 25) * 4))); // up to 40 points
  const uvVal = Math.round(Math.min(30, uv * 3)); // up to 30 points
  const crowdVal = Math.round(Math.min(30, (uncoveredOccupancy / 10000) * 15)); // up to 30 points

  const riskScore = Math.min(100, tempVal + uvVal + crowdVal);
  const probability = Math.round(riskScore * 0.8);

  let riskLevel: RiskLevel = 'low';
  if (riskScore >= 75) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';

  const breakdown = [
    { label: 'Ambient Temperature Contribution', value: tempVal },
    { label: 'UV Index Contribution', value: uvVal },
    { label: 'Exposed Crowd Factor', value: crowdVal },
  ];

  return {
    ...scenario,
    probability,
    riskScore,
    riskLevel,
    breakdown,
    isActive: riskScore > 20,
  };
}

function evaluatePowerRisk(scenario: RiskScenario, zones: Zone[]): RiskScenario {
  // Mostly static for the simulation unless triggered
  return scenario;
}

// ============================================================
// Weather Alert Generator (Rule-Based)
// ============================================================
export function generateWeatherAlerts(weather: WeatherData | null): WeatherAlert[] {
  if (!weather) return [];

  const alerts: WeatherAlert[] = [];
  const { temp, windSpeed, uvIndex, rainProbability } = weather.current;

  // Heat advisory
  if (temp > 35) {
    alerts.push({
      id: 'heat-alert',
      type: 'heat',
      severity: temp > 40 ? 'danger' : 'warning',
      title: temp > 40 ? 'Extreme Heat Warning' : 'High Temperature Advisory',
      message: `Temperature is ${temp}°C (feels like ${weather.current.feelsLike}°C). Dangerous for prolonged outdoor exposure.`,
      recommendation:
        'Activate all hydration stations. Open shaded rest zones. Broadcast heat safety advisory. Consider intermission cooling break.',
      affectedZones: ['East Stand', 'West Stand', 'Field Level'],
      icon: 'thermometer-sun',
    });
  } else if (temp > 30) {
    alerts.push({
      id: 'heat-advisory',
      type: 'heat',
      severity: 'info',
      title: 'Warm Weather Notice',
      message: `Temperature is ${temp}°C. Ensure hydration stations are stocked.`,
      recommendation:
        'Monitor open-air zones. Keep hydration stations active. Remind staff to watch for heat-related symptoms.',
      affectedZones: ['East Stand', 'West Stand', 'Field Level'],
      icon: 'thermometer-sun',
    });
  }

  // Rain advisory
  if (rainProbability > 60) {
    alerts.push({
      id: 'rain-alert',
      type: 'rain',
      severity: rainProbability > 80 ? 'danger' : 'warning',
      title: rainProbability > 80 ? 'Heavy Rain Expected' : 'Rain Forecast',
      message: `${rainProbability}% chance of rain. Prepare for crowd displacement from open areas.`,
      recommendation:
        'Pre-check retractable roof. Prepare rain ponchos for distribution. Deploy wet-weather safety matting on walkways.',
      affectedZones: ['East Stand', 'West Stand', 'Field Level'],
      icon: 'cloud-rain',
    });
  }

  // UV advisory
  if (uvIndex > 8) {
    alerts.push({
      id: 'uv-alert',
      type: 'uv',
      severity: uvIndex > 10 ? 'danger' : 'warning',
      title: uvIndex > 10 ? 'Extreme UV Warning' : 'High UV Index',
      message: `UV index is ${uvIndex}. Sunburn risk in as little as ${Math.round(150 / uvIndex)} minutes.`,
      recommendation:
        'Issue sunscreen advisory for open-air zones. Activate shade structures where available. Consider scheduling breaks during peak UV.',
      affectedZones: ['East Stand', 'West Stand', 'Field Level'],
      icon: 'sun',
    });
  }

  // Wind advisory
  if (windSpeed > 50) {
    alerts.push({
      id: 'wind-alert',
      type: 'wind',
      severity: windSpeed > 70 ? 'danger' : 'warning',
      title: windSpeed > 70 ? 'Dangerous Wind Warning' : 'High Wind Advisory',
      message: `Wind speed is ${windSpeed} km/h. Risk to temporary structures and signage.`,
      recommendation:
        'Secure all temporary structures and banners. Suspend aerial displays. Move spectators away from exposed upper tiers.',
      affectedZones: ['East Stand', 'West Stand', 'North Stand', 'South Stand'],
      icon: 'wind',
    });
  }

  return alerts;
}
