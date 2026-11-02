"""
Telemetry Engine for Autonomous Infrastructure Digital Twin.
Simulates live sensor telemetry with realistic physics coupling
(CPU load -> thermal rise -> power draw), calculates overall resilience,
and logs time-series data to SQLite.
"""

import math
import random
import time
from datetime import datetime
from typing import Dict, Any, List
from models import ComponentNode, ComponentStatus, ComponentType, TelemetryMetrics, InfrastructureResilience, Recommendation
from prediction_engine import PredictiveFailureEngine
from database import record_telemetry, log_simulation


class TelemetryEngine:
    def __init__(self):
        self.is_paused = False
        self.tick_count = 0
        self.components: Dict[str, ComponentNode] = {}
        self._init_components()

    def _init_components(self):
        """Initialize all 11 enterprise data center components with realistic baseline metrics."""
        self.components = {
            "user_traffic": ComponentNode(
                id="user_traffic",
                name="Global User Traffic",
                type=ComponentType.TRAFFIC,
                role="Ingress Load Source",
                status=ComponentStatus.HEALTHY,
                x=80,
                y=260,
                rack="External",
                ip_address="0.0.0.0/0",
                specification="14,200 req/sec ingress",
                capacity_max=25000.0,
                current_load=14200.0,
                dependencies=[],
                dependents=["router_gw"],
                telemetry=TelemetryMetrics(
                    cpu=12.0,
                    memory=15.0,
                    temperature=22.0,
                    traffic=71.0,
                    error_rate=0.08,
                    power=180.0,
                    health_score=98.0,
                    failure_probability=2.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "router_gw": ComponentNode(
                id="router_gw",
                name="Edge Gateway Router",
                type=ComponentType.ROUTER,
                role="Core Ingress Gateway",
                status=ComponentStatus.HEALTHY,
                x=250,
                y=260,
                rack="Rack-A01",
                ip_address="192.168.1.1",
                specification="Cisco ASR 9000 / 100GbE Duplex",
                capacity_max=100.0,
                current_load=48.0,
                dependencies=["user_traffic", "power_grid"],
                dependents=["load_balancer"],
                telemetry=TelemetryMetrics(
                    cpu=42.0,
                    memory=46.0,
                    temperature=51.0,
                    traffic=68.0,
                    error_rate=0.15,
                    power=480.0,
                    health_score=94.0,
                    failure_probability=5.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "load_balancer": ComponentNode(
                id="load_balancer",
                name="Application Load Balancer",
                type=ComponentType.LOAD_BALANCER,
                role="Cluster Traffic Balancer",
                status=ComponentStatus.HEALTHY,
                x=430,
                y=260,
                rack="Rack-A02",
                ip_address="10.0.1.5",
                specification="F5 BIG-IP iSeries / Layer-7 Proxy",
                capacity_max=100.0,
                current_load=58.0,
                dependencies=["router_gw", "power_grid"],
                dependents=["server_a", "server_b", "server_c"],
                telemetry=TelemetryMetrics(
                    cpu=54.0,
                    memory=58.0,
                    temperature=53.0,
                    traffic=72.0,
                    error_rate=0.4,
                    power=520.0,
                    health_score=92.0,
                    failure_probability=9.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "server_a": ComponentNode(
                id="server_a",
                name="Server A (App Node 01)",
                type=ComponentType.SERVER,
                role="Primary Application Host",
                status=ComponentStatus.CRITICAL,  # Default demo state: Server A is critical
                x=630,
                y=140,
                rack="Rack-B01",
                ip_address="10.0.1.11",
                specification="Dell R750 / 32-Core / 128GB ECC",
                capacity_max=100.0,
                current_load=86.0,
                redundancy_group="app_pool",
                dependencies=["load_balancer", "power_grid", "cooling_unit"],
                dependents=["db_primary"],
                telemetry=TelemetryMetrics(
                    cpu=86.0,
                    memory=78.0,
                    temperature=74.0,
                    traffic=91.0,
                    error_rate=4.2,
                    power=720.0,
                    vibration=1.45,
                    health_score=62.0,
                    failure_probability=87.0,
                    status=ComponentStatus.CRITICAL
                )
            ),
            "server_b": ComponentNode(
                id="server_b",
                name="Server B (App Node 02)",
                type=ComponentType.SERVER,
                role="Secondary Application Host",
                status=ComponentStatus.HEALTHY,
                x=630,
                y=260,
                rack="Rack-B02",
                ip_address="10.0.1.12",
                specification="Dell R750 / 32-Core / 128GB ECC",
                capacity_max=100.0,
                current_load=48.0,
                redundancy_group="app_pool",
                dependencies=["load_balancer", "power_grid", "cooling_unit"],
                dependents=["db_primary"],
                telemetry=TelemetryMetrics(
                    cpu=48.0,
                    memory=52.0,
                    temperature=56.0,
                    traffic=42.0,
                    error_rate=0.2,
                    power=440.0,
                    vibration=0.35,
                    health_score=91.0,
                    failure_probability=8.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "server_c": ComponentNode(
                id="server_c",
                name="Server C (App Node 03)",
                type=ComponentType.SERVER,
                role="Tertiary Application Host",
                status=ComponentStatus.HEALTHY,
                x=630,
                y=380,
                rack="Rack-B03",
                ip_address="10.0.1.13",
                specification="Dell R750 / 32-Core / 128GB ECC",
                capacity_max=100.0,
                current_load=44.0,
                redundancy_group="app_pool",
                dependencies=["load_balancer", "power_grid", "cooling_unit"],
                dependents=["db_primary"],
                telemetry=TelemetryMetrics(
                    cpu=44.0,
                    memory=48.0,
                    temperature=54.0,
                    traffic=39.0,
                    error_rate=0.18,
                    power=420.0,
                    vibration=0.32,
                    health_score=94.0,
                    failure_probability=6.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "db_primary": ComponentNode(
                id="db_primary",
                name="Primary Database",
                type=ComponentType.DATABASE,
                role="Active OLTP Master Engine",
                status=ComponentStatus.HEALTHY,
                x=830,
                y=190,
                rack="Rack-C01",
                ip_address="10.0.2.20",
                specification="PostgreSQL 16 Enterprise / 64C / 256GB NVMe",
                capacity_max=100.0,
                current_load=62.0,
                redundancy_group="db_cluster",
                dependencies=["server_a", "server_b", "server_c", "power_grid", "cooling_unit"],
                dependents=["db_replica", "storage_san"],
                telemetry=TelemetryMetrics(
                    cpu=62.0,
                    memory=71.0,
                    temperature=59.0,
                    traffic=64.0,
                    error_rate=0.3,
                    power=610.0,
                    health_score=89.0,
                    failure_probability=14.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "db_replica": ComponentNode(
                id="db_replica",
                name="Replica Database",
                type=ComponentType.REPLICA,
                role="Hot Standby Read Replica",
                status=ComponentStatus.HEALTHY,
                x=830,
                y=350,
                rack="Rack-C02",
                ip_address="10.0.2.21",
                specification="PostgreSQL 16 Standby / WAL Streaming / 0.4s sync",
                capacity_max=100.0,
                current_load=38.0,
                redundancy_group="db_cluster",
                dependencies=["db_primary", "power_grid"],
                dependents=["storage_san"],
                telemetry=TelemetryMetrics(
                    cpu=38.0,
                    memory=55.0,
                    temperature=52.0,
                    traffic=32.0,
                    error_rate=0.05,
                    power=410.0,
                    health_score=96.0,
                    failure_probability=4.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "storage_san": ComponentNode(
                id="storage_san",
                name="Storage Area Network (SAN)",
                type=ComponentType.STORAGE,
                role="Tier-1 Block Storage Array",
                status=ComponentStatus.HEALTHY,
                x=1010,
                y=270,
                rack="Rack-D01",
                ip_address="10.0.3.10",
                specification="PureStorage FlashArray//X / 120TB NVMe / 0.2ms latency",
                capacity_max=100.0,
                current_load=52.0,
                dependencies=["db_primary", "db_replica", "power_grid"],
                dependents=[],
                telemetry=TelemetryMetrics(
                    cpu=41.0,
                    memory=64.0,
                    temperature=48.0,
                    traffic=58.0,
                    error_rate=0.01,
                    power=550.0,
                    health_score=97.0,
                    failure_probability=3.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
            "cooling_unit": ComponentNode(
                id="cooling_unit",
                name="Precision Cooling HVAC",
                type=ComponentType.COOLING,
                role="Thermal Heat Exchanger",
                status=ComponentStatus.WARNING,  # Slight warning on thermal
                x=520,
                y=490,
                rack="Chiller-Loop-1",
                ip_address="10.0.99.10",
                specification="Liebert In-Row CRV / 60kW Chilled Water",
                capacity_max=100.0,
                current_load=74.0,
                dependencies=["power_grid"],
                dependents=["server_a", "server_b", "server_c", "db_primary"],
                telemetry=TelemetryMetrics(
                    cpu=35.0,
                    memory=30.0,
                    temperature=24.5,
                    traffic=12.0,
                    error_rate=0.8,
                    power=1850.0,
                    vibration=0.85,
                    health_score=82.0,
                    failure_probability=26.0,
                    status=ComponentStatus.WARNING
                )
            ),
            "power_grid": ComponentNode(
                id="power_grid",
                name="Dual-Feed Power & UPS",
                type=ComponentType.POWER,
                role="Uninterruptible Power Supply",
                status=ComponentStatus.HEALTHY,
                x=520,
                y=30,
                rack="PDU-Main",
                ip_address="10.0.99.20",
                specification="Galaxy VX 500kVA N+1 / 480V Dual Bus",
                capacity_max=100.0,
                current_load=61.0,
                dependencies=[],
                dependents=[
                    "router_gw", "load_balancer", "server_a", "server_b", 
                    "server_c", "db_primary", "db_replica", "storage_san", "cooling_unit"
                ],
                telemetry=TelemetryMetrics(
                    cpu=22.0,
                    memory=25.0,
                    temperature=38.0,
                    traffic=5.0,
                    error_rate=0.0,
                    power=3420.0,
                    health_score=98.0,
                    failure_probability=2.0,
                    status=ComponentStatus.HEALTHY
                )
            ),
        }

    def tick(self) -> Dict[str, Any]:
        """Perform one simulation tick with realistic slight fluctuation."""
        if self.is_paused:
            return self.get_summary()

        self.tick_count += 1
        now_str = datetime.utcnow().isoformat()

        for comp_id, comp in self.components.items():
            t = comp.telemetry
            # Natural micro-jitter
            delta_cpu = random.uniform(-0.8, 0.8)
            delta_traffic = random.uniform(-1.0, 1.0)
            delta_temp = (delta_cpu * 0.15) + random.uniform(-0.2, 0.2)

            # Keep values within realistic bounds
            if comp_id == "server_a":
                # Maintain critical state for demo unless modified
                new_cpu = min(94.0, max(82.0, t.cpu + delta_cpu))
                new_temp = min(79.0, max(72.0, t.temperature + delta_temp))
                new_traffic = min(96.0, max(88.0, t.traffic + delta_traffic))
                new_err = min(5.5, max(3.5, t.error_rate + random.uniform(-0.15, 0.15)))
                new_status = ComponentStatus.CRITICAL
                health = 62.0
                fail_prob = 87.0
            else:
                new_cpu = min(95.0, max(10.0, t.cpu + delta_cpu))
                new_temp = min(75.0, max(20.0, t.temperature + delta_temp))
                new_traffic = min(95.0, max(5.0, t.traffic + delta_traffic))
                new_err = min(8.0, max(0.01, t.error_rate + random.uniform(-0.05, 0.05)))
                
                # Derive health & status
                if new_cpu > 80 or new_temp > 70 or new_err > 3.0:
                    new_status = ComponentStatus.CRITICAL
                    health = max(40.0, 100.0 - (new_cpu * 0.4 + new_temp * 0.4))
                    fail_prob = min(92.0, 60.0 + new_cpu * 0.3)
                elif new_cpu > 70 or new_temp > 62 or new_err > 1.2 or comp_id == "cooling_unit":
                    new_status = ComponentStatus.WARNING
                    health = max(70.0, 100.0 - (new_cpu * 0.2 + new_temp * 0.2))
                    fail_prob = min(48.0, 20.0 + new_cpu * 0.2)
                else:
                    new_status = ComponentStatus.HEALTHY
                    health = max(88.0, 100.0 - (new_cpu * 0.1))
                    fail_prob = max(2.0, new_cpu * 0.15)

            comp.telemetry.cpu = round(new_cpu, 1)
            comp.telemetry.temperature = round(new_temp, 1)
            comp.telemetry.traffic = round(new_traffic, 1)
            comp.telemetry.error_rate = round(new_err, 2)
            comp.telemetry.health_score = round(health, 1)
            comp.telemetry.failure_probability = round(fail_prob, 1)
            comp.telemetry.status = new_status
            comp.telemetry.timestamp = now_str
            comp.status = new_status
            comp.current_load = round(new_cpu, 1)

            # Record sample in SQLite history every 5 ticks
            if self.tick_count % 5 == 0:
                record_telemetry(comp_id, comp.telemetry.dict())

        return self.get_summary()

    def get_summary(self) -> Dict[str, Any]:
        """Aggregate KPIs and system-wide resilience indicators."""
        total = len(self.components)
        healthy_count = sum(1 for c in self.components.values() if c.status == ComponentStatus.HEALTHY)
        warning_count = sum(1 for c in self.components.values() if c.status == ComponentStatus.WARNING)
        critical_count = sum(1 for c in self.components.values() if c.status == ComponentStatus.CRITICAL)
        offline_count = sum(1 for c in self.components.values() if c.status == ComponentStatus.OFFLINE)

        # Average health score
        avg_health = sum(c.telemetry.health_score for c in self.components.values()) / total
        avg_load = sum(c.current_load for c in self.components.values()) / total

        # Resilience calculation
        resilience = self.calculate_resilience()

        # Count predicted failures (risk > 50)
        predicted_failures = sum(1 for c in self.components.values() if c.telemetry.failure_probability > 50.0)

        return {
            "total_components": total,
            "healthy_components": healthy_count,
            "warning_components": warning_count,
            "critical_components": critical_count,
            "offline_components": offline_count,
            "overall_health": round(avg_health, 1),
            "current_system_load": round(avg_load, 1),
            "predicted_failures": predicted_failures,
            "resilience": resilience.dict(),
            "last_updated": datetime.utcnow().isoformat(),
            "demo_mode": True,
            "environment_label": "Demo Environment / Simulated Telemetry"
        }

    def calculate_resilience(self) -> InfrastructureResilience:
        """Calculate overall infrastructure resilience score (0-100)."""
        # Redundancy score: App cluster has 3 nodes (A, B, C), DB has replica
        # If all 3 servers up, redundancy = 95. If 1 fails, redundancy = 75
        up_servers = sum(1 for s in ["server_a", "server_b", "server_c"] if self.components[s].status != ComponentStatus.OFFLINE)
        redundancy_score = 95.0 if up_servers == 3 else (70.0 if up_servers == 2 else 35.0)

        # Component health score
        avg_health = sum(c.telemetry.health_score for c in self.components.values()) / len(self.components)

        # Backup availability: Primary -> Replica status
        db_rep = self.components.get("db_replica")
        backup_avail = 98.0 if db_rep and db_rep.status == ComponentStatus.HEALTHY else 50.0

        # Load headroom: capacity remaining across servers
        srv_loads = [self.components[s].current_load for s in ["server_a", "server_b", "server_c"] if self.components[s].status != ComponentStatus.OFFLINE]
        avg_srv_load = sum(srv_loads) / len(srv_loads) if srv_loads else 100.0
        headroom_score = max(20.0, 100.0 - avg_srv_load)

        # Dependency risk: Server A critical poses risk to load balancer and DB
        server_a_risk = self.components["server_a"].telemetry.failure_probability
        dep_risk_penalty = (server_a_risk / 100.0) * 22.0
        dep_risk_score = max(30.0, 95.0 - dep_risk_penalty)

        recovery_cap = 92.0  # Automated failover hooks ready

        # Weighted composite resilience
        resilience_score = (
            0.25 * redundancy_score +
            0.25 * avg_health +
            0.15 * backup_avail +
            0.15 * dep_risk_score +
            0.10 * headroom_score +
            0.10 * recovery_cap
        )
        resilience_score = round(min(99.0, max(25.0, resilience_score)), 1)

        positive_factors = [
            "Triple-node application tier redundancy (Server A/B/C pool)",
            "Hot-standby PostgreSQL read/failover replica synchronized (0.4s lag)",
            "Dual-feed A/B UPS power delivery units operational",
            "F5 load balancer supports dynamic least-connections failover"
        ]

        negative_factors = []
        if self.components["server_a"].telemetry.failure_probability > 70:
            negative_factors.append(f"Server A has critical failure probability ({self.components['server_a'].telemetry.failure_probability}%) due to thermal/CPU spike")
        if self.components["cooling_unit"].status == ComponentStatus.WARNING:
            negative_factors.append("Cooling System operating at elevated thermal delta (+4.8°C above nominal baseline)")
        if not negative_factors:
            negative_factors.append("No active critical single-point-of-failure alerts detected.")

        status_label = "Optimal" if resilience_score >= 90 else ("Healthy" if resilience_score >= 80 else ("At Risk" if resilience_score >= 60 else "Critical"))

        return InfrastructureResilience(
            overall_resilience_score=resilience_score,
            status_label=status_label,
            positive_factors=positive_factors,
            negative_factors=negative_factors,
            redundancy_score=round(redundancy_score, 1),
            component_health_score=round(avg_health, 1),
            backup_availability_score=round(backup_avail, 1),
            dependency_risk_score=round(dep_risk_score, 1),
            load_headroom_score=round(headroom_score, 1),
            recovery_capability_score=round(recovery_cap, 1)
        )

    def get_recommendations(self) -> List[Recommendation]:
        """Generate autonomous recommendations based on current telemetry state."""
        recs = []

        # Check Server A
        srv_a = self.components.get("server_a")
        if srv_a and srv_a.telemetry.failure_probability >= 70:
            recs.append(Recommendation(
                id="REC-001",
                component_id="server_a",
                component_name="Server A",
                severity="critical",
                issue="Server A CPU (86%) and thermal profile (74°C) approaching emergency cutoff junction.",
                recommended_action="Move 50% of traffic from Server A and distribute evenly between Server B and Server C.",
                expected_benefit="Reduces Server A core load by ~45%, averting ungraceful crash and thermal shutdown.",
                action_code="REALLOCATE_TRAFFIC_BALANCED",
                simulated_available=True
            ))

        # Check Cooling
        cooling = self.components.get("cooling_unit")
        if cooling and cooling.status in [ComponentStatus.WARNING, ComponentStatus.CRITICAL]:
            recs.append(Recommendation(
                id="REC-002",
                component_id="cooling_unit",
                component_name="Precision Cooling HVAC",
                severity="warning",
                issue="Chilled water loop return temperature elevated; Rack-B exhaust delta rising.",
                recommended_action="Increase secondary chiller pump velocity by 18% before Server A and DB reach thermal throttling.",
                expected_benefit="Lowers ambient rack temperatures by 4.5°C across the application server tier.",
                action_code="INCREASE_CHILLER_RPM",
                simulated_available=True
            ))

        # Primary DB check
        db = self.components.get("db_primary")
        if db:
            recs.append(Recommendation(
                id="REC-003",
                component_id="db_primary",
                component_name="Primary Database",
                severity="info",
                issue="Database connection pool utilization at 68%. Replica standby is healthy and synchronized.",
                recommended_action="Offload all read-heavy reporting queries to Replica Database (10.0.2.21).",
                expected_benefit="Frees 25% write-transaction lock headroom on Primary Database master.",
                action_code="OFFLOAD_READS_TO_REPLICA",
                simulated_available=True
            ))

        return recs
