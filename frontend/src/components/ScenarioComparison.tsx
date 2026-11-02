import React from 'react';
import { 
  ListOrdered, CheckCircle2, AlertTriangle, 
  AlertCircle, ShieldCheck, ArrowRight, Sparkles 
} from 'lucide-react';
import { ScenarioOption } from '../types';

interface ScenarioComparisonProps {
  options?: ScenarioOption[];
  onSelectAction?: (actionId: string) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  options,
  onSelectAction
}) => {
  const defaultOptions: ScenarioOption[] = [
    {
      id: "OPT-A",
      title: "Option A: Do Nothing (Unmitigated)",
      description: "Allow Server A to crash ungracefully under thermal and core CPU overload without proactive traffic redirection.",
      risk_level: "High",
      risk_score: 89.0,
      expected_downtime: "15 – 45 minutes unmanaged outage",
      capacity_overhead: "100% loss of App Node 01 capacity; cascading 504 errors on Load Balancer",
      is_safest: false,
      action_type: "do_nothing"
    },
    {
      id: "OPT-B",
      title: "Option B: Shift All Traffic to Server B",
      description: "Re-route 100% of Server A ingress traffic solely to Server B without involving Server C.",
      risk_level: "Warning",
      risk_score: 68.0,
      expected_downtime: "< 1 minute",
      capacity_overhead: "Server B load spikes to 98% (High risk of secondary thermal trip)",
      is_safest: false,
      action_type: "shift_server_b"
    },
    {
      id: "OPT-C",
      title: "Option C: Dual Balanced Distribution (Server B + Server C)",
      description: "Autonomously re-partition ingress upstream weights across Server B (50%) and Server C (50%).",
      risk_level: "Safe",
      risk_score: 18.0,
      expected_downtime: "0 seconds (Hitless transition)",
      capacity_overhead: "Server B at 82%, Server C at 79% (Both safely below 85% threshold)",
      is_safest: true,
      action_type: "distribute_balanced"
    }
  ];

  const displayOptions = options && options.length > 0 ? options : defaultOptions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-twin-surface to-slate-900 border border-twin-border shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ListOrdered className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Scenario Action Comparison Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Compare operational mitigation strategies for "Server A Failure" and highlight the optimal response
                </p>
              </div>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
            Resilience Optimization Engine
          </span>
        </div>
      </div>

      {/* Comparison Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayOptions.map((opt) => {
          return (
            <div
              key={opt.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative ${
                opt.is_safest
                  ? 'bg-gradient-to-b from-emerald-950/40 via-twin-card to-slate-900 border-emerald-500/60 ring-2 ring-emerald-500/40 glow-box-emerald'
                  : 'bg-twin-card border-twin-border hover:border-slate-500'
              }`}
            >
              {/* Safest Option Callout Ribbon */}
              {opt.is_safest && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px] shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Safest Recommended Action</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-twin-border/60 pb-3">
                  <h3 className="text-base font-bold text-white">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {opt.description}
                  </p>
                </div>

                {/* Quantitative Comparison Metrics */}
                <div className="space-y-3 font-mono text-xs">
                  {/* Risk Score */}
                  <div className="p-3 rounded-xl bg-twin-surface border border-twin-border flex items-center justify-between">
                    <span className="text-slate-400">Calculated Risk:</span>
                    <div className="text-right">
                      <span className={`font-bold text-sm ${
                        opt.risk_score > 75 ? 'text-rose-400' : (opt.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')
                      }`}>
                        {opt.risk_score}%
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1.5 uppercase">({opt.risk_level})</span>
                    </div>
                  </div>

                  {/* Downtime */}
                  <div className="p-3 rounded-xl bg-twin-surface border border-twin-border">
                    <span className="text-slate-400 block text-[11px]">Expected Downtime:</span>
                    <span className={`font-bold mt-0.5 block ${opt.is_safest ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {opt.expected_downtime}
                    </span>
                  </div>

                  {/* Capacity Impact */}
                  <div className="p-3 rounded-xl bg-twin-surface border border-twin-border">
                    <span className="text-slate-400 block text-[11px]">Cluster Headroom & Load:</span>
                    <span className="text-slate-300 mt-0.5 block text-[11px] leading-snug">
                      {opt.capacity_overhead}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-twin-border/60">
                <button
                  onClick={() => onSelectAction && onSelectAction(opt.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    opt.is_safest
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-twin-surface hover:bg-twin-surfaceLight text-slate-300 border border-twin-border'
                  }`}
                >
                  <span>{opt.is_safest ? 'Execute Optimal Failover' : 'Simulate Strategy'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
