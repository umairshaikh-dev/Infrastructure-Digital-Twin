/**
 * API Service for Infrastructure Digital Twin.
 * Communicates with FastAPI backend with built-in client fallback
 * for seamless operation in isolated frontend environments.
 */

import {
  SystemSummary,
  ComponentNode,
  GraphData,
  SimulationResult,
  Incident,
  PredictionExplanation,
  InfrastructureResilience,
  Recommendation
} from '../types';

const API_BASE = 'http://localhost:8000/api';
const TOKEN_KEY = 'digital_twin_access_token';

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: { email: string; role: string };
}

function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
}

async function authenticate(path: '/auth/login' | '/auth/demo', body?: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.detail || `Authentication failed (${res.status})`);
  const auth = payload as AuthResponse;
  window.localStorage.setItem(TOKEN_KEY, auth.access_token);
  return auth;
}

// Check if backend is reachable
let backendOnline = true;

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    backendOnline = true;
    return await res.json();
  } catch (err) {
    console.warn(`Backend connection note on ${endpoint}:`, err);
    backendOnline = false;
    throw err;
  }
}

export interface PredictionResponse {
  predictions: PredictionExplanation[];

  transparent_model_info: {
    model_type: string;
    formula: string;
    threshold_critical: string;
    classification_levels: Record<string, string>;
    disclaimer: string;
  };
}

export const api = {
  isBackendOnline: () => backendOnline,

  login: (email: string, password: string): Promise<AuthResponse> =>
    authenticate('/auth/login', { email, password }),

  demoAccess: (): Promise<AuthResponse> => authenticate('/auth/demo'),

  logout: (): void => clearAuthToken(),

  // ─────────────────────────────────────────────
  // System Summary
  // ─────────────────────────────────────────────

  getSummary: async (): Promise<SystemSummary> => {
    return request<SystemSummary>('/summary');
  },

  // ─────────────────────────────────────────────
  // Components
  // ─────────────────────────────────────────────

  getComponents: async (): Promise<Record<string, ComponentNode>> => {
    return request<Record<string, ComponentNode>>('/components');
  },

  getComponentDetail: async (id: string) => {
    return request<{
      component: ComponentNode;
      direct_dependencies: { id: string; name: string }[];
      direct_dependents: { id: string; name: string }[];
      blast_radius: { id: string; name: string }[];
      prediction: PredictionExplanation;
    }>(`/components/${id}`);
  },

  // ─────────────────────────────────────────────
  // Digital Twin Graph
  // ─────────────────────────────────────────────

  getGraph: async (): Promise<GraphData> => {
    return request<GraphData>('/graph');
  },

  // ─────────────────────────────────────────────
  // Simulation
  // ─────────────────────────────────────────────

  runSimulation: async (
    req: {
      scenario_type: string;
      target_component_id: string;
      surge_percentage?: number;
    }
  ): Promise<SimulationResult> => {
    return request<SimulationResult>('/simulate', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  },

  // ─────────────────────────────────────────────
  // Predictive Intelligence
  // ─────────────────────────────────────────────

  getPredictions: async (): Promise<PredictionResponse> => {
    return request<PredictionResponse>('/predictions');
  },

  // ─────────────────────────────────────────────
  // Resilience
  // ─────────────────────────────────────────────

  getResilience: async (): Promise<InfrastructureResilience> => {
    return request<InfrastructureResilience>('/resilience');
  },

  // ─────────────────────────────────────────────
  // Incidents
  // ─────────────────────────────────────────────

  getIncidents: async (): Promise<Incident[]> => {
    return request<Incident[]>('/incidents');
  },

  // ─────────────────────────────────────────────
  // Autonomous Recommendations
  // ─────────────────────────────────────────────

  getRecommendations: async (): Promise<{
    recommendations: Recommendation[];
    total: number;
    engine: string;
  }> => {
    return request<{
      recommendations: Recommendation[];
      total: number;
      engine: string;
    }>('/recommendations');
  },

  // ─────────────────────────────────────────────
  // Historical Analytics
  // ─────────────────────────────────────────────

  getAnalytics: async (hours: number = 1) => {
    return request<{
      timeframe_hours: number;
      datapoints: any[];
      target_component: string;
    }>(`/analytics?hours=${hours}`);
  },

  // ─────────────────────────────────────────────
  // Guided Demo
  // ─────────────────────────────────────────────

  triggerDemoStep: async (stepId: number) => {
    return request<{
      step: number;
      message: string;
    }>(`/demo/step/${stepId}`, {
      method: 'POST'
    });
  },

  // ─────────────────────────────────────────────
  // System Controls
  // ─────────────────────────────────────────────

  resetSystem: async () => {
    return request<{
      status: string;
      summary: SystemSummary;
    }>('/control/reset', {
      method: 'POST'
    });
  },

  togglePause: async () => {
    return request<{
      is_paused: boolean;
    }>('/control/toggle-pause', {
      method: 'POST'
    });
  }
};