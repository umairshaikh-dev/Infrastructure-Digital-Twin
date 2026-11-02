"""
Predictive Failure Detection Engine.

Calculates Failure Risk Score (0-100), determines risk classification,
breaks down multi-metric anomaly factors, and provides transparent
prediction intelligence.

This is a deterministic rule-based forecasting prototype, not a trained
machine-learning model.
"""

from typing import Dict, List, Any
from models import PredictionExplanation


class PredictiveFailureEngine:
    """
    Transparent Rule-Based Predictive Anomaly Engine.

    Evaluates telemetry metrics against operational baselines and generates:
    - Current failure risk
    - Multi-horizon prediction
    - Prediction confidence
    - Failure trajectory
    - Root cause
    - Recommended mitigation
    """

    # Baselines for healthy enterprise infrastructure
    THRESHOLDS = {
        "cpu": {
            "normal_max": 65.0,
            "warning": 75.0,
            "critical": 85.0
        },
        "temperature": {
            "normal_max": 58.0,
            "warning": 68.0,
            "critical": 72.0
        },
        "error_rate": {
            "normal_max": 0.8,
            "warning": 2.0,
            "critical": 4.0
        },
        "traffic": {
            "normal_max": 60.0,
            "warning": 80.0,
            "critical": 90.0
        },
        "memory": {
            "normal_max": 70.0,
            "warning": 80.0,
            "critical": 90.0
        },
        "vibration": {
            "normal_max": 0.6,
            "warning": 1.2,
            "critical": 1.8
        },
        "power": {
            "normal_max": 450.0,
            "warning": 600.0,
            "critical": 750.0
        },
    }

    # Forecast multipliers based on current risk.
    PREDICTION_HORIZONS = {
        "5min": 0.55,
        "15min": 0.72,
        "30min": 0.86,
        "60min": 1.00,
    }

    @staticmethod
    def calculate_prediction_timeline(risk_score: float) -> Dict[str, float]:
        """
        Estimate near-term failure risk across multiple time horizons.

        This is a deterministic forecasting layer built on the current
        rule-based risk score, not a trained ML model.
        """

        predictions = {}

        for horizon, multiplier in PredictiveFailureEngine.PREDICTION_HORIZONS.items():
            value = risk_score * multiplier

            predictions[horizon] = round(
                min(99.0, max(0.0, value)),
                1
            )

        return predictions

    @staticmethod
    def determine_trajectory(
        risk_score: float,
        cpu: float,
        temperature: float,
        error_rate: float
    ) -> str:
        """Determine the current infrastructure degradation trajectory."""

        stress_count = sum([
            cpu > 75,
            temperature > 68,
            error_rate > 1.5,
        ])

        if risk_score >= 76 or stress_count >= 3:
            return "Critical"

        if risk_score >= 51 or stress_count >= 2:
            return "Degrading"

        if risk_score >= 21 or stress_count >= 1:
            return "Watch"

        return "Stable"

    @staticmethod
    def determine_root_cause(
        cpu: float,
        temperature: float,
        error_rate: float,
        traffic: float,
        memory: float
    ) -> str:
        """Identify the dominant telemetry factor driving the risk."""

        factors = {
            "CPU Saturation": cpu / 85.0,
            "Thermal Stress": temperature / 72.0,
            "Network Error Surge": error_rate / 4.0,
            "Traffic Saturation": traffic / 90.0,
            "Memory Pressure": memory / 90.0,
        }

        root_cause = max(factors, key=factors.get)

        if factors[root_cause] < 0.65:
            return "No significant anomaly detected"

        return root_cause

    @staticmethod
    def calculate_prediction_confidence(
        cpu: float,
        temperature: float,
        error_rate: float,
        traffic: float,
        memory: float
    ) -> float:
        """
        Estimate prediction confidence from the strength and agreement
        of multiple telemetry signals.
        """

        active_signals = sum([
            cpu > 65,
            temperature > 58,
            error_rate > 0.8,
            traffic > 60,
            memory > 70,
        ])

        # Base confidence from telemetry signal strength.
        confidence = 72.0 + (active_signals * 4.0)

        # Strong multi-sensor agreement increases confidence.
        if active_signals >= 4:
            confidence += 8.0

        return round(
            min(98.0, max(70.0, confidence)),
            1
        )

    @staticmethod
    def determine_recommended_action(
        risk_score: float,
        root_cause: str
    ) -> str:
        """Generate a mitigation recommendation from risk and root cause."""

        if risk_score >= 76:
            if root_cause == "CPU Saturation":
                return "Redistribute traffic across healthy server nodes immediately."

            if root_cause == "Thermal Stress":
                return "Reduce node load and initiate cooling mitigation immediately."

            if root_cause == "Network Error Surge":
                return "Inspect network path and redirect traffic through healthy routes."

            if root_cause == "Traffic Saturation":
                return "Redistribute ingress traffic and activate available capacity."

            if root_cause == "Memory Pressure":
                return "Reduce workload and initiate memory recovery or failover."

            return "Initiate immediate mitigation and inspect dependent components."

        if risk_score >= 51:
            return "Apply proactive load balancing and closely monitor telemetry."

        if risk_score >= 21:
            return "Continue monitoring and prepare proactive mitigation."

        return "Continue normal monitoring."

    @staticmethod
    def calculate_component_risk(
        component_id: str,
        component_name: str,
        metrics: Dict[str, Any]
    ) -> PredictionExplanation:
        """
        Calculate current failure risk and generate prediction intelligence.
        """

        cpu = float(metrics.get("cpu", 50.0))
        temp = float(metrics.get("temperature", 55.0))
        err = float(metrics.get("error_rate", 0.2))
        traffic = float(metrics.get("traffic", 45.0))
        mem = float(metrics.get("memory", 50.0))
        vib = float(metrics.get("vibration", 0.4))
        power = float(metrics.get("power", 400.0))

        # ---------------------------------------------------------
        # 1. CPU Factor
        # ---------------------------------------------------------
        if cpu <= 65:
            cpu_factor = (cpu / 65.0) * 20.0

        elif cpu <= 75:
            cpu_factor = (
                20.0 +
                ((cpu - 65.0) / 10.0) * 30.0
            )

        elif cpu <= 85:
            cpu_factor = (
                50.0 +
                ((cpu - 75.0) / 10.0) * 35.0
            )

        else:
            cpu_factor = (
                85.0 +
                min(
                    15.0,
                    ((cpu - 85.0) / 15.0) * 15.0
                )
            )

        # ---------------------------------------------------------
        # 2. Temperature Factor
        # ---------------------------------------------------------
        if temp <= 58:
            temp_factor = (temp / 58.0) * 15.0

        elif temp <= 68:
            temp_factor = (
                15.0 +
                ((temp - 58.0) / 10.0) * 35.0
            )

        elif temp <= 72:
            temp_factor = (
                50.0 +
                ((temp - 68.0) / 4.0) * 30.0
            )

        else:
            temp_factor = (
                80.0 +
                min(
                    20.0,
                    ((temp - 72.0) / 15.0) * 20.0
                )
            )

        # ---------------------------------------------------------
        # 3. Error Rate Factor
        # ---------------------------------------------------------
        if err <= 0.8:
            err_factor = (err / 0.8) * 15.0

        elif err <= 2.0:
            err_factor = (
                15.0 +
                ((err - 0.8) / 1.2) * 35.0
            )

        elif err <= 4.0:
            err_factor = (
                50.0 +
                ((err - 2.0) / 2.0) * 35.0
            )

        else:
            err_factor = (
                85.0 +
                min(
                    15.0,
                    ((err - 4.0) / 4.0) * 15.0
                )
            )

        # ---------------------------------------------------------
        # 4. Traffic Factor
        # ---------------------------------------------------------
        traffic_factor = min(
            100.0,
            max(
                0.0,
                traffic
            )
        )

        # ---------------------------------------------------------
        # 5. Memory Factor
        # ---------------------------------------------------------
        mem_factor = min(
            100.0,
            max(
                0.0,
                mem
            )
        )

        # ---------------------------------------------------------
        # Weighted Composite Risk
        # ---------------------------------------------------------
        risk_score = (
            0.28 * temp_factor +
            0.27 * cpu_factor +
            0.22 * err_factor +
            0.13 * traffic_factor +
            0.10 * mem_factor
        )

        risk_score = round(
            min(
                99.0,
                max(
                    4.0,
                    risk_score
                )
            ),
            1
        )

        # ---------------------------------------------------------
        # Risk Classification
        # ---------------------------------------------------------
        if risk_score <= 20:
            risk_level = "Safe"

        elif risk_score <= 50:
            risk_level = "Warning"

        elif risk_score <= 75:
            risk_level = "High Risk"

        else:
            risk_level = "Critical"

        # ---------------------------------------------------------
        # Primary Reasons
        # ---------------------------------------------------------
        reasons: List[str] = []

        if cpu > 75:
            reasons.append(
                f"CPU utilization sustained at {cpu:.1f}% "
                f"(exceeds 75% threshold)"
            )

        if temp > 68:
            reasons.append(
                f"Core operating temperature reached {temp:.1f}°C "
                f"(thermal limit 72°C)"
            )

        if err > 1.5:
            reasons.append(
                f"Network error rate surged to {err:.1f}% "
                f"(baseline < 0.8%)"
            )

        if traffic > 80:
            reasons.append(
                f"Ingress network traffic saturated at "
                f"{traffic:.1f}% bandwidth"
            )

        if mem > 80:
            reasons.append(
                f"Memory pressure elevated to {mem:.1f}%"
            )

        if vib > 1.0:
            reasons.append(
                f"Fan chassis vibration abnormal "
                f"({vib:.2f} mm/s)"
            )

        if power > 600:
            reasons.append(
                f"Power consumption elevated to {power:.1f} W"
            )

        if not reasons:
            reasons.append(
                "All operational telemetry within standard "
                "Tier-III tolerance envelopes."
            )

        # ---------------------------------------------------------
        # Prediction Intelligence
        # ---------------------------------------------------------
        prediction_timeline = (
            PredictiveFailureEngine.calculate_prediction_timeline(
                risk_score
            )
        )

        trajectory = (
            PredictiveFailureEngine.determine_trajectory(
                risk_score,
                cpu,
                temp,
                err
            )
        )

        root_cause = (
            PredictiveFailureEngine.determine_root_cause(
                cpu,
                temp,
                err,
                traffic,
                mem
            )
        )

        confidence = (
            PredictiveFailureEngine.calculate_prediction_confidence(
                cpu,
                temp,
                err,
                traffic,
                mem
            )
        )

        recommended_action = (
            PredictiveFailureEngine.determine_recommended_action(
                risk_score,
                root_cause
            )
        )

        # ---------------------------------------------------------
        # Estimated Time To Failure
        # ---------------------------------------------------------
        if risk_score >= 76:
            estimated_ttf = max(
                15,
                int(
                    120 -
                    (risk_score - 75) * 4
                )
            )

        elif risk_score >= 51:
            estimated_ttf = 180

        else:
            estimated_ttf = None

        # ---------------------------------------------------------
        # Transparent Explanation
        # ---------------------------------------------------------
        if risk_score >= 76:

            ai_explanation = (
                f"{component_name} is exhibiting critical telemetry "
                f"degradation. Primary root cause: {root_cause}. "
                f"Current failure risk is {risk_score}%. "
                f"Prediction confidence is {confidence}%. "
                f"The projected trajectory is {trajectory}. "
                f"Estimated time to failure without mitigation is "
                f"approximately {estimated_ttf} minutes."
            )

        elif risk_score >= 51:

            ai_explanation = (
                f"{component_name} telemetry shows elevated stress "
                f"patterns. Primary driver: {root_cause}. "
                f"Current failure risk is {risk_score}% with "
                f"{confidence}% prediction confidence. "
                f"The system trajectory is {trajectory}. "
                f"Proactive mitigation is recommended."
            )

        elif risk_score >= 21:

            ai_explanation = (
                f"{component_name} telemetry exhibits moderate "
                f"deviations. Primary factor: {root_cause}. "
                f"Current risk is {risk_score}% with "
                f"{confidence}% prediction confidence. "
                f"Node remains operational but requires monitoring."
            )

        else:

            ai_explanation = (
                f"{component_name} is operating within nominal "
                f"telemetry ranges. Current failure risk is "
                f"{risk_score}% and prediction confidence is "
                f"{confidence}%. No significant degradation detected."
            )

        # ---------------------------------------------------------
        # Final Prediction Response
        # ---------------------------------------------------------
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

            estimated_time_to_failure_min=estimated_ttf,

            prediction_5min=prediction_timeline["5min"],
            prediction_15min=prediction_timeline["15min"],
            prediction_30min=prediction_timeline["30min"],
            prediction_60min=prediction_timeline["60min"],

            prediction_confidence=confidence,
            failure_trajectory=trajectory,
            root_cause=root_cause,
            recommended_action=recommended_action
        )