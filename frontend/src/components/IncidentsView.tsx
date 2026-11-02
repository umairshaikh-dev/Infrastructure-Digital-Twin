import React, { useState } from 'react';
import { 
  AlertTriangle, AlertCircle, CheckCircle2, 
  Clock, ShieldAlert, Play, ArrowRight, Filter 
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  onSimulateComponent?: (componentId: string) => void;
  onSelectComponent?: (componentId: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSimulateComponent,
  onSelectComponent
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = incidents.filter(inc => {
    if (filterSeverity === 'all') return true;
    return inc.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return { text: 'CRITICAL', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' };
      case 'warning':
        return { text: 'WARNING', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'info':
        return { text: 'INFO', color: 'bg-blue-500/20 text-cyan-300 border-blue-500/40' };
      default:
        return { text: severity.toUpperCase(), color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-twin-surface to-slate-900 border border-twin-border shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Infrastructure Incident Management
                </h2>
                <p className="text-xs text-slate-400">
                  Telemetry trigger logs, active alarms, and autonomous mitigation tracking
                </p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center bg-twin-surface border border-twin-border rounded-lg p-0.5 text-xs">
            {['all', 'critical', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded font-medium capitalize transition-colors ${
                  filterSeverity === sev ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="space-y-3">
        {filtered.map((inc) => {
          const badge = getSeverityBadge(inc.severity);

          return (
            <div
              key={inc.id}
              className={`p-5 rounded-2xl border transition-all bg-twin-card ${
                inc.severity === 'critical'
                  ? 'border-rose-500/60 glow-box-rose'
                  : 'border-twin-border hover:border-slate-500'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-twin-surface px-2.5 py-1 rounded border border-twin-border">
                    {inc.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {inc.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Component: <strong className="text-slate-200">{inc.component_name}</strong> • Detected: {inc.detected_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.text}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Status: {inc.status}
                  </span>
                </div>
              </div>

              {/* Trigger & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-twin-border/50">
                <div className="p-3 rounded-lg bg-twin-surface border border-twin-border/70">
                  <span className="text-slate-400 block text-[11px]">Telemetry Root-Cause Trigger:</span>
                  <span className="text-rose-300 font-semibold mt-0.5 block">{inc.trigger}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Estimated Failure Probability: <strong className="text-rose-400">{inc.failure_probability}%</strong>
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-twin-surface border border-twin-border/70">
                  <span className="text-slate-400 block text-[11px]">Autonomous Recommended Mitigation:</span>
                  <span className="text-emerald-300 mt-0.5 block">{inc.recommended_action}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 flex items-center justify-end gap-2">
                {onSelectComponent && (
                  <button
                    onClick={() => onSelectComponent(inc.component_id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-twin-surface hover:bg-twin-surfaceLight border border-twin-border transition-colors"
                  >
                    Inspect Node
                  </button>
                )}
                {onSimulateComponent && (
                  <button
                    onClick={() => onSimulateComponent(inc.component_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 transition-colors shadow cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Incident in Twin</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
