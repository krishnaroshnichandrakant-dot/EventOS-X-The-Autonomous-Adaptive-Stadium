import { StadiumState } from '@/types';

/**
 * Builds a system prompt for the Gemini API that includes
 * the current dashboard state as context so the copilot
 * can provide relevant, data-driven recommendations.
 */
export function buildSystemPrompt(state: StadiumState): string {
  const zonesSummary = state.zones
    .map(
      (z) =>
        `- ${z.name}: ${z.currentOccupancy}/${z.maxCapacity} (${Math.round((z.currentOccupancy / z.maxCapacity) * 100)}% | ${z.density} density | trend: ${z.trend} | covered: ${z.isCovered ? 'yes' : 'no'})`
    )
    .join('\n');

  const gatesSummary = state.gates
    .map(
      (g) =>
        `- ${g.name}: ${g.status} | flow: ${g.flowRate}/${g.maxFlowRate} ppl/min | connects: ${g.connectedZones.join(', ')}`
    )
    .join('\n');

  const weatherSummary = state.weather
    ? `Temperature: ${state.weather.current.temp}°C (feels like ${state.weather.current.feelsLike}°C)
Humidity: ${state.weather.current.humidity}%
Wind: ${state.weather.current.windSpeed} km/h
UV Index: ${state.weather.current.uvIndex}
Rain Probability: ${state.weather.current.rainProbability}%
Conditions: ${state.weather.current.description}`
    : 'Weather data not yet loaded.';

  const activeRisks = state.risks
    .filter((r) => r.isActive)
    .map(
      (r) =>
        `- [${r.riskLevel.toUpperCase()}] ${r.name}: ${r.probability}% probability — ${r.impact}`
    )
    .join('\n');

  return `You are EventOS X, an intelligent AI operations assistant for stadium management. You are embedded in a real-time stadium command center dashboard.

Your role:
- Help stadium operations managers make better decisions
- Provide clear, actionable recommendations in plain language
- Explain the "why" behind every recommendation
- Prioritize safety above all else
- Be concise but thorough

Current Stadium Status:
Event Status: ${state.eventStatus}
Simulation Active: ${state.simulationActive ? 'YES (training mode)' : 'No'}

Zone Occupancy:
${zonesSummary}

Gate Status:
${gatesSummary}

Weather Conditions:
${weatherSummary}

Active Risk Assessments:
${activeRisks || 'No active risk scenarios.'}

Guidelines:
- Reference specific zones, gates, and numbers from the data above
- Provide step-by-step action plans when asked
- Flag any safety concerns proactively
- Use clear severity language: "low concern", "moderate attention needed", "immediate action required"
- Keep responses focused and practical — this is a live operations tool, not an essay`;
}

/**
 * Formats stadium state into a compact context string
 * that can be appended to individual messages.
 */
export function getStateContext(state: StadiumState): string {
  const totalOccupancy = state.zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
  const totalCapacity = state.zones.reduce((sum, z) => sum + z.maxCapacity, 0);
  const highDensityZones = state.zones.filter(
    (z) => z.density === 'high' || z.density === 'critical'
  );
  const closedGates = state.gates.filter((g) => g.status === 'closed');

  return `[Live Data: ${totalOccupancy}/${totalCapacity} total | ${highDensityZones.length} high-density zones | ${closedGates.length} closed gates | ${state.weather?.current.temp ?? '?'}°C]`;
}
