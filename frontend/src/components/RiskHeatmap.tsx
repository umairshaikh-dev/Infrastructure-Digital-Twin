import React from 'react';
import { 
  ShieldAlert, AlertCircle, AlertTriangle, 
  CheckCircle2, Server, Database, Network, Wind, Zap, Play 
} from 'lucide-react';
import { ComponentNode } from '../types';

interface RiskHeatmapProps {
  components: Record<string, ComponentNode>;
  onSelectComponent: (id: string) => void;
  onSimulateComponent: (id: string) => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  components,
  onSelectComponent,
  onSimulateComponent
}) => {
  const compList = Object.values(components);

  // Group by risk tier
  const criticalNodes = compList.filter(c => c.telemetry.failure_probability >= 76);
  const highRiskNodes = compList.filter(c => c.telemetry.failure_probability >= 51 && c.telemetry.failure_probability < 76);
  const warningNodes = compList.filter(c => c.telemetry.failure_probability >= 21 && c.telemetry.failure_probability < 51);
  const safeNodes = compList.filter(c => c.telemetry.failure_probability < 21);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-wide">
                  Infrastructure Failure Risk Heatmap
                </h2>
                <p className="text-xs text-slate-500">
                  Instant visual triage of all infrastructure components grouped by predictive risk tier
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-red-600">{criticalNodes.length} Critical</span> • 
            <span className="text-amber-600">{warningNodes.length} Warning</span> • 
            <span className="text-emerald-600">{safeNodes.length} Safe</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Tiers */}
      <div className="space-y-5">
        {/* Tier 1: Critical (76 - 100%) */}
        <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 animate-pulse" />
              <span>Critical Risk Tier (76% – 100% Failure Probability)</span>
            </div>
            <span className="text-[11px] font-mono text-red-600 font-semibold">Immediate Action Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {criticalNodes.length > 0 ? (
              criticalNodes.map(comp => (
                <div
                  key={comp.id}
                  onClick={() => onSelectComponent(comp.id)}
                  className="p-4 rounded-xl bg-white border border-red-300 hover:border-red-400 cursor-pointer transition-all shadow-card flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{comp.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{comp.role}</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-red-600">
                      {comp.telemetry.failure_probability}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-red-200 flex items-center justify-between text-xs">
                    <span className="text-red-600 text-[11px]">CPU: {comp.telemetry.cpu}% • Temp: {comp.telemetry.temperature}°C</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSimulateComponent(comp.id);
                      }}
                      className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[10px] hover:bg-red-100"
                    >
                      Simulate
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-xs text-slate-500 font-mono p-3 bg-white rounded-lg border border-slate-200">
                No components currently in Critical Risk tier.
              </div>
            )}
          </div>
        </div>

        {/* Tier 2: Warning & High Risk (21 - 75%) */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Warning & High Risk Tier (21% – 75% Failure Probability)</span>
            </div>
            <span className="text-[11px] font-mono text-amber-600 font-semibold">Proactive Monitoring Advised</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...highRiskNodes, ...warningNodes].length > 0 ? (
              [...highRiskNodes, ...warningNodes].map(comp => (
                <div
                  key={comp.id}
                  onClick={() => onSelectComponent(comp.id)}
                  className="p-4 rounded-xl bg-white border border-amber-200 hover:border-amber-300 cursor-pointer transition-all shadow-card flex flex-col justify-between"
                >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{comp.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{comp.role}</p>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-600">
                    {comp.telemetry.failure_probability}%
                  </span>
                </div>
                <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                  <span className="text-amber-600 text-[11px]">CPU: {comp.telemetry.cpu}% • Temp: {comp.telemetry.temperature}°C</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSimulateComponent(comp.id);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[10px] hover:bg-amber-100"
                  >
                    Simulate
                  </button>
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-3 text-xs text-slate-500 font-mono p-3 bg-white rounded-lg border border-slate-200">
                No components currently in Warning tier.
              </div>
            )}
          </div>
        </div>

        {/* Tier 3: Safe (0 - 20%) */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Safe & Nominal Tier (0% – 20% Failure Probability)</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">{safeNodes.length} Nodes Operating Normally</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {safeNodes.map(comp => (
              <div
                key={comp.id}
                onClick={() => onSelectComponent(comp.id)}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all shadow-card"
              >
              <div className="flex justify-between items-start">
                <div className="truncate">
                  <h5 className="text-xs font-bold text-slate-800 truncate">{comp.name}</h5>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{comp.role}</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {comp.telemetry.failure_probability}%
                </span>
              </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
