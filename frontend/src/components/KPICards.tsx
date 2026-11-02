import React from 'react';
import { 
  Server, ShieldCheck, AlertCircle, AlertTriangle, 
  Activity, Zap, Clock, ShieldAlert, CheckCircle2,
  Wifi
} from 'lucide-react';
import { SystemSummary } from '../types';

interface KPICardsProps {
  summary: SystemSummary;
  onSelectFilter?: (status: string) => void;
  backendOnline?: boolean;
  isPaused?: boolean;
  lastTelemetrySync?: Date | null;
}

export const KPICards: React.FC<KPICardsProps> = ({
  summary,
  onSelectFilter,
  backendOnline = false,
  isPaused = false,
  lastTelemetrySync
}) => {
  const resilience = summary.resilience;

  const getHealthBadge = (health: number) => {
    if (health >= 90) {
      return {
        label: 'Optimal',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }

    if (health >= 80) {
      return {
        label: 'Healthy',
        color: 'text-blue-700 bg-blue-50 border-blue-200'
      };
    }

    if (health >= 60) {
      return {
        label: 'Degraded',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }

    return {
      label: 'Critical Risk',
      color: 'text-red-700 bg-red-50 border-red-200'
    };
  };

  const healthBadge = getHealthBadge(summary.overall_health);

  return (
    <>
      {/* Live Backend Status Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-panel">
        <div className="flex items-center gap-2">
          {isPaused ? (
            <>
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-amber-700">
                TELEMETRY PAUSED
              </span>
            </>
          ) : backendOnline ? (
            <>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                LIVE BACKEND CONNECTED
              </span>
            </>
          ) : (
            <>
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-red-600">
                BACKEND OFFLINE
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
          <span>
            Telemetry:
            <span className="ml-1 text-blue-600">
              {lastTelemetrySync
                ? lastTelemetrySync.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                : 'Waiting...'}
            </span>
          </span>

          <span>
            Mode:
            <span className="ml-1 text-slate-700">
              {isPaused
                ? 'PAUSED'
                : backendOnline
                  ? 'LIVE'
                  : 'LOCAL FALLBACK'}
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-6">

        {/* Operational Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50/80 via-white to-slate-50/80 border border-slate-200 text-xs text-slate-600 shadow-panel">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>

            <span className="font-semibold text-slate-800">
              Continuous Twin Loop:
            </span>

            <span className="font-mono text-blue-600">
              Monitor → Predict → Simulate → Analyze → Optimize → Respond
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>
              Target Environment:{' '}
              <strong className="text-slate-700">
                Enterprise Data Center (Tier-III)
              </strong>
            </span>

            <span className="hidden md:inline">•</span>

            <span className="hidden md:inline">
              Telemetry Mode:{' '}
              <strong className="text-amber-600">
                Simulated Telemetry Generator
              </strong>
            </span>
          </div>
        </div>

        {/* Main KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

          {/* Total Components */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 transition-all relative overflow-hidden group shadow-card hover:shadow-card-hover">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Total Components</span>
              <Server className="w-4 h-4 text-blue-500" />
            </div>

            <div className="text-2xl font-bold text-slate-800 font-mono">
              {summary.total_components}
            </div>

            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Interconnected Nodes</span>
            </div>
          </div>

          {/* Healthy Components */}
          <div
            onClick={() =>
              onSelectFilter && onSelectFilter('healthy')
            }
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-3.5 transition-all cursor-pointer relative overflow-hidden group shadow-card hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Healthy Components</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {summary.healthy_components}
            </div>

            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>

              <span>
                {summary.total_components > 0
                  ? Math.round(
                      (summary.healthy_components /
                        summary.total_components) *
                        100
                    )
                  : 0}
                % Nominal Bounds
              </span>
            </div>
          </div>

          {/* Warning Components */}
          <div
            onClick={() =>
              onSelectFilter && onSelectFilter('warning')
            }
            className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-3.5 transition-all cursor-pointer relative overflow-hidden group shadow-card hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Warning Components</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>

            <div className="text-2xl font-bold text-amber-600 font-mono">
              {summary.warning_components}
            </div>

            <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Cooling Unit (Delta T)</span>
            </div>
          </div>

          {/* Critical Components */}
          <div
            onClick={() =>
              onSelectFilter && onSelectFilter('critical')
            }
            className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-3.5 transition-all cursor-pointer relative overflow-hidden group shadow-card hover:shadow-card-hover shadow-card-rose"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Critical Components</span>
              <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            </div>

            <div className="text-2xl font-bold text-red-600 font-mono">
              {summary.critical_components}
            </div>

            <div className="text-[11px] text-red-600 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>Server A (Thermal/Load)</span>
            </div>
          </div>

          {/* Overall Health */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 transition-all relative overflow-hidden shadow-card">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Overall Infrastructure Health</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600 font-mono">
                {summary.overall_health}%
              </span>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${healthBadge.color}`}
              >
                {healthBadge.label}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${summary.overall_health}%`
                }}
              ></div>
            </div>
          </div>

          {/* Resilience Score */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 transition-all relative overflow-hidden shadow-card shadow-card-blue">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Resilience Score</span>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-600 font-mono">
                {resilience
                  ? resilience.overall_resilience_score
                  : 88}
                /100
              </span>

              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {resilience?.status_label || 'Healthy'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Redundancy: {resilience?.redundancy_score || 95}% • Failover: Ready
            </div>
          </div>
        </div>

        {/* Secondary Quick Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Current Load */}
          <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between shadow-panel">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-500">
                Current System Load:
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-amber-600">
              {summary.current_system_load}%
            </span>
          </div>

          {/* Predicted Failures */}
          <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between shadow-panel">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />

              <span className="text-xs text-slate-500">
                Predicted Failures:
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-red-600">
              {summary.predicted_failures} Node (Server A)
            </span>
          </div>

          {/* Active Incidents */}
          <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between shadow-panel">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />

              <span className="text-xs text-slate-500">
                Active Incidents:
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-slate-700">
              {summary.critical_components + summary.warning_components} Logged
            </span>
          </div>

          {/* Last Telemetry Sync */}
          <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between shadow-panel">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />

              <span className="text-xs text-slate-500">
                Last Telemetry Sync:
              </span>
            </div>

            <span className="text-xs font-mono text-blue-600 truncate">
              {lastTelemetrySync
                ? lastTelemetrySync.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                : 'Waiting...'}
            </span>
          </div>

        </div>
      </div>
    </>
  );
};