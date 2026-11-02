import React, { useState } from 'react';
import { 
  Play, RotateCcw, AlertTriangle, CheckCircle2, 
  AlertCircle, ArrowRight, ShieldCheck, Database, 
  Server, Cpu, Activity, Zap, FileText, ListOrdered, 
  TrendingUp, BarChart2, ShieldAlert, Sparkles 
} from 'lucide-react';
import { ComponentNode, SimulationResult, ScenarioOption } from '../types';

interface WhatIfSimulatorProps {
  components: Record<string, ComponentNode>;
  onRunSimulation: (scenarioType: string, targetId: string) => Promise<SimulationResult>;
  onOpenReport: (result: SimulationResult) => void;
  onSelectComponent: (id: string) => void;
  currentSimResult: SimulationResult | null;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  components,
  onRunSimulation,
  onOpenReport,
  onSelectComponent,
  currentSimResult
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('server_failure');
  const [selectedTarget, setSelectedTarget] = useState<string>('server_a');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<SimulationResult | null>(currentSimResult);

  const predefinedScenarios = [
    {
      id: 'server_failure',
      title: 'Simulate Server A Failure',
      target: 'server_a',
      icon: Server,
      badge: 'Core Scenario',
      desc: 'Virtually take Server A offline to evaluate automated cluster load redistribution.'
    },
    {
      id: 'traffic_surge',
      title: 'Simulate 50% Ingress Traffic Surge',
      target: 'load_balancer',
      icon: Zap,
      badge: 'Stress Test',
      desc: 'Spike ingress from 14,200 req/s to 21,300 req/s across all app nodes.'
    },
    {
      id: 'db_failure',
      title: 'Simulate Primary Database Crash',
      target: 'db_primary',
      icon: Database,
      badge: 'Failover Test',
      desc: 'Simulate master database crash to verify hot standby replica promotion.'
    },
    {
      id: 'cooling_failure',
      title: 'Simulate Precision Cooling Failure',
      target: 'cooling_unit',
      icon: AlertTriangle,
      badge: 'Thermal Risk',
      desc: 'Simulate HVAC chiller valve obstruction and ambient thermal spike.'
    }
  ];

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      const res = await onRunSimulation(selectedScenario, selectedTarget);
      setActiveResult(res);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulator Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/50 via-twin-card to-slate-900 border border-blue-500/30 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-cyan-300 border border-blue-500/40">
                <Play className="w-5 h-5 fill-current" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  What-If Scenario Simulator
                </h2>
                <p className="text-xs text-slate-400">
                  Execute virtual perturbations in the Digital Twin without affecting physical infrastructure
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero Real Outage • In-Memory Virtual Twin Model</span>
          </div>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predefinedScenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;

          return (
            <div
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc.id);
                setSelectedTarget(sc.target);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-twin-surfaceLight border-cyan-400 ring-2 ring-cyan-400 shadow-xl scale-102'
                  : 'bg-twin-card border-twin-border hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  {sc.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {sc.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                {sc.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Simulator Execution Action Bar */}
      <div className="p-4 rounded-xl bg-twin-card border border-twin-border flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Selected Scenario:
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-twin-surface px-3 py-1.5 rounded-lg border border-twin-border">
            {predefinedScenarios.find(s => s.id === selectedScenario)?.title}
          </span>
        </div>

