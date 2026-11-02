import React, { useState } from 'react';
import { 
  Cpu, AlertTriangle, AlertCircle, CheckCircle2, 
  ShieldAlert, Activity, TrendingUp, Info, Play, 
  Layers, Thermometer, Zap, ShieldCheck 
} from 'lucide-react';
import { ComponentNode } from '../types';

interface PredictiveViewProps {
  components: Record<string, ComponentNode>;
  onSimulateComponent: (id: string) => void;
  onSelectComponent: (id: string) => void;
}

export const PredictiveView: React.FC<PredictiveViewProps> = ({
  components,
  onSimulateComponent,
  onSelectComponent
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>('server_a');

  const compList = Object.values(components);
  const activeComp = components[selectedCompId] || components['server_a'] || compList[0];

  // Derive risk level
  const getRiskDetails = (prob: number) => {
    if (prob >= 76) return { level: 'Critical', color: 'text-red-700 bg-red-50 border-red-200', badge: 'bg-red-500' };
    if (prob >= 51) return { level: 'High Risk', color: 'text-orange-700 bg-orange-50 border-orange-200', badge: 'bg-orange-500' };
    if (prob >= 21) return { level: 'Warning', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'bg-amber-500' };
    return { level: 'Safe', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500' };
  };

  const activeRisk = getRiskDetails(activeComp.telemetry.failure_probability);

  return (
    <div className="space-y-6">
      {/* Header & Transparency Notice */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-wide">
                  Predictive Failure Detection Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time multi-sensor anomaly tracking & predictive risk scoring
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Prototype Engine: Transparent Multi-Sensor Anomaly Scoring</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Component Selector & Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Component List Ranked by Risk */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Component Triage (Highest Risk First)</span>
            <span>Failure Risk</span>
          </div>
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {compList
              .sort((a, b) => b.telemetry.failure_probability - a.telemetry.failure_probability)
              .map((comp) => {
                const r = getRiskDetails(comp.telemetry.failure_probability);
                const isSelected = comp.id === selectedCompId;

                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{comp.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{comp.role}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${r.color}`}>
                          {comp.telemetry.failure_probability}%
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5 uppercase">{r.level}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Center & Right Columns: Deep Predictive Inspection for Selected Component */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-6">
            {/* Header for Active Component */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800 tracking-wide">
                    {activeComp.name}
                  </h3>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${activeRisk.color}`}>
                    {activeRisk.level} • {activeComp.telemetry.failure_probability}% Failure Risk
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {activeComp.specification} • {activeComp.rack} ({activeComp.ip_address})
                </p>
              </div>

              <button
                onClick={() => onSimulateComponent(activeComp.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Node Failure</span>
              </button>
            </div>

            {/* AI-Generated Natural Language Explanation Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 via-white to-slate-50 border border-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Autonomous Telemetry Diagnostic Explanation</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                {activeComp.id === 'server_a' ? (
                  <>
                    <strong className="text-red-600">Server A is showing abnormal load growth and increasing temperature.</strong> Based on recent telemetry trends (CPU utilization sustained at 86%, core temperature reaching 74°C, network traffic saturated at 91%, and error rates spiking to 4.2%), the probability of ungraceful hardware failure or service freeze is high (<strong>87%</strong>).
                  </>
                ) : activeComp.id === 'cooling_unit' ? (
                  <>
                    <strong className="text-amber-600">Cooling System is exhibiting elevated thermal return temperatures.</strong> The chilled water loop delta T is +4.8°C above baseline. Without adjustment, thermal headroom for the server rack will degrade over the next 90 minutes.
                  </>
                ) : (
                  <>
                    <strong>{activeComp.name}</strong> is operating within normal parameters. Telemetry trends are stable with CPU at {activeComp.telemetry.cpu}% and temperature at {activeComp.telemetry.temperature}°C. Probability of failure is negligible ({activeComp.telemetry.failure_probability}%).
                  </>
                )}
              </p>
            </div>

            {/* Early Warning Telemetry Drivers */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Identified Early Warning Factors</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className={`p-3 rounded-lg border ${activeComp.telemetry.cpu > 75 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>CPU Utilization Stress</span>
                    <span className="font-bold text-slate-800">{activeComp.telemetry.cpu}%</span>
                  </div>
                  <div className="text-[11px] mt-1 text-slate-500">
                    {activeComp.telemetry.cpu > 75 ? '▲ Escalating load beyond normal threshold' : '✓ Within nominal capacity limits'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${activeComp.telemetry.temperature > 68 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Thermal Rise (Core Temp)</span>
                    <span className="font-bold text-slate-800">{activeComp.telemetry.temperature}°C</span>
                  </div>
                  <div className="text-[11px] mt-1 text-slate-500">
                    {activeComp.telemetry.temperature > 68 ? '▲ Thermal junction approaching 75°C alarm' : '✓ Cold aisle airflow optimal'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${activeComp.telemetry.error_rate > 1.5 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Network Error Rate Surge</span>
                    <span className="font-bold text-slate-800">{activeComp.telemetry.error_rate}%</span>
                  </div>
                  <div className="text-[11px] mt-1 text-slate-500">
                    {activeComp.telemetry.error_rate > 1.5 ? '▲ TCP packet retransmissions elevated' : '✓ Normal packet loss < 0.2%'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${activeComp.telemetry.traffic > 80 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Traffic Saturation</span>
                    <span className="font-bold text-slate-800">{activeComp.telemetry.traffic}%</span>
                  </div>
                  <div className="text-[11px] mt-1 text-slate-500">
                    {activeComp.telemetry.traffic > 80 ? '▲ Bandwidth queue buffer filling' : '✓ Bandwidth throughput balanced'}
                  </div>
                </div>
              </div>
            </div>

            {/* Transparent Scoring Formula */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Transparent Failure Risk Scoring Formulation</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Composite Risk Score: <code className="text-blue-600">R = 0.28·S(Temp) + 0.27·S(CPU) + 0.22·S(ErrRate) + 0.13·S(Traffic) + 0.10·S(Mem)</code>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-2 border-t border-slate-200">
                <div>Safe: <strong className="text-emerald-600">0 – 20%</strong></div>
                <div>Warning: <strong className="text-amber-600">21 – 50%</strong></div>
                <div>High Risk: <strong className="text-orange-600">51 – 75%</strong></div>
                <div>Critical: <strong className="text-red-600">76 – 100%</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
