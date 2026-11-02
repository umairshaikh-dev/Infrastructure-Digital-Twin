"""
SQLite Database interface for Infrastructure Digital Twin.
Stores telemetry history, simulated incidents, and scenario audit logs.
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "digital_twin.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Auto-initialize database on load
_initialized = False
def ensure_db():
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Telemetry history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id TEXT NOT NULL,
        cpu REAL,
        memory REAL,
        temperature REAL,
        traffic REAL,
        error_rate REAL,
        power REAL,
        vibration REAL,
        health_score REAL,
        failure_probability REAL,
        status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        component_id TEXT NOT NULL,
        component_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        trigger TEXT NOT NULL,
        failure_probability REAL,
        status TEXT NOT NULL,
        detected_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        recommended_action TEXT
    )
    """)

    # Simulations audit table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulation_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scenario_id TEXT NOT NULL,
        scenario_title TEXT NOT NULL,
        target_component_id TEXT,
        risk_before REAL,
        risk_after REAL,
        resilience_before REAL,
        resilience_after REAL,
        recommended_action TEXT,
        is_safe INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed initial incidents if empty
    cursor.execute("SELECT COUNT(*) FROM incidents")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO incidents (id, component_id, component_name, severity, title, trigger, failure_probability, status, detected_time, recommended_action)
        VALUES 
        ('INC-001', 'server_a', 'Server A', 'critical', 'Thermal Runaway & Core Load Spike', 'Abnormal CPU (86%) & Core Temp (74°C)', 87.0, 'Under Observation', datetime('now', '-25 minutes'), 'Divert 50% traffic to Server B and C before thermal junction cutoff'),
        ('INC-002', 'cooling_unit', 'Precision Cooling System', 'warning', 'HVAC Chilled Water Delta T Anomaly', 'Rack exhaust temp rising +4.8°C over baseline', 42.0, 'Investigating', datetime('now', '-1 hour'), 'Increase secondary chiller loop compressor speed by 15%'),
        ('INC-003', 'router_gw', 'Gateway Router', 'info', 'Intermittent BGP Route Flapping', 'Carrier link latency jitter +18ms', 18.0, 'Mitigated', datetime('now', '-3 hours'), 'Automatic reroute over redundant dark fiber trunk verified')
        """)
        conn.commit()

    conn.close()


def record_telemetry(component_id: str, data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO telemetry_history (component_id, cpu, memory, temperature, traffic, error_rate, power, vibration, health_score, failure_probability, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        component_id,
        data.get("cpu", 0),
        data.get("memory", 0),
        data.get("temperature", 0),
        data.get("traffic", 0),
        data.get("error_rate", 0),
        data.get("power", 0),
        data.get("vibration", 0.4),
        data.get("health_score", 100),
        data.get("failure_probability", 0),
        data.get("status", "healthy"),
        data.get("timestamp", datetime.utcnow().isoformat())
    ))
    conn.commit()
    conn.close()


def get_historical_telemetry(component_id: Optional[str] = None, hours: int = 1) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    time_threshold = (datetime.utcnow() - timedelta(hours=hours)).isoformat()

    if component_id:
        cursor.execute("""
        SELECT * FROM telemetry_history 
        WHERE component_id = ? AND timestamp >= ? 
        ORDER BY timestamp ASC
        """, (component_id, time_threshold))
    else:
        cursor.execute("""
        SELECT * FROM telemetry_history 
        WHERE timestamp >= ? 
        ORDER BY timestamp ASC
        """, (time_threshold,))

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_all_incidents() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY detected_time DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def add_incident(incident: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO incidents (id, component_id, component_name, severity, title, trigger, failure_probability, status, detected_time, recommended_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident["id"],
        incident["component_id"],
        incident["component_name"],
        incident["severity"],
        incident["title"],
        incident["trigger"],
        incident["failure_probability"],
        incident["status"],
        incident.get("detected_time", datetime.utcnow().isoformat()),
        incident["recommended_action"]
    ))
    conn.commit()
    conn.close()


def log_simulation(result: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO simulation_audit (scenario_id, scenario_title, target_component_id, risk_before, risk_after, resilience_before, resilience_after, recommended_action, is_safe)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result.get("scenario_id", "sim_custom"),
        result.get("scenario_title", "What-If Simulation"),
        result.get("target_component_id", "server_a"),
        result.get("risk_score_before", 0),
        result.get("risk_score_after", 0),
        result.get("resilience_score_before", 100),
        result.get("resilience_score_after", 100),
        result.get("recommended_action", ""),
        1 if result.get("is_safe", True) else 0
    ))
    conn.commit()
    conn.close()

# Auto-initialize database tables on import
init_db()
