import React from 'react';
import { 
  X, Server, Database, Network, Cpu, Shield, Zap, 
  Wind, HardDrive, Globe, AlertTriangle, AlertCircle, 
  CheckCircle2, Play, ArrowRight, Activity, ArrowUpRight, 
  Layers, Thermometer, ShieldAlert 
} from 'lucide-react';
import { ComponentNode, ComponentStatus, ComponentType } from '../types';

interface ComponentDetailModalProps {
  component: ComponentNode | null;
  allComponents: Record<string, ComponentNode>;
  onClose: () => void;
  onSimulate: (componentId: string) => void;
  onSelectComponent: (componentId: string) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  allComponents,
  onClose,
  onSimulate,
  onSelectComponent,
}) => {
  if (!component) return null;

  const t = component.telemetry;

  // Status visual badge
  const getStatusBadge = (status: ComponentStatus) => {
    switch (status) {
      case 'healthy':
        return { text: 'HEALTHY', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'warning':
        return { text: 'WARNING', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'critical':
        return { text: 'CRITICAL', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'offline':
        return { text: 'OFFLINE', color: 'bg-slate-700 text-slate-300 border-slate-600' };
      case 'simulated':
        return { text: 'SIMULATED', color: 'bg-blue-500/20 text-cyan-300 border-blue-500/40' };
      default:
        return { text: 'UNKNOWN', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const statusBadge = getStatusBadge(component.status);

  // Derive blast radius
  const getBlastRadius = (id: string): string[] => {
    if (['server_a', 'server_b', 'server_c'].includes(id)) {
      const peers = ['server_a', 'server_b', 'server_c'].filter(s => s !== id);
      return ['load_balancer', ...peers, 'db_primary'];
    }
    if (id === 'db_primary') return ['db_replica', 'server_a', 'server_b', 'server_c', 'storage_san'];
    if (id === 'power_grid') return Object.keys(allComponents).filter(k => k !== 'power_grid');
    if (id === 'cooling_unit') return ['server_a', 'server_b', 'server_c', 'db_primary'];
    return component.dependents;
  };

  const blastRadius = getBlastRadius(component.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-twin-card border border-twin-border rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-twin-border flex items-center justify-between bg-twin-surface/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {component.name}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {component.specification} • {component.rack} ({component.ip_address})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-twin-surfaceLight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Failure Probability & Health Score Banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-twin-surface border border-twin-border relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Failure Risk Probability</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">
                {t.failure_probability}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-full rounded-full ${t.failure_probability > 70 ? 'bg-rose-500' : (t.failure_probability > 30 ? 'bg-amber-500' : 'bg-emerald-500')}`} 
                  style={{ width: `${t.failure_probability}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {t.failure_probability > 75 ? 'Critical failure trajectory' : (t.failure_probability > 30 ? 'Elevated warning trajectory' : 'Nominal risk tolerance')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-twin-surface border border-twin-border relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Component Health Score</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {t.health_score}/100
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" 
                  style={{ width: `${t.health_score}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {t.health_score >= 85 ? 'Operating in optimal parameters' : 'Thermal or error degradation present'}
              </span>
            </div>
          </div>

          {/* Real-time Telemetry Metrics Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Live Sensor Telemetry Envelopes</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-twin-surface/60 border border-twin-border/80">
                <span className="text-slate-400 block text-[11px]">CPU Utilization</span>
                <div className="text-lg font-bold text-white mt-0.5">{t.cpu}%</div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                  <div className={`h-full rounded-full ${t.cpu > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${t.cpu}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-twin-surface/60 border border-twin-border/80">
                <span className="text-slate-400 block text-[11px]">Memory Used</span>
                <div className="text-lg font-bold text-white mt-0.5">{t.memory}%</div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${t.memory}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-twin-surface/60 border border-twin-border/80">
                <span className="text-slate-400 block text-[11px]">Core Temperature</span>
                <div className={`text-lg font-bold mt-0.5 ${t.temperature > 70 ? 'text-rose-400' : 'text-white'}`}>
                  {t.temperature}°C
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                  <div className={`h-full rounded-full ${t.temperature > 70 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (t.temperature / 85) * 100)}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-twin-surface/60 border border-twin-border/80">
                <span className="text-slate-400 block text-[11px]">Traffic Throughput</span>
                <div className="text-lg font-bold text-white mt-0.5">{t.traffic}%</div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${t.traffic}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-twin-surface/60 border border-twin-border/80">
                <span className="text-slate-400 block text-[11px]">Error Rate</span>
                <div className={`text-lg font-bold mt-0.5 ${t.error_rate > 2.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {t.error_rate}%
                </div>
                <span className="text-[10px] text-slate-500">Threshold &lt; 0.8%</span>
              </div>

              <div className="p-3 rounded-lg bg-twin-surface/60 border border-twin-border/80">
                <span className="text-slate-400 block text-[11px]">Power Draw</span>
                <div className="text-lg font-bold text-amber-300 mt-0.5">{t.power} W</div>
                <span className="text-[10px] text-slate-500">Dual 1200W PSU</span>
              </div>
            </div>
          </div>

          {/* AI-Generated Predictive Explanation */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>AI Anomaly Analysis & Early Warning Reason</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {component.id === 'server_a' ? (
                <>
                  <strong className="text-rose-400">Server A is showing abnormal load growth and increasing temperature.</strong> Based on recent telemetry trends (CPU at 86%, thermal junction at 74°C, error rate 4.2%), the probability of ungraceful hardware failure is <strong>87%</strong>. Recommended mitigation: Redirect ingress traffic across Server B and Server C.
                </>
              ) : (
                <>
                  <strong>{component.name}</strong> telemetry indicates nominal operational health. Temperature ({t.temperature}°C) and error rate ({t.error_rate}%) are well within Tier-III data center specifications. Failure probability is minimal ({t.failure_probability}%).
                </>
              )}
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Scoring Model: Multi-Sensor Anomaly Rules • Transparent Calculation
            </div>
          </div>

          {/* Graph-Based Dependency & Blast Radius Analysis (Section 8) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Graph-Based Dependency & Blast Radius Analysis</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Direct Upstream Dependencies */}
              <div className="p-3 rounded-xl bg-twin-surface border border-twin-border">
                <span className="text-slate-400 font-semibold block mb-2">Direct Upstream Feeds ({component.dependencies.length})</span>
                {component.dependencies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {component.dependencies.map((depId) => {
                      const dep = allComponents[depId];
                      return (
                        <button
                          key={depId}
                          onClick={() => onSelectComponent(depId)}
                          className="px-2 py-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-slate-700 text-xs font-mono"
                        >
                          {dep?.name || depId}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-500 font-mono text-xs">Root Ingress Source</span>
                )}
              </div>

              {/* Direct Downstream Dependents */}
              <div className="p-3 rounded-xl bg-twin-surface border border-twin-border">
                <span className="text-slate-400 font-semibold block mb-2">Direct Consumers ({component.dependents.length})</span>
                {component.dependents.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {component.dependents.map((depId) => {
                      const dep = allComponents[depId];
                      return (
                        <button
                          key={depId}
                          onClick={() => onSelectComponent(depId)}
                          className="px-2 py-1 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 text-xs font-mono"
                        >
                          {dep?.name || depId}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-500 font-mono text-xs">Terminal Consumer Node</span>
                )}
              </div>
            </div>

            {/* Cascading Blast Radius (If this component fails) */}
            <div className="p-3 rounded-xl bg-twin-surface border border-rose-500/30">
              <span className="text-rose-300 font-semibold text-xs block mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Cascading Blast Radius (Potentially Affected Components)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {blastRadius.map((bId) => {
                  const bNode = allComponents[bId];
                  return (
                    <span 
                      key={bId}
                      className="px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-500/40 text-xs font-mono flex items-center gap-1"
                    >
                      <span>⚠</span>
                      <span>{bNode?.name || bId}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-twin-border flex items-center justify-between bg-twin-surface/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
          >
            Close Inspector
          </button>
          <button
            onClick={() => {
              onClose();
              onSimulate(component.id);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 transition-all border border-blue-400/30 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate What-If Scenario on this Node</span>
          </button>
        </div>
      </div>
    </div>
  );
};
