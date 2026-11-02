"""
Data models for Autonomous Infrastructure Digital Twin.
Defines schemas for components, telemetry metrics, simulation runs,
cascading impact, incidents, and recommendations.
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ComponentStatus(str, Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"
    SIMULATED = "simulated"


class ComponentType(str, Enum):
    TRAFFIC = "traffic"
    ROUTER = "router"
    LOAD_BALANCER = "load_balancer"
    SERVER = "server"
    DATABASE = "database"
    REPLICA = "replica"
    STORAGE = "storage"
    COOLING = "cooling"
    POWER = "power"


class TelemetryMetrics(BaseModel):
    cpu: float = Field(..., description="CPU utilization percentage (0-100)")
    memory: float = Field(..., description="Memory utilization percentage (0-100)")
    temperature: float = Field(..., description="Operating temperature in Celsius")
    traffic: float = Field(..., description="Network traffic load percentage (0-100)")
    error_rate: float = Field(..., description="Error rate percentage (0-100)")
    power: float = Field(..., description="Power draw in Watts")
    vibration: float = Field(default=0.4, description="Acoustic/vibration amplitude in mm/s")
    health_score: float = Field(..., description="Component Health Score (0-100)")
    failure_probability: float = Field(..., description="Estimated failure probability (0-100)")
    status: ComponentStatus = ComponentStatus.HEALTHY
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ComponentNode(BaseModel):
    id: str
    name: str
    type: ComponentType
    role: str
    status: ComponentStatus
    telemetry: TelemetryMetrics
    dependencies: List[str] = Field(default_factory=list, description="Upstream components this node depends on")
    dependents: List[str] = Field(default_factory=list, description="Downstream components dependent on this node")
    redundancy_group: Optional[str] = None
    capacity_max: float = 100.0
    current_load: float = 50.0
    x: int = 0
    y: int = 0
    rack: str = "Rack-01"
    ip_address: str = "10.0.1.10"
    specification: str = "Intel Xeon 32-Core / 128GB RAM"


class Incident(BaseModel):
    id: str
    component_id: str
    component_name: str
    severity: str  # "critical", "warning", "info"
    title: str
    trigger: str
    failure_probability: float
    status: str  # "Under Observation", "Active", "Mitigated"
    detected_time: str
    recommended_action: str


class PredictionExplanation(BaseModel):
    component_id: str
    component_name: str

    # Current risk assessment
    risk_score: float
    risk_level: str  # Safe, Warning, High Risk, Critical

    # Explainability
    primary_reasons: List[str]
    ai_explanation: str
    anomaly_factors: Dict[str, float]

    # Failure estimation
    estimated_time_to_failure_min: Optional[int] = None

    # Forecast timeline
    prediction_5min: float = 0.0
    prediction_15min: float = 0.0
    prediction_30min: float = 0.0
    prediction_60min: float = 0.0

    # Prediction intelligence
    prediction_confidence: float = 0.0
    failure_trajectory: str = "Stable"
    root_cause: str = "No significant anomaly detected"

    # Autonomous recommendation
    recommended_action: str = "Continue monitoring"


class ScenarioOption(BaseModel):
    id: str
    title: str
    description: str
    risk_level: str
    risk_score: float
    expected_downtime: str
    capacity_overhead: str
    is_safest: bool = False
    action_type: str


class SimulationRequest(BaseModel):
    scenario_type: str  # "server_failure", "overheating", "traffic_surge", "db_failure", "cooling_failure", "power_failure", "custom"
    target_component_id: str = "server_a"
    surge_percentage: Optional[float] = 50.0
    overheat_temp: Optional[float] = 92.0


class SimulationResult(BaseModel):
    scenario_id: str
    scenario_title: str
    target_component_id: str
    target_component_name: str
    event_description: str
    before_components: Dict[str, ComponentNode]
    after_components: Dict[str, ComponentNode]
    affected_components: List[str]
    cascading_path: List[str]
    risk_score_before: float
    risk_score_after: float
    resilience_score_before: float
    resilience_score_after: float
    is_safe: bool
    failover_possible: bool
    recommended_action: str
    recommendation_reason: str
    candidate_capacities: Dict[str, float]
    comparison_options: List[ScenarioOption]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class InfrastructureResilience(BaseModel):
    overall_resilience_score: float
    status_label: str
    positive_factors: List[str]
    negative_factors: List[str]
    redundancy_score: float
    component_health_score: float
    backup_availability_score: float
    dependency_risk_score: float
    load_headroom_score: float
    recovery_capability_score: float


class Recommendation(BaseModel):
    id: str
    component_id: str
    component_name: str
    severity: str
    issue: str
    recommended_action: str
    expected_benefit: str
    action_code: str
    simulated_available: bool = True
