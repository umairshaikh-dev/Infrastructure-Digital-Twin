import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Network, Cpu, Play, Pause, RotateCcw, 
  Sparkles, ShieldCheck, AlertTriangle, Settings, FileText, 
  BarChart2, ListOrdered, Share2, Layers, LogOut
} from 'lucide-react';
import { SystemSummary } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summary: SystemSummary;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onOpenDemo: () => void;
  onOpenSettings: () => void;
  backendOnline: boolean;
  authMode?: 'none' | 'demo' | 'login';
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  summary,
  isPaused,
  onTogglePause,
  onReset,
  onOpenDemo,
  onOpenSettings,
  backendOnline,
  authMode = 'demo',
  onLogout
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'digital_twin', label: 'Digital Twin', icon: Layers },
    { id: 'live_monitoring', label: 'Live Monitoring', icon: Server },
    { id: 'topology', label: 'Topology', icon: Network },
    { id: 'simulations', label: 'Simulations', icon: Play },
    { id: 'predictions', label: 'Predictions', icon: Cpu },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'comparison', label: 'Comparison', icon: ListOrdered },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-500/15">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                Infrastructure Digital Twin
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                  Autonomous Twin v2.0
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Predictive Simulation & Resilience Optimization Platform
            </p>
          </div>
        </div>

        {/* Live Controls & Telemetry Indicator */}
        <div className="flex items-center gap-3">
          {/* Environment Disclaimer Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Simulated Telemetry / Demo Environment</span>
          </div>

          {/* Backend Connection Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-blue-400 animate-pulse'}`}></span>
            <span className="text-slate-600">{backendOnline ? 'API Connected' : 'Twin Sync Active'}</span>
          </div>

          {/* Clock */}
          <div className="hidden sm:block text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            {currentTime} UTC
          </div>

          {/* Pause / Resume button */}
          <button
            onClick={onTogglePause}
            title={isPaused ? "Resume Live Telemetry Feed" : "Pause Live Telemetry Feed"}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isPaused 
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Paused' : 'Live'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Reset Infrastructure to Demo Baseline"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Guided Demo Tour Trigger */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Judge Demo Tour</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Settings & Calibration"
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-4 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'incidents' && summary.critical_components > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-0.5"></span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
