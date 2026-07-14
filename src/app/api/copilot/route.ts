import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * Copilot API Route Handler
 * Proxies chat requests to the Gemini API, instructing it to return structured action blocks (Wow #3).
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const body = await request.json();
    const { message, systemPrompt, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Agentic instructions for system prompt
    const agenticInstruction = `
CRITICAL INSTRUCTION: You are an agentic copilot. You can trigger live dashboard commands.
If the user asks you to perform an action (e.g. "close Gate A", "open Gate B", "simulate rain", "divert crowd", "start gate failure simulation"), you MUST structure your response as a JSON object:
{
  "action": "TOGGLE_GATE" | "START_SIMULATION" | "NONE",
  "payload": {
    "id": "gate-a" | "gate-b" | "gate-c" | "gate-d" | "gate-e" | "gate-f" | "gate-failure" | "sudden-rain" | "zone-overcrowding",
    "status": "open" | "closed" (only required if action is TOGGLE_GATE)
  },
  "reply": "Explain in detail what you did and why, showing your work."
}
If no action is requested, set "action": "NONE", and write your normal helpful response in "reply". Only return JSON.
`;

    // If no API key, return a mock response that matches this JSON format
    if (!apiKey) {
      return NextResponse.json(JSON.parse(getMockResponse(message)));
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt + agenticInstruction,
        responseMimeType: 'application/json', // Enforce JSON output from Gemini
        maxOutputTokens: 1024,
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      // Fallback if Gemini failed to output valid JSON
      return NextResponse.json({
        action: 'NONE',
        reply: text || 'I apologize, I was unable to generate a response.',
      });
    }
  } catch (error) {
    console.error('Copilot API error:', error);
    return NextResponse.json({
      action: 'NONE',
      reply: 'I encountered an issue processing your request. Please try again.',
    });
  }
}

/**
 * Dynamic Mock Responses — Parses [Live Data: ...] context suffix to produce
 * context-aware answers that reflect the actual stadium state.
 */
