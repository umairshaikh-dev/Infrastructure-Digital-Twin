"""
FastAPI Application for Autonomous Infrastructure Digital Twin.
Provides RESTful endpoints for real-time telemetry, topology graph,
predictive anomaly analysis, what-if simulations, incidents, and recommendations.
"""

import asyncio
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models import (
    ComponentNode, SimulationRequest, SimulationResult,
    Incident, PredictionExplanation, InfrastructureResilience,
    Recommendation, ComponentStatus
)
from database import init_db, get_historical_telemetry, get_all_incidents, add_incident
from graph_engine import InfrastructureGraphEngine
from telemetry_engine import TelemetryEngine
from prediction_engine import PredictiveFailureEngine
from simulation_engine import WhatIfSimulator

# Global instances
graph_engine = InfrastructureGraphEngine()
telemetry_engine = TelemetryEngine()
simulator = WhatIfSimulator(graph_engine)
background_tick_task = None


async def telemetry_background_loop():
    """Run real-time telemetry update ticks every 3 seconds."""
    while True:
        try:
            telemetry_engine.tick()
            await asyncio.sleep(3.0)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in telemetry background loop: {e}")
            await asyncio.sleep(3.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    # Seed initial telemetry ticks
    for _ in range(3):
        telemetry_engine.tick()
    task = asyncio.create_task(telemetry_background_loop())
    yield
    # Shutdown
    task.cancel()


app = FastAPI(
    title="Autonomous Infrastructure Digital Twin API",
    description="Predictive Simulation & Resilience Optimization Platform for Enterprise Data Centers",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def get_health():
    return {
        "status": "online",
        "service": "Autonomous Infrastructure Digital Twin",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "disclaimer": "Demo Environment / Simulated Telemetry"
    }


@app.get("/api/summary")
def get_summary():
    """Retrieve top-level executive KPIs, resilience score, and system status."""
    return telemetry_engine.get_summary()


@app.get("/api/components", response_model=Dict[str, ComponentNode])
def get_components():
    """Retrieve current operational status and telemetry for all infrastructure components."""
    return telemetry_engine.components


@app.get("/api/components/{component_id}")
def get_component_detail(component_id: str):
    """Retrieve in-depth details, upstream/downstream graph dependencies, and blast radius for a node."""
    if component_id not in telemetry_engine.components:
        raise HTTPException(status_code=404, detail="Component not found")

    node = telemetry_engine.components[component_id]
    direct_deps = graph_engine.get_direct_dependencies(component_id)
    direct_consumers = graph_engine.get_direct_dependents(component_id)
    blast_radius = graph_engine.get_blast_radius(component_id)
    prediction = PredictiveFailureEngine.calculate_component_risk(component_id, node.name, node.telemetry.dict())

    # Map name metadata
    deps_meta = [{"id": d, "name": telemetry_engine.components[d].name if d in telemetry_engine.components else d} for d in direct_deps]
    consumers_meta = [{"id": c, "name": telemetry_engine.components[c].name if c in telemetry_engine.components else c} for c in direct_consumers]
    blast_meta = [{"id": b, "name": telemetry_engine.components[b].name if b in telemetry_engine.components else b} for b in blast_radius]

    return {
        "component": node,
        "direct_dependencies": deps_meta,
        "direct_dependents": consumers_meta,
        "blast_radius": blast_meta,
        "prediction": prediction
    }


@app.get("/api/graph")
def get_graph():
    """Export complete visual topology for interactive frontend canvas rendering."""
    graph_data = graph_engine.export_graph()
    # Enrich nodes with live status and current load
    for n in graph_data["nodes"]:
        cid = n["id"]
        if cid in telemetry_engine.components:
            live_node = telemetry_engine.components[cid]
            n["status"] = live_node.status
            n["current_load"] = live_node.current_load
            n["cpu"] = live_node.telemetry.cpu
            n["temperature"] = live_node.telemetry.temperature
            n["health_score"] = live_node.telemetry.health_score
            n["failure_probability"] = live_node.telemetry.failure_probability
            n["power"] = live_node.telemetry.power
            n["error_rate"] = live_node.telemetry.error_rate
    return graph_data


@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(request: SimulationRequest):
    """
    Run virtual what-if scenario inside the Digital Twin without affecting physical infrastructure.
    Calculates cascading impact, evaluates candidate failover headroom, and recommends safest action.
    """
    return simulator.run_simulation(telemetry_engine.components, request)


@app.get("/api/predictions")
def get_all_predictions():
    """
    Predictive failure detection analysis for all components.
    Uses multi-metric rule-based anomaly scoring with transparent formula.
    """
    results = []
    for comp_id, comp in telemetry_engine.components.items():
        pred = PredictiveFailureEngine.calculate_component_risk(comp_id, comp.name, comp.telemetry.dict())
        results.append(pred)

    # Sort critical / highest risk first
    results.sort(key=lambda x: x.risk_score, reverse=True)
    return {
        "predictions": results,
        "transparent_model_info": {
            "model_type": "Multi-Sensor Rule-Based Anomaly Scoring Engine",
            "formula": "Risk = 0.28 * TempFactor + 0.27 * CPUFactor + 0.22 * ErrorFactor + 0.13 * TrafficFactor + 0.10 * MemFactor",
            "threshold_critical": "Risk >= 76% (Immediate mitigation advised)",
            "classification_levels": {
                "Safe": "0 - 20%",
                "Warning": "21 - 50%",
                "High Risk": "51 - 75%",
                "Critical": "76 - 100%"
            },
            "disclaimer": "Simulated prototype telemetry. Designed for prospective connection to real IoT / APM telemetry streams."
        }
    }


@app.get("/api/resilience", response_model=InfrastructureResilience)
def get_resilience():
    """Compute and retrieve system-wide Infrastructure Resilience Score breakdown."""
    return telemetry_engine.calculate_resilience()


@app.get("/api/incidents")
def get_incidents():
    """Retrieve active and recent infrastructure incidents."""
    return get_all_incidents()


@app.post("/api/incidents")
def create_incident(incident: Incident):
    """Log a new incident or update existing state."""
    add_incident(incident.dict())
    return {"status": "success", "incident_id": incident.id}


@app.get("/api/recommendations")
def get_recommendations():
    """Retrieve prioritized autonomous resilience recommendations."""
    recs = telemetry_engine.get_recommendations()
    return {
        "recommendations": recs,
        "total": len(recs),
        "engine": "Autonomous Resilience Optimization Engine"
    }


@app.get("/api/analytics")
def get_analytics(component_id: Optional[str] = None, hours: int = 1):
    """Retrieve time-series telemetry data for historical analytics charts."""
    # If database has few points, generate smooth realistic historical trajectory
    now = datetime.utcnow()
    points = 20
    interval_min = max(2, (hours * 60) // points)

    history = []
    for i in range(points, -1, -1):
        t = now - timedelta(minutes=i * interval_min)
        t_str = t.strftime("%H:%M")

        # Base curve for Server A exhibiting thermal / load drift
        progress = (points - i) / points
        server_a_cpu = 50.0 + (36.0 * progress) + (math.sin(i) * 2.0)
        server_a_temp = 52.0 + (22.0 * progress) + (math.cos(i) * 1.5)
        server_a_err = 0.2 + (4.0 * (progress ** 2))

        history.append({
            "timestamp": t_str,
            "server_a_cpu": round(server_a_cpu, 1),
            "server_a_temp": round(server_a_temp, 1),
            "server_a_err": round(server_a_err, 2),
            "server_b_cpu": round(45.0 + math.sin(i * 0.5) * 4.0, 1),
            "server_c_cpu": round(42.0 + math.cos(i * 0.5) * 3.5, 1),
            "db_primary_cpu": round(58.0 + (10.0 * progress) + math.sin(i) * 2.0, 1),
            "traffic_load": round(65.0 + (18.0 * progress) + math.cos(i) * 3.0, 1),
            "total_power_kw": round(3.8 + (1.2 * progress), 2),
            "overall_resilience": round(94.0 - (18.0 * progress), 1)
        })

    return {
        "timeframe_hours": hours,
        "datapoints": history,
        "target_component": component_id or "all"
    }


@app.post("/api/demo/step/{step_id}")
def set_demo_step(step_id: int):
    """
    Control Demo Mode step according to Section 20 of requirements:
    Step 1: Normal Infrastructure (Health 94%, all healthy)
    Step 2: Detect Warning (Server A CPU 86%, Temp 74°C, Fail Prob 87%)
    Step 3: Open Twin
    Step 4-9: Simulation flow handled via /api/simulate
    """
    if step_id == 1:
        # Reset all to healthy
        for comp in telemetry_engine.components.values():
            comp.status = ComponentStatus.HEALTHY
            comp.telemetry.status = ComponentStatus.HEALTHY
            comp.telemetry.cpu = 45.0
            comp.telemetry.temperature = 52.0
            comp.telemetry.traffic = 40.0
            comp.telemetry.error_rate = 0.2
            comp.telemetry.health_score = 94.0
            comp.telemetry.failure_probability = 6.0
        return {"step": 1, "message": "Normal infrastructure state initialized (Health 94%)"}

    elif step_id == 2 or step_id == 3:
        # Set Server A to critical
        srv_a = telemetry_engine.components["server_a"]
        srv_a.status = ComponentStatus.CRITICAL
        srv_a.telemetry.status = ComponentStatus.CRITICAL
        srv_a.telemetry.cpu = 86.0
        srv_a.telemetry.temperature = 74.0
        srv_a.telemetry.traffic = 91.0
        srv_a.telemetry.error_rate = 4.2
        srv_a.telemetry.health_score = 62.0
        srv_a.telemetry.failure_probability = 87.0
        return {"step": step_id, "message": "Server A warning & high failure probability (87%) triggered."}

    return {"step": step_id, "message": f"Step {step_id} configured."}


@app.post("/api/control/reset")
def reset_system():
    """Reset telemetry to initial demo baseline."""
    telemetry_engine._init_components()
    return {"status": "reset", "summary": telemetry_engine.get_summary()}


@app.post("/api/control/toggle-pause")
def toggle_pause():
    """Pause or resume real-time telemetry fluctuation."""
    telemetry_engine.is_paused = not telemetry_engine.is_paused
    return {"is_paused": telemetry_engine.is_paused}
