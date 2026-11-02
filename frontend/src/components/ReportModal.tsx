import React from 'react';
import { 
  X, FileText, Printer, Download, CheckCircle2, 
  AlertTriangle, ShieldCheck, Activity, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { SimulationResult } from '../types';

interface ReportModalProps {
  result: SimulationResult | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${result.scenario_id}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-twin-card border border-twin-border rounded-2xl shadow-2xl overflow-hidden text-slate-200 print:border-none print:shadow-none print:text-black print:bg-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-twin-border flex items-center justify-between bg-twin-surface print:bg-slate-100 print:text-black">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-cyan-400 print:text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white print:text-black">
                Infrastructure Digital Twin Simulation Audit Report
              </h3>
              <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
                Audit ID: {result.scenario_id} • Generated {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              title="Download JSON Report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-5 overflow-y-auto print:overflow-visible">
          {/* Executive Summary Box */}
          <div className="p-4 rounded-xl bg-twin-surface border border-twin-border print:border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
                Scenario Tested
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30 print:border-blue-300 print:text-blue-800">
                VIRTUAL TWIN SIMULATION
              </span>
            </div>
            <h4 className="text-base font-bold text-white print:text-black">
              {result.scenario_title}
            </h4>
            <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed font-sans">
              {result.event_description}
            </p>
          </div>

          {/* Quantitative Resilience Deltas Before vs After */}
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-twin-surface border border-twin-border print:border-slate-300 space-y-2">
              <span className="text-slate-400 print:text-slate-600 block text-[11px]">Resilience Score Delta</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-400 line-through">
                  {result.resilience_score_before}%
                </span>
                <span className="text-2xl font-bold text-emerald-400 print:text-emerald-700">
                  {result.resilience_score_after}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-300/80 print:text-emerald-800 block">
                ▲ +{result.resilience_score_after - result.resilience_score_before}% post-mitigation stability
              </span>
            </div>

            <div className="p-4 rounded-xl bg-twin-surface border border-twin-border print:border-slate-300 space-y-2">
              <span className="text-slate-400 print:text-slate-600 block text-[11px]">System Failure Risk Delta</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-rose-400 line-through">
                  {result.risk_score_before}%
                </span>
                <span className="text-2xl font-bold text-cyan-300 print:text-blue-700">
                  {result.risk_score_after}%
                </span>
              </div>
              <span className="text-[10px] text-cyan-300/80 print:text-blue-800 block">
                ▼ -{result.risk_score_before - result.risk_score_after}% failure risk abated
              </span>
            </div>
          </div>

          {/* Recommended Autonomous Remediation */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 print:border-emerald-700 print:bg-emerald-50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended Autonomous Action</span>
            </div>
            <p className="text-sm font-bold text-white print:text-black">
              {result.recommended_action}
            </p>
            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed font-sans">
              {result.recommendation_reason}
            </p>
          </div>

          {/* Cascading Blast Radius Log */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 block">
              Cascading Failure Propagation Path ({result.cascading_path.length} Nodes)
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {result.cascading_path.map((node, i) => (
                <div key={node} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-twin-surface border border-twin-border print:border-slate-300 print:text-black">
                  <span className="text-cyan-400 font-bold">{i + 1}.</span>
                  <span className="text-slate-200 print:text-black">{node}</span>
                  {i < result.cascading_path.length - 1 && <span className="text-slate-500">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Certified Signing */}
          <div className="pt-4 border-t border-twin-border print:border-slate-300 flex justify-between items-center text-[11px] text-slate-500 print:text-slate-600 font-mono">
            <span>Signed: Autonomous Digital Twin Core Engine</span>
            <span>Zero Real Downtime Certified</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-twin-border flex justify-end gap-2 bg-twin-surface print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Close Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
