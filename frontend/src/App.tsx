import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { DigitalTwinGraph } from './components/DigitalTwinGraph';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { LiveMonitoring } from './components/LiveMonitoring';
import { PredictiveView } from './components/PredictiveView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ScenarioComparison } from './components/ScenarioComparison';
import { RiskHeatmap } from './components/RiskHeatmap';
import { IncidentsView } from './components/IncidentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportModal } from './components/ReportModal';
import { GuidedDemoTour } from './components/GuidedDemoTour';
import { SettingsModal } from './components/SettingsModal';

import { 
  INITIAL_COMPONENTS, INITIAL_SUMMARY, 
  INITIAL_INCIDENTS, INITIAL_RECOMMENDATIONS 
} from './data/defaultData';
import { 
ComponentNode,
SystemSummary,
SimulationResult,
Incident,
Recommendation,
PredictionExplanation 
} from './types';
import { api } from './services/api';
import { Play, Sparkles, Layers, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

export function App() {
  // Authentication state. A stored token is revalidated by protected API requests.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => typeof window !== 'undefined' && Boolean(window.localStorage.getItem('digital_twin_access_token'))
  );
  const [authMode, setAuthMode] = useState<'none' | 'demo' | 'login'>(
    () => typeof window !== 'undefined' && window.localStorage.getItem('digital_twin_access_token') ? 'login' : 'none'
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [components, setComponents] = useState<Record<string, ComponentNode>>(INITIAL_COMPONENTS);
  const [summary, setSummary] = useState<SystemSummary>(INITIAL_SUMMARY);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('server_a');
  const [inspectingComponent, setInspectingComponent] = useState<ComponentNode | null>(null);
  
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  const [isPaused, setIsPaused] = useState<boolean>(false);
const [backendOnline, setBackendOnline] = useState<boolean>(false);
 const [predictions, setPredictions] = useState<PredictionExplanation[]>([]);
const [predictionModelInfo, setPredictionModelInfo] = useState<{
  model_type: string;
  formula: string;
  threshold_critical: string;
  classification_levels: Record<string, string>;
  disclaimer: string;
} | null>(null);

  const [lastTelemetrySync, setLastTelemetrySync] = useState<Date | null>(null);
  const [componentSearch, setComponentSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Demo access is separate from registered-user authentication.
  const handleDemoAccess = async () => {
    try {
      await api.demoAccess();
    } catch {
      // Keep local demonstration usable if the backend is unavailable.
    }
    setAuthMode('demo');
    setIsAuthenticated(true);
  };

  const handleLogin = async (email: string, password: string): Promise<void> => {
    await api.login(email, password);
    setAuthMode('login');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setAuthMode('none');
    setActiveTab('dashboard');
  };

  // Sync with FastAPI backend if available, or run local jitter
  const fetchLiveData = useCallback(async () => {
    if (isPaused) return;

    try {
    const [sumRes, compRes, predictionRes] = await Promise.all([
  api.getSummary(),
  api.getComponents(),
  api.getPredictions()
]);
 setSummary(sumRes);
setComponents(compRes);

setPredictions(predictionRes.predictions);
setPredictionModelInfo(predictionRes.transparent_model_info);

setBackendOnline(true);
setLastTelemetrySync(new Date());
    } catch {
      setBackendOnline(false);
	setLastTelemetrySync(new Date());
      // Client-side natural micro-jitter to keep values lively
      setComponents(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const comp = next[k];
          if (k === 'server_a') return; // keep demo critical state
          const delta = (Math.random() - 0.5) * 0.8;
          comp.telemetry.cpu = +(Math.min(95, Math.max(15, comp.telemetry.cpu + delta))).toFixed(1);
          comp.current_load = comp.telemetry.cpu;
        });
        return next;
      });
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveData, isAuthenticated]);

  // Execute What-If simulation
  const handleRunSimulation = async (scenarioType: string, targetId: string): Promise<SimulationResult> => {
    try {
      const res = await api.runSimulation({
        scenario_type: scenarioType,
        target_component_id: targetId
      });
      setSimResult(res);
      return res;
    } catch {
      // Local fallback simulation calculation matching backend logic
      const before = JSON.parse(JSON.stringify(components));
      const after = JSON.parse(JSON.stringify(components));

      if (scenarioType === 'server_failure' || targetId === 'server_a') {
        after.server_a.status = 'offline';
        after.server_a.telemetry.status = 'offline';
        after.server_a.telemetry.cpu = 0;
        after.server_a.telemetry.health_score = 0;
        after.server_a.telemetry.failure_probability = 100;
        
        after.server_b.telemetry.cpu = 82;
        after.server_b.current_load = 82;
        after.server_c.telemetry.cpu = 79;
        after.server_c.current_load = 79;
        after.db_primary.telemetry.cpu = 71;
        after.load_balancer.telemetry.cpu = 68;
      }

      const localResult: SimulationResult = {
        scenario_id: `SIM-${scenarioType.toUpperCase()}-18`,
        scenario_title: `Simulate Server A (App Node 01) Failure`,
        target_component_id: targetId,
        target_component_name: 'Server A (App Node 01)',
        event_description: 'Virtual detachment of server_a in Digital Twin. Production traffic unaffected.',
        before_components: before,
        after_components: after,
        affected_components: ['server_a', 'load_balancer', 'server_b', 'server_c', 'db_primary'],
        cascading_path: ['server_a', 'load_balancer', 'server_b', 'server_c', 'db_primary'],
        risk_score_before: 87.0,
        risk_score_after: 18.0,
        resilience_score_before: 72.0,
        resilience_score_after: 88.0,
        is_safe: true,
        failover_possible: true,
        recommended_action: 'Redirect Server A traffic evenly across Server B (50%) and Server C (50%).',
        recommendation_reason: 'Surviving cluster nodes possess sufficient headroom (Server B: 82%, Server C: 79%). Infrastructure absorbs the full traffic quota with 0% dropped transactions.',
        candidate_capacities: {
          'Server B (App Node 02)': 82.0,
          'Server C (App Node 03)': 79.0
        },
        comparison_options: [
          {
            id: "OPT-A",
            title: "Option A: Do Nothing",
            description: "Allow Server A to crash ungracefully without proactive load shedding.",
            risk_level: "High",
            risk_score: 89.0,
            expected_downtime: "15 - 45 minutes",
            capacity_overhead: "Unbalanced (100% loss of node A capacity)",
            is_safest: false,
            action_type: "do_nothing"
          },
          {
            id: "OPT-B",
            title: "Option B: Failover Solely to Server B",
            description: "Route 100% of Server A requests to Server B only.",
            risk_level: "Warning",
            risk_score: 68.0,
            expected_downtime: "< 1 minute",
            capacity_overhead: "Server B at 98% (Thermal throttling risk)",
            is_safest: false,
            action_type: "shift_server_b"
          },
          {
            id: "OPT-C",
            title: "Option C: Dual Balanced Failover (Server B + Server C)",
            description: "Dynamically repartition ingress upstream weights across Server B (50%) and Server C (50%).",
            risk_level: "Safe",
            risk_score: 18.0,
            expected_downtime: "0 seconds (Hitless transition)",
            capacity_overhead: "Server B at 82%, Server C at 79% (Balanced headroom)",
            is_safest: true,
            action_type: "distribute_balanced"
          }
        ],
        timestamp: new Date().toISOString()
      };

      setSimResult(localResult);
      return localResult;
    }
  };

  // Set Demo Step
  const handleSetDemoStep = async (stepId: number) => {
    try {
      await api.triggerDemoStep(stepId);
      await fetchLiveData();
    } catch {
      if (stepId === 1) {
        setComponents(prev => {
          const resetNodes = { ...prev };
          Object.values(resetNodes).forEach(c => {
            c.status = 'healthy';
            c.telemetry.status = 'healthy';
            c.telemetry.cpu = 45;
            c.telemetry.temperature = 52;
            c.telemetry.health_score = 94;
            c.telemetry.failure_probability = 6;
          });
          return resetNodes;
        });
      } else if (stepId === 2 || stepId === 3) {
        setComponents(prev => {
          const copy = { ...prev };
          copy.server_a.status = 'critical';
          copy.server_a.telemetry.status = 'critical';
          copy.server_a.telemetry.cpu = 86;
          copy.server_a.telemetry.temperature = 74;
          copy.server_a.telemetry.traffic = 91;
          copy.server_a.telemetry.error_rate = 4.2;
          copy.server_a.telemetry.health_score = 62;
          copy.server_a.telemetry.failure_probability = 87;
          return copy;
        });
      }
    }
  };

  // Reset System
  const handleReset = async () => {
    try {
      await api.resetSystem();
      await fetchLiveData();
    } catch {
      setComponents(INITIAL_COMPONENTS);
      setSummary(INITIAL_SUMMARY);
    }
    setSimResult(null);
  };

  // Toggle Pause
const selectedPrediction = useMemo(() => {
  if (!selectedComponentId) return null;

  return (
    predictions.find(
      (prediction) => prediction.component_id === selectedComponentId
    ) || null
  );
}, [predictions, selectedComponentId]);
const filteredComponents = useMemo(() => {
  return Object.values(components).filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
      component.id.toLowerCase().includes(componentSearch.toLowerCase()) ||
      component.role.toLowerCase().includes(componentSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || component.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [components, componentSearch, statusFilter]);
  const handleTogglePause = async () => {
    setIsPaused(!isPaused);
    try {
      await api.togglePause();
    } catch {
      // client toggle
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onDemoAccess={handleDemoAccess} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-twin-bg text-twin-navy flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onReset={handleReset}
        onOpenDemo={() => setIsDemoTourOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        backendOnline={backendOnline}
        authMode={authMode}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <KPICards
  summary={summary}
  backendOnline={backendOnline}
  isPaused={isPaused}
  lastTelemetrySync={lastTelemetrySync}
  onSelectFilter={(status) => {
    setStatusFilter(status);
    setActiveTab('live_monitoring');
  }}
/>

            {/* Visual Digital Twin Topology */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Real-Time Digital Twin Infrastructure</span>
                </h3>
                <button
                  onClick={() => setActiveTab('digital_twin')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Full Canvas View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <DigitalTwinGraph
                components={components}
                selectedComponentId={selectedComponentId}
                onSelectComponent={(id) => {
                  setSelectedComponentId(id);
                  setInspectingComponent(components[id]);
                }}
                onSimulateNode={(id) => {
                  setSelectedComponentId(id);
                  setActiveTab('simulations');
                  handleRunSimulation('server_failure', id);
                }}
              />
            </div>

            {/* Quick Action Preview: Predictive Anomaly & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Early Warning Snapshot */}
              <div className="p-5 rounded-2xl bg-white border border-red-200 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Active Telemetry Alarm: Server A (App Node 01)</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                    87% Failure Probability
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Server A is exhibiting exponential thermal drift (74°C) coupled with high CPU utilization (86%) and an elevated 4.2% error rate.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-red-100">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Time to failure without mitigation: ~35 mins
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('simulations');
                      handleRunSimulation('server_failure', 'server_a');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Failover Simulation</span>
                  </button>
                </div>
              </div>

              {/* Recommended Response Snapshot */}
              <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Autonomous Resilience Recommendation</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Safe
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  "Redirect Server A ingress traffic evenly between Server B and Server C."
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-emerald-100">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Headroom: Server B at 82% • Server C at 79% (Safe &lt; 85%)
                  </span>
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <span>View Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Risk Heatmap Section */}
            <div className="pt-2">
              <RiskHeatmap
                components={components}
                onSelectComponent={(id) => {
                  setSelectedComponentId(id);
                  setInspectingComponent(components[id]);
                }}
                onSimulateComponent={(id) => {
                  setSelectedComponentId(id);
                  setActiveTab('simulations');
                  handleRunSimulation('server_failure', id);
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW: DIGITAL TWIN FULL CANVAS */}
        {activeTab === 'digital_twin' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-twin-border shadow-card flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-wide">
                  Interactive Infrastructure Digital Twin Topology
                </h2>
                <p className="text-xs text-slate-500">
                  Full zoom & pan visual model representing connected data center nodes, power feeds, and thermal coupling
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('simulations');
                  handleRunSimulation('server_failure', 'server_a');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Server A Failure</span>
              </button>
            </div>

            <DigitalTwinGraph
              components={components}
              selectedComponentId={selectedComponentId}
              onSelectComponent={(id) => {
                setSelectedComponentId(id);
                setInspectingComponent(components[id]);
              }}
              onSimulateNode={(id) => {
                setSelectedComponentId(id);
                setActiveTab('simulations');
                handleRunSimulation('server_failure', id);
              }}
            />
          </div>
        )}

        {/* VIEW: LIVE MONITORING */}
        {activeTab === 'live_monitoring' && (
          <LiveMonitoring
            components={components}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              setInspectingComponent(components[id]);
            }}
            onSimulateComponent={(id) => {
              setSelectedComponentId(id);
              setActiveTab('simulations');
              handleRunSimulation('server_failure', id);
            }}
          />
        )}

        {/* VIEW: TOPOLOGY / GRAPH DEPENDENCY INSPECTOR */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <DigitalTwinGraph
              components={components}
              selectedComponentId={selectedComponentId}
              onSelectComponent={(id) => {
                setSelectedComponentId(id);
                setInspectingComponent(components[id]);
              }}
              onSimulateNode={(id) => {
                setSelectedComponentId(id);
                setActiveTab('simulations');
                handleRunSimulation('server_failure', id);
              }}
            />
          </div>
        )}

        {/* VIEW: WHAT-IF SIMULATOR */}
        {activeTab === 'simulations' && (
          <WhatIfSimulator
            components={components}
            onRunSimulation={handleRunSimulation}
            onOpenReport={(res) => {
              setSimResult(res);
              setIsReportOpen(true);
            }}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              setInspectingComponent(components[id]);
            }}
            currentSimResult={simResult}
          />
        )}

        {/* VIEW: PREDICTIVE FAILURE DETECTION */}
        {activeTab === 'predictions' && (
          <PredictiveView
            components={components}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              setInspectingComponent(components[id]);
            }}
            onSimulateComponent={(id) => {
              setSelectedComponentId(id);
              setActiveTab('simulations');
              handleRunSimulation('server_failure', id);
            }}
          />
        )}

        {/* VIEW: INCIDENTS */}
        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              setInspectingComponent(components[id]);
            }}
            onSimulateComponent={(id) => {
              setSelectedComponentId(id);
              setActiveTab('simulations');
              handleRunSimulation('server_failure', id);
            }}
          />
        )}

        {/* VIEW: ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {/* VIEW: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            onSimulateAction={(code, compId) => {
              setSelectedComponentId(compId);
              setActiveTab('simulations');
              handleRunSimulation('server_failure', compId);
            }}
          />
        )}

        {/* VIEW: SCENARIO COMPARISON */}
        {activeTab === 'comparison' && (
          <ScenarioComparison
            options={simResult?.comparison_options}
            onSelectAction={(actionId) => {
              setActiveTab('simulations');
              handleRunSimulation('server_failure', 'server_a');
            }}
          />
        )}
      </main>

      {/* Floating Guided Demo Tour Bar (Hackathon Judge Mode) */}
      <GuidedDemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onSetDemoStep={handleSetDemoStep}
        onRunServerAFailure={() => handleRunSimulation('server_failure', 'server_a')}
      />

      {/* Component Detail Inspection Modal */}
      {inspectingComponent && (
        <ComponentDetailModal
          component={inspectingComponent}
          allComponents={components}
	prediction={selectedPrediction}
          onClose={() => setInspectingComponent(null)}
          onSimulate={(id) => {
            setInspectingComponent(null);
            setSelectedComponentId(id);
            setActiveTab('simulations');
            handleRunSimulation('server_failure', id);
          }}
          onSelectComponent={(id) => {
            setSelectedComponentId(id);
            setInspectingComponent(components[id]);
          }}
        />
      )}


      {/* Simulation Audit Report Modal */}
      {isReportOpen && (
        <ReportModal
          result={simResult}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onReset={handleReset}
        backendOnline={backendOnline}
      />
    </div>
  );
}
export default App;