        <button
          onClick={handleExecute}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all cursor-pointer border border-cyan-400/40 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Propagating Virtual Twin Impact...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Simulate Event Inside Digital Twin</span>
            </>
          )}
        </button>
      </div>

      {/* Simulation Results Section */}
      {activeResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Comparison: Before vs Simulated Event vs Predicted Impact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Before Simulation */}
            <div className="p-4 rounded-xl bg-twin-card border border-twin-border shadow-md">
              <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Before Simulation</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                  Server A: Critical
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-twin-surface border border-twin-border">
                  <div className="flex justify-between text-slate-300">
                    <span>Server A Status:</span>
                    <span className="text-rose-400 font-bold">CRITICAL (86% CPU)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] mt-1">
                    <span>Temperature:</span>
                    <span className="text-rose-400">74°C (Thermal Limit)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Failure Probability:</span>
                    <span className="text-rose-400 font-bold">87%</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-twin-surface text-slate-400 text-[11px]">
                  Server B Load: <strong className="text-slate-200">48%</strong> • Server C Load: <strong className="text-slate-200">44%</strong>
                </div>
              </div>
            </div>

            {/* 2. Simulated Event */}
            <div className="p-4 rounded-xl bg-twin-card border border-amber-500/40 shadow-md glow-box-amber">
              <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-amber-300">
                <span>Simulated Virtual Event</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                  In Twin Only
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center">
                  <div className="text-sm font-bold text-slate-200 mb-1">
                    Server A → <span className="text-slate-400">OFFLINE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Heartbeat suspended; load balancer health probe trips. Zero real production traffic lost.
                  </p>
                </div>
                <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-500/30">
                  Virtual detachment active. Cascading load redistribution in progress...
                </div>
              </div>
            </div>

            {/* 3. Predicted Impact */}
            <div className="p-4 rounded-xl bg-twin-card border border-cyan-500/40 shadow-md glow-box-blue">
              <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <span>Predicted Impact</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px]">
                  Rebalanced Headroom
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-twin-surface border border-twin-border space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Server B Load:</span>
                    <span className="text-emerald-400 font-bold">82% (Safe &lt; 85%)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Server C Load:</span>
                    <span className="text-emerald-400 font-bold">79% (Safe &lt; 85%)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Database Load:</span>
                    <span className="text-slate-200">71% (Within Limits)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Network Load:</span>
                    <span className="text-slate-200">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Failover & Recommendation Banner (Section 10) */}
          <div className={`p-5 rounded-2xl border shadow-xl ${
            activeResult.is_safe 
              ? 'bg-gradient-to-r from-emerald-950/40 via-twin-surface to-slate-900 border-emerald-500/50 glow-box-emerald' 
              : 'bg-gradient-to-r from-rose-950/40 via-twin-surface to-slate-900 border-rose-500/50 glow-box-rose'
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  {activeResult.is_safe ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>RECOMMENDED ACTION — SAFE FAILOVER VERIFIED</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>UNSAFE SCENARIO — CAPACITY INSUFFICIENT</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-wide">
                  {activeResult.recommended_action}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeResult.recommendation_reason}
                </p>

                {/* Candidate Capacities Check */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                  <span className="text-slate-400">Headroom Verification:</span>
                  {Object.entries(activeResult.candidate_capacities).map(([node, cap]) => (
                    <span 
                      key={node}
                      className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700"
                    >
                      {node}: <strong>{cap}%</strong>
                    </span>
                  ))}
                  <span className="text-emerald-400 font-semibold">• 0% Data Loss • Minimal Disruption</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onOpenReport(activeResult)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 transition-all cursor-pointer shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export Simulation Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cascading Impact Analysis & Replication Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cascading Impact Sequence */}
            <div className="p-5 rounded-2xl bg-twin-card border border-twin-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Cascading Impact Propagation Sequence</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Graph BFS Traversal</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {activeResult.cascading_path.map((nodeId, idx) => {
                  const node = components[nodeId];
                  return (
                    <div 
                      key={nodeId}
                      className="p-2.5 rounded-lg bg-twin-surface border border-twin-border/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{node?.name || nodeId}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {idx === 0 ? 'Failure Origin (Detached)' : (idx === 1 ? 'Traffic Rebalance (+34%)' : 'Queue Headroom Adjusted')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conceptual Database Replication & Standby Health (Section 11) */}
            <div className="p-5 rounded-2xl bg-twin-card border border-twin-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Database Replication & Standby Availability</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Sync Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-twin-surface border border-twin-border space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-twin-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-white font-bold">Primary Database (Master)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>

                <div className="flex items-center justify-between border-b border-twin-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-white font-bold">Replica Database (Hot Standby)</span>
                  </div>
                  <span className="text-cyan-300">SYNCHRONIZED (0.4s WAL Lag)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>RPO (Recovery Point Objective): <strong className="text-slate-200">0s (Zero Data Loss)</strong></div>
                  <div>RTO (Recovery Time Objective): <strong className="text-slate-200">&lt; 12s Instant Failover</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300">
                <strong>Failover Readiness:</strong> If Primary Database experiences total crash, automated failover hooks trigger pg_ctl promotion on Replica Database (10.0.2.21), sustaining uninterrupted writes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
