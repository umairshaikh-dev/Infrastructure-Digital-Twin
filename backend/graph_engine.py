"""
Graph-Based Dependency Engine using NetworkX.
Maintains the infrastructure topology, tracks upstream and downstream linkages,
computes cascading failure paths, and identifies single points of failure.
"""

import networkx as nx
from typing import Dict, List, Any, Set


class InfrastructureGraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_topology()

    def _build_topology(self):
        """Construct the directed dependency graph for the Enterprise Data Center."""
        # Nodes definitions with visual canvas coordinates and metadata
        nodes = [
            {"id": "user_traffic", "name": "Global User Traffic", "type": "traffic", "role": "Ingress Load", "x": 80, "y": 260, "spec": "15,000 req/sec peak"},
            {"id": "router_gw", "name": "Edge Gateway Router", "type": "router", "role": "Border Gateway", "x": 240, "y": 260, "spec": "Cisco ASR 9000 / 100GbE"},
            {"id": "load_balancer", "name": "Application Load Balancer", "type": "load_balancer", "role": "Traffic Distribution", "x": 420, "y": 260, "spec": "F5 BIG-IP / Round-Robin + LeastConn"},
            {"id": "server_a", "name": "Server A (App Node 01)", "type": "server", "role": "Application Cluster Node", "x": 620, "y": 140, "spec": "Dell PowerEdge R750 / 32C / 128GB"},
            {"id": "server_b", "name": "Server B (App Node 02)", "type": "server", "role": "Application Cluster Node", "x": 620, "y": 260, "spec": "Dell PowerEdge R750 / 32C / 128GB"},
            {"id": "server_c", "name": "Server C (App Node 03)", "type": "server", "role": "Application Cluster Node", "x": 620, "y": 380, "spec": "Dell PowerEdge R750 / 32C / 128GB"},
            {"id": "db_primary", "name": "Primary Database", "type": "database", "role": "Core Relational Store (Active)", "x": 820, "y": 200, "spec": "PostgreSQL 16 High-Perf / 64C / 256GB NVMe"},
            {"id": "db_replica", "name": "Replica Database", "type": "replica", "role": "Standby Sync Replica (Read/Failover)", "x": 820, "y": 340, "spec": "PostgreSQL 16 Standby / WAL Streaming"},
            {"id": "storage_san", "name": "Storage Area Network (SAN)", "type": "storage", "role": "Persistent Tier-1 Storage", "x": 1000, "y": 270, "spec": "PureStorage FlashArray / 120TB NVMe-oF"},
            {"id": "cooling_unit", "name": "Precision Cooling HVAC", "type": "cooling", "role": "Thermal Management", "x": 520, "y": 490, "spec": "Liebert CRV In-Row Precision Chiller"},
            {"id": "power_grid", "name": "Dual-Feed Power & UPS", "type": "power", "role": "Power Delivery Unit (PDU)", "x": 520, "y": 30, "spec": "Schneider Galaxy VX 500kVA + Battery Bank"},
        ]

        for n in nodes:
            self.graph.add_node(n["id"], **n)

        # Directed dependencies: A -> B means B depends on A (or traffic/service flows from A to B)
        # Service / Ingress flow edges
        service_edges = [
            ("user_traffic", "router_gw", {"type": "traffic_flow", "bandwidth": "100Gbps"}),
            ("router_gw", "load_balancer", {"type": "traffic_flow", "bandwidth": "40Gbps"}),
            ("load_balancer", "server_a", {"type": "app_distribution", "bandwidth": "10Gbps"}),
            ("load_balancer", "server_b", {"type": "app_distribution", "bandwidth": "10Gbps"}),
            ("load_balancer", "server_c", {"type": "app_distribution", "bandwidth": "10Gbps"}),
            ("server_a", "db_primary", {"type": "db_query", "bandwidth": "10Gbps"}),
            ("server_b", "db_primary", {"type": "db_query", "bandwidth": "10Gbps"}),
            ("server_c", "db_primary", {"type": "db_query", "bandwidth": "10Gbps"}),
            ("db_primary", "db_replica", {"type": "replication_sync", "bandwidth": "10Gbps"}),
            ("db_primary", "storage_san", {"type": "storage_io", "bandwidth": "32Gbps FC"}),
            ("db_replica", "storage_san", {"type": "storage_io", "bandwidth": "32Gbps FC"}),
        ]

        # Environmental & Infrastructure dependencies
        infra_edges = [
            ("power_grid", "router_gw", {"type": "power_feed"}),
            ("power_grid", "load_balancer", {"type": "power_feed"}),
            ("power_grid", "server_a", {"type": "power_feed"}),
            ("power_grid", "server_b", {"type": "power_feed"}),
            ("power_grid", "server_c", {"type": "power_feed"}),
            ("power_grid", "db_primary", {"type": "power_feed"}),
            ("power_grid", "db_replica", {"type": "power_feed"}),
            ("power_grid", "storage_san", {"type": "power_feed"}),
            ("power_grid", "cooling_unit", {"type": "power_feed"}),
            ("cooling_unit", "server_a", {"type": "thermal_dissipation"}),
            ("cooling_unit", "server_b", {"type": "thermal_dissipation"}),
            ("cooling_unit", "server_c", {"type": "thermal_dissipation"}),
            ("cooling_unit", "db_primary", {"type": "thermal_dissipation"}),
        ]

        for u, v, data in service_edges + infra_edges:
            self.graph.add_edge(u, v, **data)

    def get_direct_dependencies(self, node_id: str) -> List[str]:
        """Upstream nodes that feed into or supply this node."""
        if node_id not in self.graph:
            return []
        return list(self.graph.predecessors(node_id))

    def get_direct_dependents(self, node_id: str) -> List[str]:
        """Downstream nodes that consume or receive from this node."""
        if node_id not in self.graph:
            return []
        return list(self.graph.successors(node_id))

    def get_blast_radius(self, node_id: str) -> List[str]:
        """Calculate the full cascading blast radius (all reachable downstream nodes)."""
        if node_id not in self.graph:
            return []
        
        # In service infrastructure, if Server A fails:
        # 1. Load balancer needs reconfiguration (upstream traffic diversion)
        # 2. Peer cluster servers (Server B & C) absorb additional load
        # 3. Downstream Database experiences query queue perturbation
        affected: Set[str] = set()

        if node_id in ["server_a", "server_b", "server_c"]:
            # Cluster siblings
            cluster = ["server_a", "server_b", "server_c"]
            for peer in cluster:
                if peer != node_id:
                    affected.add(peer)
            affected.add("load_balancer")
            affected.add("db_primary")
            return list(affected)

        if node_id == "power_grid":
            # Total facility blackout
            return [n for n in self.graph.nodes if n != "power_grid"]

        if node_id == "cooling_unit":
            # All thermal-dependent servers and DB
            return ["server_a", "server_b", "server_c", "db_primary"]

        if node_id == "db_primary":
            return ["db_replica", "server_a", "server_b", "server_c", "storage_san"]

        if node_id == "load_balancer":
            return ["server_a", "server_b", "server_c", "router_gw"]

        # Default graph forward reachability
        descendants = nx.descendants(self.graph, node_id)
        return list(descendants)

    def get_cascading_sequence(self, node_id: str) -> List[Dict[str, Any]]:
        """Compute chronological progression of cascading impacts."""
        if node_id == "server_a":
            return [
                {"step": 1, "component": "server_a", "impact": "Node offline / heartbeat lost", "severity": "critical", "latency_delta": "+0ms"},
                {"step": 2, "component": "load_balancer", "impact": "502 Gateway Errors detected; health probe failure", "severity": "warning", "latency_delta": "+45ms"},
                {"step": 3, "component": "server_b", "impact": "Workload reallocation: +34% CPU & memory surge", "severity": "warning", "latency_delta": "+15ms"},
                {"step": 4, "component": "server_c", "impact": "Workload reallocation: +31% CPU & memory surge", "severity": "warning", "latency_delta": "+12ms"},
                {"step": 5, "component": "db_primary", "impact": "Connection pool renegotiation from surviving nodes", "severity": "healthy", "latency_delta": "+5ms"}
            ]
        elif node_id == "db_primary":
            return [
                {"step": 1, "component": "db_primary", "impact": "WAL lock failure / storage timeout", "severity": "critical", "latency_delta": "+1200ms"},
                {"step": 2, "component": "db_replica", "impact": "Read-replica promotion candidate triggered", "severity": "warning", "latency_delta": "+30ms"},
                {"step": 3, "component": "server_a", "impact": "Transaction rollback surge; write timeouts", "severity": "critical", "latency_delta": "+350ms"},
                {"step": 4, "component": "server_b", "impact": "Transaction rollback surge; write timeouts", "severity": "critical", "latency_delta": "+350ms"},
                {"step": 5, "component": "server_c", "impact": "Transaction rollback surge; write timeouts", "severity": "critical", "latency_delta": "+350ms"}
            ]
        elif node_id == "cooling_unit":
            return [
                {"step": 1, "component": "cooling_unit", "impact": "Compressor refrigerant pressure collapse", "severity": "critical", "latency_delta": "+0ms"},
                {"step": 2, "component": "server_a", "impact": "Ambient rack temp rises to 82°C; dynamic CPU throttling", "severity": "critical", "latency_delta": "+90ms"},
                {"step": 3, "component": "server_b", "impact": "Ambient rack temp rises to 79°C; fans at 100% PWM", "severity": "warning", "latency_delta": "+45ms"},
                {"step": 4, "component": "server_c", "impact": "Ambient rack temp rises to 78°C; fans at 100% PWM", "severity": "warning", "latency_delta": "+40ms"},
                {"step": 5, "component": "db_primary", "impact": "Storage controller thermal throttle threshold warning", "severity": "warning", "latency_delta": "+60ms"}
            ]
        else:
            blast = self.get_blast_radius(node_id)
            return [
                {"step": i + 1, "component": comp, "impact": f"Transitive telemetry disruption via {node_id}", "severity": "warning", "latency_delta": f"+{i*15+10}ms"}
                for i, comp in enumerate(blast[:5])
            ]

    def export_graph(self) -> Dict[str, Any]:
        """Export nodes and edges for frontend React visualization."""
        nodes_out = []
        for n, data in self.graph.nodes(data=True):
            nodes_out.append({
                "id": n,
                "name": data.get("name", n),
                "type": data.get("type", "server"),
                "role": data.get("role", "Infrastructure Component"),
                "x": data.get("x", 100),
                "y": data.get("y", 100),
                "spec": data.get("spec", ""),
                "dependencies": self.get_direct_dependencies(n),
                "dependents": self.get_direct_dependents(n),
                "blast_radius": self.get_blast_radius(n)
            })

        edges_out = []
        for u, v, data in self.graph.edges(data=True):
            edges_out.append({
                "source": u,
                "target": v,
                "type": data.get("type", "flow"),
                "bandwidth": data.get("bandwidth", "")
            })

        return {"nodes": nodes_out, "edges": edges_out}
