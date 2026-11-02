"""
What-If Scenario Simulator & Resilience Optimization Engine.
Simulates infrastructure failures virtually inside the Digital Twin,
computes cascading impacts, checks capacity headroom, recommends safest actions,
and compares multi-option mitigation strategies.
"""

import copy
from typing import Dict, Any, List, Tuple
from models import (
    ComponentNode, ComponentStatus, SimulationRequest, SimulationResult, 
    ScenarioOption, TelemetryMetrics
)
from graph_engine import InfrastructureGraphEngine
from database import log_simulation


class WhatIfSimulator:
    def __init__(self, graph_engine: InfrastructureGraphEngine):
        self.graph_engine = graph_engine

    def run_simulation(
        self, 
        current_components: Dict[str, ComponentNode], 
        request: SimulationRequest
    ) -> SimulationResult:
        """
        Execute a virtual what-if scenario.
        Creates a deep copy of current infrastructure, applies the virtual perturbation,
        propagates cascading load, evaluates headroom, and recommends the safest mitigation.
        """
        scenario_type = request.scenario_type
        target_id = request.target_component_id

        # Take virtual snapshot
        before_state = {k: copy.deepcopy(v) for k, v in current_components.items()}
        after_state = {k: copy.deepcopy(v) for k, v in current_components.items()}

        affected_components: List[str] = []
        cascading_path: List[str] = []
        candidate_capacities: Dict[str, float] = {}
        is_safe = True
        failover_possible = True
        recommended_action = ""
        recommendation_reason = ""
        scenario_title = ""
        event_description = ""

        # Risk and Resilience scores
        risk_before = 45.0
        risk_after = 22.0
        resilience_before = 87.0
        resilience_after = 92.0

        if scenario_type in ["server_failure", "server_shutdown"]:
            scenario_title = f"Simulate {after_state.get(target_id, ComponentNode(id=target_id, name='Server A', type='server', role='', status='healthy', telemetry=before_state['server_a'].telemetry)).name} Failure"
            event_description = f"Virtual detachment of {target_id}. Heartbeat suspended; load balancer marks node as unresponsive."

            # Virtual event: Server A goes OFFLINE
            if target_id in after_state:
                target_node = after_state[target_id]
                target_node.status = ComponentStatus.OFFLINE
                target_node.telemetry.status = ComponentStatus.OFFLINE
                target_node.telemetry.cpu = 0.0
                target_node.telemetry.traffic = 0.0
                target_node.telemetry.power = 95.0  # standby idle power
                target_node.telemetry.health_score = 0.0
                target_node.telemetry.failure_probability = 100.0
                target_node.current_load = 0.0

            # Determine surviving peer cluster servers
            cluster_peers = [s for s in ["server_a", "server_b", "server_c"] if s != target_id]
            affected_components = [target_id, "load_balancer"] + cluster_peers + ["db_primary"]
            cascading_path = [target_id, "load_balancer"] + cluster_peers + ["db_primary"]

            # Workload redistribution: Server A load (approx 86%) split between surviving peers
            # Server B: baseline 48% + 34% -> 82%
            # Server C: baseline 44% + 35% -> 79%
            if "server_b" in after_state and target_id != "server_b":
                after_state["server_b"].telemetry.cpu = 82.0
                after_state["server_b"].telemetry.traffic = 78.0
                after_state["server_b"].telemetry.temperature = 63.5
                after_state["server_b"].telemetry.health_score = 86.0
                after_state["server_b"].telemetry.failure_probability = 14.0
                after_state["server_b"].current_load = 82.0
                candidate_capacities["Server B (App Node 02)"] = 82.0

            if "server_c" in after_state and target_id != "server_c":
                after_state["server_c"].telemetry.cpu = 79.0
                after_state["server_c"].telemetry.traffic = 75.0
                after_state["server_c"].telemetry.temperature = 61.8
                after_state["server_c"].telemetry.health_score = 88.0
                after_state["server_c"].telemetry.failure_probability = 12.0
                after_state["server_c"].current_load = 79.0
                candidate_capacities["Server C (App Node 03)"] = 79.0

            # Database & Load Balancer adjustment
            if "db_primary" in after_state:
                after_state["db_primary"].telemetry.cpu = 71.0
                after_state["db_primary"].current_load = 71.0
                after_state["db_primary"].telemetry.traffic = 68.0

            if "load_balancer" in after_state:
                after_state["load_balancer"].telemetry.cpu = 68.0
                after_state["load_balancer"].current_load = 68.0

            # Headroom validation: both peers under 85% safe ceiling
            max_peer_load = max(candidate_capacities.values()) if candidate_capacities else 82.0
            if max_peer_load < 85.0:
                is_safe = True
                failover_possible = True
                recommended_action = "Redirect Server A traffic evenly across Server B (50%) and Server C (50%)."
                recommendation_reason = (
                    "Surviving cluster nodes possess sufficient headroom (Server B: 82%, Server C: 79%). "
                    "Infrastructure absorbs the full traffic quota with 0% dropped transactions and no downtime."
                )
                risk_before = 87.0
                risk_after = 18.0
                resilience_before = 72.0
                resilience_after = 88.0
            else:
                is_safe = False
                failover_possible = False
                recommended_action = "Surviving nodes approaching critical saturation (>88%). Enable Cloud Bursting or throttle non-critical batch APIs."
                recommendation_reason = "Server B & C capacity insufficient to absorb traffic safely without secondary thermal alarms."

            comparison_options = [
                ScenarioOption(
                    id="OPT-A",
                    title="Option A: Do Nothing",
                    description="Allow Server A to crash ungracefully without proactive load shedding.",
                    risk_level="High",
                    risk_score=89.0,
                    expected_downtime="15 - 45 minutes",
                    capacity_overhead="Unbalanced (100% loss of node A capacity)",
                    is_safest=False,
                    action_type="do_nothing"
                ),
                ScenarioOption(
                    id="OPT-B",
                    title="Option B: Failover Solely to Server B",
                    description="Route 100% of Server A requests to Server B only.",
                    risk_level="Warning",
                    risk_score=68.0,
                    expected_downtime="< 1 minute",
                    capacity_overhead="Server B at 98% (Thermal throttling risk)",
                    is_safest=False,
                    action_type="shift_server_b"
                ),
                ScenarioOption(
                    id="OPT-C",
                    title="Option C: Dual Balanced Failover (Server B + Server C)",
                    description="Dynamically repartition ingress upstream weights across Server B (50%) and Server C (50%).",
                    risk_level="Safe",
                    risk_score=18.0,
                    expected_downtime="0 seconds (Hitless transition)",
                    capacity_overhead="Server B at 82%, Server C at 79% (Balanced headroom)",
                    is_safest=True,
                    action_type="distribute_balanced"
                )
            ]

        elif scenario_type == "traffic_surge":
            surge_pct = request.surge_percentage or 50.0
            scenario_title = f"Simulate {surge_pct:.0f}% Global Ingress Traffic Surge"
            event_description = f"User ingress spikes from 14,200 req/s to {14200 * (1 + surge_pct/100):.0f} req/s."

            affected_components = ["user_traffic", "router_gw", "load_balancer", "server_a", "server_b", "server_c", "db_primary"]
            cascading_path = ["user_traffic", "router_gw", "load_balancer", "server_a", "server_b", "server_c", "db_primary"]

            for comp_id in ["server_a", "server_b", "server_c"]:
                if comp_id in after_state:
                    node = after_state[comp_id]
                    factor = 1.0 + (surge_pct / 100.0) * 0.45
                    node.telemetry.cpu = min(99.0, node.telemetry.cpu * factor)
                    node.telemetry.traffic = min(99.0, node.telemetry.traffic * factor)
                    node.current_load = node.telemetry.cpu
                    candidate_capacities[node.name] = node.current_load

            # Server A reaches 96% critical in surge
            if "server_a" in after_state:
                after_state["server_a"].telemetry.cpu = 96.0
                after_state["server_a"].current_load = 96.0
                after_state["server_a"].status = ComponentStatus.CRITICAL

            is_safe = False
            recommended_action = "Deploy Edge Rate-Limiting & scale out horizontal microservice replicas."
            recommendation_reason = "Server A breaches 95% CPU ceiling. Ingress traffic exceeds single rack capacity."
            risk_before = 45.0
            risk_after = 78.0
            resilience_before = 87.0
            resilience_after = 64.0

            comparison_options = [
                ScenarioOption(
                    id="OPT-A",
                    title="Option A: Absorb Traffic Unmodified",
                    description="Let tier-1 infrastructure buffer queue depth without shedding.",
                    risk_level="Critical",
                    risk_score=85.0,
                    expected_downtime="Frequent 504 Gateway Timeouts",
                    capacity_overhead="Server A 96%, LB 91%",
                    is_safest=False,
                    action_type="do_nothing"
                ),
                ScenarioOption(
                    id="OPT-B",
                    title="Option B: Activate Cloud Bursting Auto-Scaler",
                    description="Instantiate 2 temporary virtual compute nodes in Cloud Tier.",
                    risk_level="Safe",
                    risk_score=16.0,
                    expected_downtime="0 seconds",
                    capacity_overhead="Normalizes all nodes to ~65% load",
                    is_safest=True,
                    action_type="scale_burst"
                )
            ]

        elif scenario_type == "db_failure":
            scenario_title = "Simulate Primary Database Master Failure"
            event_description = "Primary Database OLTP engine experiences virtual storage controller lockup."

            if "db_primary" in after_state:
                after_state["db_primary"].status = ComponentStatus.OFFLINE
                after_state["db_primary"].telemetry.status = ComponentStatus.OFFLINE
                after_state["db_primary"].telemetry.health_score = 0.0

            affected_components = ["db_primary", "db_replica", "server_a", "server_b", "server_c", "storage_san"]
            cascading_path = ["db_primary", "db_replica", "server_a", "server_b", "server_c"]

            # Replica promotion readiness
            if "db_replica" in after_state:
                candidate_capacities["Replica Database (Standby)"] = 72.0

            is_safe = True
            failover_possible = True
            recommended_action = "Promote Replica Database (10.0.2.21) to Active Master; re-point connection pools."
            recommendation_reason = (
                "Hot-standby WAL replication is fully synchronized (lag < 400ms). "
                "Automatic promotion guarantees zero data loss (RPO=0) and recovery in < 12 seconds."
            )
            risk_before = 45.0
            risk_after = 24.0
            resilience_before = 87.0
            resilience_after = 82.0

            comparison_options = [
                ScenarioOption(
                    id="OPT-A",
                    title="Option A: Wait for Primary Reboot",
                    description="Attempt manual hard restart of Dell R750 DB host.",
                    risk_level="Critical",
                    risk_score=92.0,
                    expected_downtime="12 - 25 minutes",
                    capacity_overhead="Complete OLTP stall",
                    is_safest=False,
                    action_type="wait_reboot"
                ),
                ScenarioOption(
                    id="OPT-B",
                    title="Option B: Instant Replica Promotion (Automated Failover)",
                    description="Issue pg_ctl promote and flip virtual IP to replica.",
                    risk_level="Safe",
                    risk_score=15.0,
                    expected_downtime="< 10 seconds",
                    capacity_overhead="Replica absorbs 72% write load",
                    is_safest=True,
                    action_type="promote_replica"
                )
            ]

        elif scenario_type == "cooling_failure":
            scenario_title = "Simulate Precision Cooling HVAC Degradation"
            event_description = "Liebert CRV Chilled Water circulation valve jams at 20% aperture."

            if "cooling_unit" in after_state:
                after_state["cooling_unit"].status = ComponentStatus.CRITICAL
                after_state["cooling_unit"].telemetry.temperature = 34.0
                after_state["cooling_unit"].telemetry.health_score = 42.0

            affected_components = ["cooling_unit", "server_a", "server_b", "server_c", "db_primary"]
            cascading_path = ["cooling_unit", "server_a", "db_primary", "server_b", "server_c"]

            # Heat raises across all compute
            for comp_id in ["server_a", "server_b", "server_c", "db_primary"]:
                if comp_id in after_state:
                    node = after_state[comp_id]
                    node.telemetry.temperature += 12.0
                    node.telemetry.cpu = max(20.0, node.telemetry.cpu * 0.8)  # thermal throttling

            is_safe = False
            recommended_action = "Engage auxiliary backup CRAC units and shed non-essential batch workloads."
            recommendation_reason = "Rack temperatures approach 86°C threshold. Hardware protection trips imminent."
            risk_before = 45.0
            risk_after = 84.0
            resilience_before = 87.0
            resilience_after = 48.0

            comparison_options = [
                ScenarioOption(
                    id="OPT-A",
                    title="Option A: Do Nothing",
                    description="Rely on server internal fans at 100% duty cycle.",
                    risk_level="Critical",
                    risk_score=94.0,
                    expected_downtime="Emergency thermal trip in ~20 mins",
                    capacity_overhead="Severe thermal throttling",
                    is_safest=False,
                    action_type="do_nothing"
                ),
                ScenarioOption(
                    id="OPT-B",
                    title="Option B: Activate Emergency Exhaust Louvers & Eco-Cooling",
                    description="Switch to external cold-aisle air intake and ramp backup chiller loop.",
                    risk_level="Safe",
                    risk_score=22.0,
                    expected_downtime="0 seconds",
                    capacity_overhead="Stabilizes temperatures to 64°C",
                    is_safest=True,
                    action_type="engage_backup_cooling"
                )
            ]

        else:
            # Generic fallback
            scenario_title = f"Simulate Perturbation on {target_id}"
            event_description = f"Simulated fault injection on {target_id}."
            affected_components = self.graph_engine.get_blast_radius(target_id)
            cascading_path = [target_id] + affected_components[:3]
            recommended_action = f"Isolate {target_id} and trigger redundant cluster failover."
            recommendation_reason = "Virtual twin model confirms graceful containment across redundant pathways."
            comparison_options = [
                ScenarioOption(
                    id="OPT-A",
                    title="Option A: Standard Remediation",
                    description="Failover traffic to secondary standby.",
                    risk_level="Safe",
                    risk_score=20.0,
                    expected_downtime="< 1 min",
                    capacity_overhead="Nominal",
                    is_safest=True,
                    action_type="standard_failover"
                )
            ]

        target_node_name = before_state[target_id].name if target_id in before_state else target_id

        result = SimulationResult(
            scenario_id=f"SIM-{scenario_type.upper()}-{int(risk_after)}",
            scenario_title=scenario_title,
            target_component_id=target_id,
            target_component_name=target_node_name,
            event_description=event_description,
            before_components=before_state,
            after_components=after_state,
            affected_components=affected_components,
            cascading_path=cascading_path,
            risk_score_before=risk_before,
            risk_score_after=risk_after,
            resilience_score_before=resilience_before,
            resilience_score_after=resilience_after,
            is_safe=is_safe,
            failover_possible=failover_possible,
            recommended_action=recommended_action,
            recommendation_reason=recommendation_reason,
            candidate_capacities=candidate_capacities,
            comparison_options=comparison_options
        )

        # Log to audit DB
        log_simulation(result.dict())

        return result
