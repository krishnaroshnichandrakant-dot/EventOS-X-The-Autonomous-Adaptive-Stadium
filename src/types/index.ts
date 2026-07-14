// ============================================================
// EventOS X — Type Definitions
// ============================================================

/** Stadium zone density level */
export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

/** Gate operational status */
export type GateStatus = 'open' | 'closed' | 'congested';

/** Risk severity level */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Stadium event lifecycle */
export type EventStatus = 'pre-event' | 'live' | 'halftime' | 'post-event';

/** Trend direction for zone occupancy */
export type TrendDirection = 'rising' | 'falling' | 'stable';

// ============================================================
// Stadium Data
// ============================================================

export interface Zone {
  id: string;
  name: string;
  shortName: string;
  maxCapacity: number;
  currentOccupancy: number;
  density: DensityLevel;
  trend: TrendDirection;
  isCovered: boolean;         // Whether the zone has roof cover
  hasHydration: boolean;      // Whether the zone has hydration stations
  svgPathId: string;          // Matches the SVG element id
}

export interface Gate {
  id: string;
  name: string;
  status: GateStatus;
  flowRate: number;           // people per minute
  maxFlowRate: number;
  connectedZones: string[];   // zone IDs
  position: 'north' | 'south' | 'east' | 'west';
}

// ============================================================
// Weather Data
// ============================================================

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastPoint[];
  lastUpdated: string;        // ISO timestamp
}

export interface CurrentWeather {
  temp: number;               // Celsius
  feelsLike: number;
  humidity: number;           // %
  windSpeed: number;          // km/h
  windDirection: number;      // degrees
  description: string;
  icon: string;               // OpenWeather icon code
  uvIndex: number;
  rainProbability: number;    // %
  pressure: number;           // hPa
  visibility: number;         // km
}

export interface ForecastPoint {
  time: string;               // ISO timestamp
  temp: number;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

// ============================================================
// Weather Alerts (rule-based)
// ============================================================

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface WeatherAlert {
  id: string;
  type: 'heat' | 'rain' | 'uv' | 'wind' | 'storm';
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  affectedZones: string[];    // zone names
  icon: string;
}

// ============================================================
// Risk & Scenarios
// ============================================================

export interface RiskBreakdown {
  label: string;
  value: number;
}

export interface RiskScenario {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  probability: number;         // 0-100
  riskScore: number;           // 0-100 explainable score
  breakdown: RiskBreakdown[];  // contribution details
  impact: string;
  affectedZones: string[];
  recommendedActions: string[];
  triggerConditions: string[];
  icon: string;
  isActive: boolean;
  aiAnalysis?: string;         // Gemini-generated explanation
}

// ============================================================
// AI Copilot
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HistoryItem {
  timestamp: string;
  zones: Zone[];
  gates: Gate[];
  risks: RiskScenario[];
}

export interface Prediction {
  zoneId: string;
  timeToBreachMinutes: number;
  reason: string;
  recommendation: string;
}

export interface StadiumState {
  zones: Zone[];
  gates: Gate[];
  weather: WeatherData | null;
  risks: RiskScenario[];
  eventStatus: EventStatus;
  simulationActive: boolean;
  selectedZoneId: string | null;
  selectedRiskId: string | null;
  history: HistoryItem[];
  playbackIndex: number | null;
  predictions: Prediction[];
}

export type StadiumAction =
  | { type: 'SET_ZONES'; payload: Zone[] }
  | { type: 'UPDATE_ZONE'; payload: { id: string; updates: Partial<Zone> } }
  | { type: 'SET_GATES'; payload: Gate[] }
  | { type: 'TOGGLE_GATE'; payload: { id: string; status: GateStatus } }
  | { type: 'SET_WEATHER'; payload: WeatherData }
  | { type: 'SET_RISKS'; payload: RiskScenario[] }
  | { type: 'UPDATE_RISK'; payload: { id: string; updates: Partial<RiskScenario> } }
  | { type: 'SET_EVENT_STATUS'; payload: EventStatus }
  | { type: 'START_SIMULATION'; payload: string }  // scenario id
  | { type: 'STOP_SIMULATION' }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SELECT_RISK'; payload: string | null }
  | { type: 'BULK_UPDATE'; payload: Partial<StadiumState> }
  | { type: 'RECORD_HISTORY_TICK' }
  | { type: 'SET_PLAYBACK_INDEX'; payload: number | null };
