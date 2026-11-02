import React, { useState } from 'react';
import { 
  X, Settings, Sliders, RefreshCw, Radio, 
  ShieldCheck, CheckCircle2, Globe, Database 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  backendOnline: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onReset,
  backendOnline
}) => {
  const [tickRate, setTickRate] = useState<number>(3);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://telemetry.enterprise-dc.internal/v1/metrics');
  const [autoRedistribute, setAutoRedistribute] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-twin-card border border-twin-border rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-twin-border flex items-center justify-between bg-twin-surface">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Platform Configuration & Sensor Feeds
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Digital Twin Telemetry & Anomaly Calibration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs font-sans">
          {/* Telemetry Interval */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
              Simulated Telemetry Sampling Frequency:
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={tickRate}
                onChange={(e) => setTickRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="font-mono text-cyan-300 font-bold whitespace-nowrap">
                Every {tickRate}s
              </span>
            </div>
          </div>

          {/* Autonomous Failover Automation Switch */}
          <div className="p-3.5 rounded-xl bg-twin-surface border border-twin-border flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Autonomous Load Re-partitioning</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically engage failover recommendation when simulated twin verifies safety.
              </p>
            </div>
            <button
              onClick={() => setAutoRedistribute(!autoRedistribute)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoRedistribute ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoRedistribute ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Real-world Telemetry Ingress Webhook (Future IoT / Prometheus Connector) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
              External Telemetry / OpenTelemetry Ingress Endpoint:
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-twin-surface border border-twin-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              The architecture supports streaming live Prometheus, IPMI, or Modbus sensor data.
            </p>
          </div>

          {/* Reset System Baseline */}
          <div className="p-3.5 rounded-xl bg-twin-surface border border-twin-border flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Restore Initial Demo State</h4>
              <p className="text-[11px] text-slate-400">
                Resets Server A critical anomaly, cooling warning, and clears simulation logs.
              </p>
            </div>
            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-twin-border flex items-center justify-between bg-twin-surface">
          <span className="text-[11px] text-slate-500 font-mono">
            Status: {backendOnline ? 'FastAPI Connected' : 'Client Mode'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow cursor-pointer border border-cyan-400/30"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
