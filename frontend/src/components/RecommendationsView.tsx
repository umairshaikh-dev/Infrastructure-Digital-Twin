import React from 'react';
import { 
  Sparkles, AlertTriangle, AlertCircle, 
  CheckCircle2, ArrowRight, Play, ShieldCheck, 
  Layers, Thermometer, Database, Cpu 
} from 'lucide-react';
import { Recommendation } from '../types';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  onSimulateAction: (actionCode: string, componentId: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onSimulateAction
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-twin-surface to-slate-900 border border-twin-border shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Autonomous Resilience Recommendation Engine
                </h2>
                <p className="text-xs text-slate-400">
                  AI-driven remediation actions formulated from real-time telemetry anomalies and virtual twin headroom
                </p>
              </div>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {recommendations.length} Active Prescriptions
          </span>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isCritical = rec.severity === 'critical';
          const isWarning = rec.severity === 'warning';

          return (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl border transition-all bg-twin-card ${
                isCritical 
                  ? 'border-rose-500/60 glow-box-rose' 
                  : isWarning 
                  ? 'border-amber-500/50 glow-box-amber' 
                  : 'border-twin-border'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-twin-surface px-2.5 py-1 rounded border border-twin-border">
                    {rec.id}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                      <span>{rec.component_name} Remediation Prescription</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Component Target: <strong className="text-slate-200">{rec.component_name}</strong>
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                  isCritical 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {rec.severity} Priority
                </span>
              </div>

              {/* Problem Diagnostic & Prescribed Action */}
              <div className="space-y-3 font-sans text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-twin-surface border border-twin-border">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Telemetry Trigger / Issue:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-mono">
                    {rec.issue}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Recommended Action:
                    </span>
                    <p className="text-emerald-300 font-semibold leading-relaxed">
                      "{rec.recommended_action}"
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Expected System Benefit:
                    </span>
                    <p className="text-cyan-200 leading-relaxed">
                      "{rec.expected_benefit}"
                    </p>
                  </div>
                </div>
              </div>

              {/* One-Click Action Footer */}
              <div className="mt-4 pt-3 border-t border-twin-border/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Simulate inside virtual twin before applying to physical hardware.
                </span>
                <button
                  onClick={() => onSimulateAction(rec.action_code, rec.component_id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md transition-all cursor-pointer border border-cyan-400/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate Recommendation in Digital Twin</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
