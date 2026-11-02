export type ComponentStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'simulated';

export type ComponentType =
  | 'traffic'
  | 'router'
  | 'load_balancer'
  | 'server'
  | 'database'
  | 'replica'
  | 'storage'
  | 'cooling'
  | 'power';

export interface TelemetryMetrics {
  cpu: number;
  memory: number;
  temperature: number;
  traffic: number;
  error_rate: number;
  power: number;
  vibration?: number;
  health_score: number;
  failure_probability: number;
  status: ComponentStatus;
  timestamp: string;
}

export interface ComponentNode {
  id: string;
  name: string;
  type: ComponentType;
  role: string;
  status: ComponentStatus;
  telemetry: TelemetryMetrics;
  dependencies: string[];
  dependents: string[];
  redundancy_group?: string;
  capacity_max: number;
  current_load: number;
  x: number;
  y: number;
  rack: string;
  ip_address: string;
  specification: string;
}

export interface InfrastructureResilience {
  overall_resilience_score: number;
  status_label: string;
  positive_factors: string[];
  negative_factors: string[];
  redundancy_score: number;
  component_health_score: number;
  backup_availability_score: number;
  dependency_risk_score: number;
  load_headroom_score: number;
  recovery_capability_score: number;
}

export interface SystemSummary {
  total_components: number;
  healthy_components: number;
  warning_components: number;
  critical_components: number;
  offline_components: number;
  overall_health: number;
  current_system_load: number;
  predicted_failures: number;
  resilience: InfrastructureResilience;
  last_updated: string;
  demo_mode: boolean;
  environment_label: string;
}

export interface Incident {
  id: string;
  component_id: string;
  component_name: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  trigger: string;
  failure_probability: number;
  status: string;
  detected_time: string;
  recommended_action: string;
}

export interface PredictionExplanation {
  component_id: string;
  component_name: string;

  // Current risk assessment
  risk_score: number;
  risk_level: 'Safe' | 'Warning' | 'High Risk' | 'Critical';

  // Explainability
  primary_reasons: string[];
  ai_explanation: string;
  anomaly_factors: Record<string, number>;

  // Failure estimation
  estimated_time_to_failure_min?: number;

  // Multi-horizon prediction
  prediction_5min: number;
  prediction_15min: number;
  prediction_30min: number;
  prediction_60min: number;

  // Prediction intelligence
  prediction_confidence: number;
  failure_trajectory: string;
  root_cause: string;

  // Autonomous recommendation
  recommended_action: string;
}

export interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  risk_level: string;
  risk_score: number;
  expected_downtime: string;
  capacity_overhead: string;
  is_safest: boolean;
  action_type: string;
}

export interface SimulationResult {
  scenario_id: string;
  scenario_title: string;
  target_component_id: string;
  target_component_name: string;
  event_description: string;
  before_components: Record<string, ComponentNode>;
  after_components: Record<string, ComponentNode>;
  affected_components: string[];
  cascading_path: string[];
  risk_score_before: number;
  risk_score_after: number;
  resilience_score_before: number;
  resilience_score_after: number;
  is_safe: boolean;
  failover_possible: boolean;
  recommended_action: string;
  recommendation_reason: string;
  candidate_capacities: Record<string, number>;
  comparison_options: ScenarioOption[];
  timestamp: string;
}

export interface Recommendation {
  id: string;
  component_id: string;
  component_name: string;
  severity: string;
  issue: string;
  recommended_action: string;
  expected_benefit: string;
  action_code: string;
  simulated_available: boolean;
}

export interface GraphNode {
  id: string;
  name: string;
  type: ComponentType;
  role: string;
  x: number;
  y: number;
  spec: string;
  status?: ComponentStatus;
  current_load?: number;
  cpu?: number;
  temperature?: number;
  health_score?: number;
  failure_probability?: number;
  dependencies: string[];
  dependents: string[];
  blast_radius: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  bandwidth: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}