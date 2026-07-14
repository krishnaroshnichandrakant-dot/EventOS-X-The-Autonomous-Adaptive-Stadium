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
 * Mock JSON responses for agentic execution.
 */
function getMockResponse(message: string): string {
  const lower = message.toLowerCase();

  // Close Gate A command
  if (lower.includes('close gate a')) {
    return JSON.stringify({
      action: 'TOGGLE_GATE',
      payload: { id: 'gate-a', status: 'closed' },
      reply: `**Action Executed: Closing Gate A.**

I have dispatched a command to the gate control system to close Gate A. 

**Downstream Cascade Prediction:**
- Incoming flow from Gate A is now redirecting to adjacent gates (Gate B & Gate F).
- Concourse North is expected to see a rise in density within 3 minutes.
- I recommend deploying safety personnel to Gate B to manage increased flow rates.`,
    });
  }

  // Close Gate B command
  if (lower.includes('close gate b')) {
    return JSON.stringify({
      action: 'TOGGLE_GATE',
      payload: { id: 'gate-b', status: 'closed' },
      reply: `**Action Executed: Closing Gate B.**

I have instructed the control system to close Gate B. 

**Downstream Cascade Prediction:**
- Incoming flow redirecting toward Gate A and Gate C.
- North Stand occupancy will likely rise. Rerouting digital signage is recommended.`,
    });
  }

  // Open Gate A command
  if (lower.includes('open gate a')) {
    return JSON.stringify({
      action: 'TOGGLE_GATE',
      payload: { id: 'gate-a', status: 'open' },
      reply: `**Action Executed: Opening Gate A.**

Gate A has been opened. Crowd flow is normalizing. Current flow rate will stabilize at ~120 ppl/min.`,
    });
  }

  // Simulate rain command
  if (lower.includes('simulate rain') || lower.includes('rain simulation')) {
    return JSON.stringify({
      action: 'START_SIMULATION',
      payload: { id: 'sudden-rain' },
      reply: `**Action Executed: Initializing Rainstorm Simulation.**

Launching the sudden rainstorm cascade. Spectators in uncovered zones (East, West, Field) will begin moving to shelter.`,
    });
  }

  // Simulate gate failure command
  if (lower.includes('simulate gate failure') || lower.includes('gate failure simulation')) {
    return JSON.stringify({
      action: 'START_SIMULATION',
      payload: { id: 'gate-failure' },
      reply: `**Action Executed: Initializing Gate B Failure Simulation.**

Closing Gate B and simulating crowd flow redirection and queue buildup.`,
    });
  }

  // Default risk assessment request
  if (lower.includes('risk') || lower.includes('danger') || lower.includes('biggest')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**Current Risk Assessment**

Based on live stadium data, here are the top concerns:

1. **Zone Overcrowding — North Stand** (HIGH)
   The North Stand is trending upward at ~75% capacity. If this continues, it could reach critical density within 20 minutes.

   → *Recommended:* Activate crowd diversion messaging to West Stand via PA system.

2. **Rain Forecast** (MEDIUM)
   There's a 45% chance of rain in the next 2 hours. Open-air zones (East Stand, West Stand, Field Level) have ~10,700 spectators.

   → *Recommended:* Pre-check retractable roof. Have rain ponchos staged for quick distribution.

3. **Gate D Congestion** (MEDIUM)
   Gate D is operating at near-max flow rate (190/200 ppl/min).

   → *Recommended:* Deploy additional staff to Gate D. Consider redirecting traffic to Gate E.`,
    });
  }

  // Default congestion response
  if (lower.includes('congestion') || lower.includes('gate') || lower.includes('crowd')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**Congestion Analysis**

Gate D is currently showing congestion with a flow rate of 190/200 people per minute. 

**Recommended Action Plan:**
1. Deploy 2 additional crowd management staff to Gate D.
2. Activate digital signage directing arrivals to Gate E (currently at 60/200 — plenty of capacity).
3. Open the auxiliary lane at Gate D to temporarily increase throughput.`,
    });
  }

  // Default weather response
  if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature')) {
    return JSON.stringify({
      action: 'NONE',
      reply: `**Weather Impact Summary**

Current conditions: 28°C, partly cloudy, 18 km/h wind.

**Key Concerns:**
- **UV Index: 7** — SUNSCREEN advisory should be active.
- **Rain Probability: 45%** — Increasing over next 3 hours. Stage rain protocol.`,
    });
  }

  // Fallback normal chat response
  return JSON.stringify({
    action: 'NONE',
    reply: `I'm EventOS X, your stadium operations copilot. I can help you:

• **Act on the dashboard** — Try saying: *"close Gate A"*, *"open Gate A"*, or *"simulate rain"*
• **Analyze risks** — Ask: *"What's our biggest risk right now?"*
• **Manage queues** — Ask: *"Suggest a fix for gate congestion"*

Simply send a command to see the dashboard respond in real-time.`,
  });
}