function getMockResponse(message: string): string {
  const lower = message.toLowerCase();

  // ---- Extract live context from the [Live Data: ...] suffix ----
  const contextMatch = message.match(/\[Live Data:\s*(.*?)\]/s);
  const ctx: Record<string, string> = {};
  if (contextMatch) {
    const pairs = contextMatch[1].split(',').map((s) => s.trim());
    pairs.forEach((p) => {
      const [key, ...rest] = p.split(':');
      if (key && rest.length > 0) ctx[key.trim().toLowerCase()] = rest.join(':').trim();
    });
  }

  const stadiumName = ctx['stadium'] || 'the stadium';
  const occ = ctx['occupancy'] || '62%';
  const openGates = ctx['open gates'] || '5/6';
  const temp = ctx['temp'] || '28°C';
  const rain = ctx['rain'] || '25%';
  const wind = ctx['wind'] || '12 km/h';
  const zones = ctx['zones'] || '';

  // ---- Action Commands (still mock-execute) ----

  // Close any gate
  const closeGateMatch = lower.match(/close\s+gate\s+([a-z0-9]+)/);
  if (closeGateMatch) {
    const gateId = `gate-${closeGateMatch[1]}`;
    const gateName = `Gate ${closeGateMatch[1].toUpperCase()}`;
    return JSON.stringify({
      action: 'TOGGLE_GATE',
      payload: { id: gateId, status: 'closed' },
      reply: `**Action Executed: Closing ${gateName} at ${stadiumName}.**\n\nI have dispatched a command to close ${gateName}. Current stadium occupancy is ${occ}.\n\n**Downstream Impact:**\n- Adjacent gates will absorb redirected crowd flow.\n- Monitor the occupancy trend over the next 5 minutes to confirm stabilization.\n- Current weather: ${temp}, ${rain} rain chance — ${parseInt(rain) > 40 ? '⚠️ rain gear should be staged in open areas' : 'conditions are favorable'}.`,
    });
  }

  // Open any gate
  const openGateMatch = lower.match(/open\s+gate\s+([a-z0-9]+)/);
  if (openGateMatch) {
    const gateId = `gate-${openGateMatch[1]}`;
    const gateName = `Gate ${openGateMatch[1].toUpperCase()}`;
    return JSON.stringify({
      action: 'TOGGLE_GATE',
      payload: { id: gateId, status: 'open' },
      reply: `**Action Executed: Opening ${gateName} at ${stadiumName}.**\n\n${gateName} is now open and accepting crowd inflow. Current stadium occupancy: ${occ}. Gate status: ${openGates}.`,
    });
  }

  // Simulate rain
  if (lower.includes('simulate rain') || lower.includes('rain simulation')) {
    return JSON.stringify({
      action: 'START_SIMULATION',
      payload: { id: 'sudden-rain' },
      reply: `**Action Executed: Rainstorm Simulation at ${stadiumName}.**\n\nLaunching sudden rainstorm cascade. Current rain probability is ${rain}. Spectators in uncovered zones will begin relocating to sheltered areas.\n\n**Current Conditions:** ${temp}, Wind ${wind}.`,
    });
  }

  // Simulate gate failure
  if (lower.includes('simulate gate failure') || lower.includes('gate failure')) {
    return JSON.stringify({
      action: 'START_SIMULATION',
      payload: { id: 'gate-failure' },
      reply: `**Action Executed: Gate Failure Simulation at ${stadiumName}.**\n\nSimulating a critical gate failure. Current gate status: ${openGates}. Watch the cascade effects as flow redistributes across remaining entry points.`,
    });
  }

  // ---- Informational Queries ----

  // Status / summary
  if (lower.includes('status') || lower.includes('summary') || lower.includes('summarize') || lower.includes('overview')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**${stadiumName} — Live Status Report**\n\n| Metric | Value |\n|---|---|\n| 🏟 Occupancy | ${occ} |\n| 🚪 Gates | ${openGates} |\n| 🌡 Temperature | ${temp} |\n| 🌧 Rain Probability | ${rain} |\n| 💨 Wind | ${wind} |\n\n${zones ? `**Zone Highlights:** ${zones}` : ''}\n\n${parseInt(occ) > 80 ? '⚠️ **Alert:** Occupancy is above 80%. Consider activating crowd dispersal protocols.' : '✅ Operations are within normal parameters.'}`,
    });
  }

  // Risk assessment
  if (lower.includes('risk') || lower.includes('danger') || lower.includes('biggest') || lower.includes('threat') || lower.includes('concern')) {
    const rainPct = parseInt(rain) || 0;
    const occPct = parseInt(occ) || 0;
    const risks: string[] = [];
    if (occPct >= 75) risks.push(`1. **High Occupancy (${occ})** — ${stadiumName} is nearing capacity. Deploy crowd steering to lower-density zones.`);
    if (rainPct > 40) risks.push(`${risks.length + 1}. **Rain Risk (${rain})** — Open-air zones need rain cover protocols. Temperature: ${temp}.`);
    risks.push(`${risks.length + 1}. **Gate Monitoring** — Gate status is ${openGates}. Any congested gate should be monitored for queue buildup.`);

    return JSON.stringify({
      action: 'NONE',
      reply: `**Risk Assessment — ${stadiumName}**\n\n${risks.join('\n\n')}\n\n→ *Say "close gate [name]" or "simulate rain" to test mitigation strategies in real-time.*`,
    });
  }

  // Congestion
  if (lower.includes('congestion') || lower.includes('queue') || lower.includes('crowd') || lower.includes('flow')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**Crowd Flow Analysis — ${stadiumName}**\n\nCurrent occupancy: ${occ} | Gates: ${openGates}\n\n**Recommendations:**\n1. Deploy additional stewards to any congested gates.\n2. Activate digital signage directing arrivals to underutilized entry points.\n3. Monitor zone density trends — ${zones ? zones : 'all zones stable'}.\n\n→ *Try "close gate [name]" to simulate rerouting, or "simulate gate failure" to stress-test.*`,
    });
  }

  // Weather
  if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature') || lower.includes('wind') || lower.includes('heat')) {
    const rainPct = parseInt(rain) || 0;
    return JSON.stringify({
      action: 'NONE',
      reply: `**Weather Impact — ${stadiumName}**\n\n| Condition | Value |\n|---|---|\n| 🌡 Temperature | ${temp} |\n| 🌧 Rain Probability | ${rain} |\n| 💨 Wind Speed | ${wind} |\n\n${rainPct > 40 ? '⚠️ **Rain Advisory Active.** Uncovered zones should prepare for spectator redistribution. Stage rain ponchos and alert field staff.' : '☀️ Weather conditions are favorable. No immediate action required.'}\n\n${parseInt(temp) > 35 ? '🔥 **Heat Advisory:** Temperature exceeds 35°C. Ensure hydration stations are operational in all zones.' : ''}`,
    });
  }

  // Evacuation
  if (lower.includes('evacuat') || lower.includes('emergency') || lower.includes('clear') || lower.includes('safety')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**Emergency Protocol — ${stadiumName}**\n\nCurrent occupancy: ${occ} | Gates: ${openGates}\n\n**Recommended Steps:**\n1. Click the **"Emergency: Open All Gates"** button on the map to immediately unlock all entry/exit points.\n2. Activate PA system with evacuation instructions.\n3. Deploy all available safety personnel to high-density zones.\n4. Contact local emergency services if situation escalates.\n\n→ *You can also say "open gate [name]" to open specific gates.*`,
    });
  }

  // Capacity / how many people
  if (lower.includes('capacity') || lower.includes('how many') || lower.includes('people') || lower.includes('spectator')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**Capacity Report — ${stadiumName}**\n\nCurrent occupancy: **${occ}** of total capacity.\nGate status: ${openGates} gates operational.\n\n${zones ? `**Zone Breakdown:** ${zones}` : 'Zone-level breakdown is available on the interactive map — hover over any zone for real-time stats.'}\n\n${parseInt(occ) > 85 ? '⚠️ Approaching maximum capacity. Consider limiting further entry.' : '✅ Within safe operating capacity.'}`,
    });
  }

  // Help / general
  return JSON.stringify({
    action: 'NONE',
    reply: `I'm **EventOS X Copilot**, your AI-powered operations assistant for **${stadiumName}**.\n\nHere's what I can do:\n\n🎯 **Live Actions**\n• *"Close Gate A"* — Instantly close a gate\n• *"Open Gate B"* — Reopen a gate\n• *"Simulate rain"* — Run a rainstorm cascade\n• *"Simulate gate failure"* — Test a gate failure scenario\n\n📊 **Analysis**\n• *"What's the current status?"* — Full live report\n• *"What's our biggest risk?"* — AI risk assessment\n• *"How's the weather affecting operations?"* — Weather impact analysis\n• *"How many people are in the stadium?"* — Capacity report\n\n🚨 **Safety**\n• *"Emergency evacuation protocol"* — Safety procedures\n\nCurrent stats: ${occ} occupancy | ${openGates} gates | ${temp}`,
  });
}

