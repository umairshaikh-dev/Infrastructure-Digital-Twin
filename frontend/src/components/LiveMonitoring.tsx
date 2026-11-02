import React, { useState } from 'react';
import { 
  Server, LayoutGrid, List, Search, Filter, 
  Activity, Zap, AlertCircle, CheckCircle2, AlertTriangle, 
  Thermometer, Cpu, Play, ArrowRight 
} from 'lucide-react';
import { ComponentNode, ComponentStatus } from '../types';

interface LiveMonitoringProps {
  components: Record<string, ComponentNode>;
  onSelectComponent: (id: string) => void;
  onSimulateComponent: (id: string) => void;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  components,
  onSelectComponent,
  onSimulateComponent
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const compList = Object.values(components);

  // Filtered components
  const filtered = compList.filter(comp => {
    const matchesStatus = filterStatus === 'all' || comp.status === filterStatus;
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.rack.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ComponentStatus) => {
    switch (status) {
      case 'healthy':
        return { text: 'Healthy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'warning':
        return { text: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'critical':
        return { text: 'Critical', color: 'bg-red-50 text-red-700 border-red-300 animate-pulse' };
      case 'offline':
        return { text: 'Offline', color: 'bg-slate-100 text-slate-500 border-slate-300' };
      default:
        return { text: 'Normal', color: 'bg-slate-50 text-slate-500 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-card">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search components by name, role, or rack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Status Filters & View Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            {['all', 'critical', 'warning', 'healthy'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded font-medium capitalize transition-colors ${
                  filterStatus === st 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => {
            const t = comp.telemetry;
            const badge = getStatusBadge(comp.status);

            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border transition-all duration-200 bg-white shadow-card hover:shadow-card-hover ${
                  comp.status === 'critical'
                    ? 'border-red-300'
                    : comp.status === 'warning'
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 tracking-wide">
                        {comp.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {comp.role} • {comp.rack}
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>

                {/* Main Metrics Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-500 text-[10px] block">CPU Usage</span>
                    <span className={`font-bold ${t.cpu > 80 ? 'text-red-600' : 'text-slate-700'}`}>
                      {t.cpu}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Memory</span>
                    <span className="text-slate-700 font-bold">{t.memory}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Core Temp</span>
                    <span className={`font-bold ${t.temperature > 70 ? 'text-red-600' : 'text-slate-700'}`}>
                      {t.temperature}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Traffic</span>
                    <span className="text-slate-700 font-bold">{t.traffic}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Error Rate</span>
                    <span className={`font-bold ${t.error_rate > 2.0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {t.error_rate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Power Draw</span>
                    <span className="text-amber-600 font-bold">{t.power} W</span>
                  </div>
                </div>

                {/* Health & Failure Probability Bars */}
                <div className="space-y-1.5 text-xs font-mono mb-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-500">Health Score:</span>
                    <span className="font-bold text-blue-600">{t.health_score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" 
                      style={{ width: `${t.health_score}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span className="text-[11px] text-slate-500">Failure Probability:</span>
                    <span className={`font-bold ${t.failure_probability > 70 ? 'text-red-600' : (t.failure_probability > 30 ? 'text-amber-600' : 'text-emerald-600')}`}>
                      {t.failure_probability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${t.failure_probability > 70 ? 'bg-red-500' : (t.failure_probability > 30 ? 'bg-amber-500' : 'bg-emerald-500')}`} 
                      style={{ width: `${t.failure_probability}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectComponent(comp.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect Node</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSimulateComponent(comp.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
                  >
                    <Play className="w-3 h-3 text-blue-500 fill-current" />
                    <span>Simulate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto shadow-card">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Component Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">CPU</th>
                <th className="p-3">Memory</th>
                <th className="p-3">Temp</th>
                <th className="p-3">Traffic</th>
                <th className="p-3">Error Rate</th>
                <th className="p-3">Power</th>
                <th className="p-3">Health</th>
                <th className="p-3">Fail Prob</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map((comp) => {
                const t = comp.telemetry;
                const badge = getStatusBadge(comp.status);

                return (
                  <tr 
                    key={comp.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelectComponent(comp.id)}
                  >
                    <td className="p-3 font-semibold text-slate-800">
                      <div>{comp.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{comp.role}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.color}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className={`p-3 font-bold ${t.cpu > 80 ? 'text-red-600' : 'text-slate-700'}`}>
                      {t.cpu}%
                    </td>
                    <td className="p-3">{t.memory}%</td>
                    <td className={`p-3 ${t.temperature > 70 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                      {t.temperature}°C
                    </td>
                    <td className="p-3">{t.traffic}%</td>
                    <td className={`p-3 ${t.error_rate > 2.0 ? 'text-red-600 font-bold' : 'text-emerald-600'}`}>
                      {t.error_rate}%
                    </td>
                    <td className="p-3 text-amber-600">{t.power}W</td>
                    <td className="p-3 text-blue-600 font-bold">{t.health_score}/100</td>
                    <td className={`p-3 font-bold ${t.failure_probability > 70 ? 'text-red-600' : 'text-slate-700'}`}>
                      {t.failure_probability}%
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSimulateComponent(comp.id)}
                        className="px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-[11px]"
                      >
                        Simulate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
