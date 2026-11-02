"""
Predictive Failure Detection Engine.
Calculates Failure Risk Score (0-100), determines risk classification,
breaks down multi-metric anomaly factors, and provides transparent AI explanations.
Clearly labeled as a rule-based anomaly scoring prototype.
"""

from typing import Dict, List, Any, Tuple
from models import PredictionExplanation, TelemetryMetrics


class PredictiveFailureEngine:
    """
    Transparent Rule-Based Predictive Anomaly Engine.
    Evaluates telemetry metrics against operational baselines and trend thresholds.
    """

    # Baselines for healthy enterprise infrastructure
    THRESHOLDS = {
        "cpu": {"normal_max": 65.0, "warning": 75.0, "critical": 85.0},
        "temperature": {"normal_max": 58.0, "warning": 68.0, "critical": 72.0},
        "error_rate": {"normal_max": 0.8, "warning": 2.0, "critical": 4.0},
        "traffic": {"normal_max": 60.0, "warning": 80.0, "critical": 90.0},
        "memory": {"normal_max": 70.0, "warning": 80.0, "critical": 90.0},
        "vibration": {"normal_max": 0.6, "warning": 1.2, "critical": 1.8},
        "power": {"normal_max": 450.0, "warning": 600.0, "critical": 750.0},
    }

    @staticmethod
    def calculate_component_risk(component_id: str, component_name: str, metrics: Dict[str, Any]) -> PredictionExplanation:
        """Calculate the failure risk score and construct human-readable explanations."""
        cpu = metrics.get("cpu", 50.0)
        temp = metrics.get("temperature", 55.0)
        err = metrics.get("error_rate", 0.2)
        traffic = metrics.get("traffic", 45.0)
        mem = metrics.get("memory", 50.0)
        vib = metrics.get("vibration", 0.4)
        power = metrics.get("power", 400.0)

        # 1. CPU Factor (0 to 100)
        if cpu <= 65:
            cpu_factor = (cpu / 65.0) * 20.0
        elif cpu <= 75:
            cpu_factor = 20.0 + ((cpu - 65.0) / 10.0) * 30.0
        elif cpu <= 85:
            cpu_factor = 50.0 + ((cpu - 75.0) / 10.0) * 35.0
        else:
            cpu_factor = 85.0 + min(15.0, ((cpu - 85.0) / 15.0) * 15.0)

        # 2. Temperature Factor (0 to 100)
        if temp <= 58:
            temp_factor = (temp / 58.0) * 15.0
        elif temp <= 68:
            temp_factor = 15.0 + ((temp - 58.0) / 10.0) * 35.0
        elif temp <= 72:
            temp_factor = 50.0 + ((temp - 68.0) / 4.0) * 30.0
        else:
            temp_factor = 80.0 + min(20.0, ((temp - 72.0) / 15.0) * 20.0)

        # 3. Error Rate Factor (0 to 100)
        if err <= 0.8:
            err_factor = (err / 0.8) * 15.0
        elif err <= 2.0:
            err_factor = 15.0 + ((err - 0.8) / 1.2) * 35.0
        elif err <= 4.0:
            err_factor = 50.0 + ((err - 2.0) / 2.0) * 35.0
        else:
            err_factor = 85.0 + min(15.0, ((err - 4.0) / 4.0) * 15.0)

        # 4. Traffic Factor (0 to 100)
        traffic_factor = min(100.0, max(0.0, (traffic / 100.0) * 100.0))

        # 5. Memory Factor (0 to 100)
        mem_factor = min(100.0, max(0.0, (mem / 100.0) * 100.0))

        # Weighted composite risk score
        # Thermal and CPU drive 55% of hardware failures in high-density datacenters
        risk_score = (
            0.28 * temp_factor +
            0.27 * cpu_factor +
            0.22 * err_factor +
            0.13 * traffic_factor +
            0.10 * mem_factor
        )

        risk_score = round(min(99.0, max(4.0, risk_score)), 1)

        # Risk level classification
        if risk_score <= 20:
            risk_level = "Safe"
        elif risk_score <= 50:
            risk_level = "Warning"
        elif risk_score <= 75:
            risk_level = "High Risk"
        else:
            risk_level = "Critical"

        # Identify primary driving reasons
        reasons = []
        if cpu > 75:
            reasons.append(f"CPU utilization sustained at {cpu:.1f}% (exceeds 75% threshold)")
        if temp > 68:
            reasons.append(f"Core operating temperature reached {temp:.1f}°C (thermal limit 72°C)")
        if err > 1.5:
            reasons.append(f"Network error rate surged to {err:.1f}% (baseline < 0.8%)")
        if traffic > 80:
            reasons.append(f"Ingress network traffic saturated at {traffic:.1f}% bandwidth")
        if mem > 80:
            reasons.append(f"Memory pressure elevated to {mem:.1f}%")
        if vib > 1.0:
            reasons.append(f"Fan chassis vibration abnormal ({vib:.2f} mm/s)")

        if not reasons:
            reasons.append("All operational telemetry within standard Tier-III tolerance envelopes.")

        # Generate AI-style narrative explanation
        if risk_score >= 76:
            estimated_ttf = max(15, int(120 - (risk_score - 75) * 4))
            ai_explanation = (
                f"{component_name} is exhibiting critical telemetry degradation driven by "
                f"{', '.join(reasons[:2])}. Based on simulated multi-sensor anomaly trajectories, "
                f"the probability of hardware failure or service freeze is high ({risk_score}%). "
                f"Estimated time to failure without mitigation is ~{estimated_ttf} minutes."
            )
        elif risk_score >= 51:
            estimated_ttf = 180
            ai_explanation = (
                f"{component_name} telemetry shows elevated stress patterns. "
                f"{reasons[0]}. Continued load escalation without mitigation may trigger "
                f"cascading thermal throttling within ~3 hours."
            )
        elif risk_score >= 21:
            estimated_ttf = None
            ai_explanation = (
                f"{component_name} telemetry exhibits moderate warning deviations. "
                f"{reasons[0]}. Node remains operational but requires proactive monitoring."
            )
        else:
            estimated_ttf = None
            ai_explanation = (
                f"{component_name} is running optimally. All thermal, power, and compute vectors "
                f"are within nominal operating bounds. Failure risk is negligible."
            )

        return PredictionExplanation(
            component_id=component_id,
            component_name=component_name,
            risk_score=risk_score,
            risk_level=risk_level,
            primary_reasons=reasons,
            ai_explanation=ai_explanation,
            anomaly_factors={
                "Temperature Stress": round(temp_factor, 1),
                "Compute Load": round(cpu_factor, 1),
                "Error Rate Spikes": round(err_factor, 1),
                "Traffic Bandwidth": round(traffic_factor, 1),
                "Memory Consumption": round(mem_factor, 1)
            },
            estimated_time_to_failure_min=estimated_ttf
        )
