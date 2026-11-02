import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Clock, Cpu, Thermometer, 
  Activity, Zap, ShieldAlert, ArrowUpRight, AlertCircle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<number>(1);
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');

  // Realistic historical simulated time-series generator
  const generateData = (hours: number) => {
    const points = 16;
    const data = [];
    const now = new Date();

    for (let i = points; i >= 0; i--) {
      const t = new Date(now.getTime() - (i * (hours * 3600 * 1000) / points));
      const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const progress = (points - i) / points;

      // Server A exhibiting exponential thermal / CPU drift
      const srvA_cpu = Math.min(94, Math.round(52 + (34 * progress) + (Math.sin(i) * 3)));
      const srvA_temp = Math.min(78, Math.round(50 + (24 * progress) + (Math.cos(i) * 1.5)));
      const srvA_traffic = Math.min(95, Math.round(48 + (42 * progress) + (Math.sin(i * 2) * 4)));
      const srvA_err = +(0.1 + (4.1 * (progress ** 2))).toFixed(2);
      const srvA_power = Math.round(420 + (300 * progress));
      const srvA_risk = Math.min(89, Math.round(8 + (79 * progress)));

      // Healthy baseline peers
      const srvB_cpu = Math.round(44 + (Math.sin(i * 0.8) * 5));
      const srvC_cpu = Math.round(40 + (Math.cos(i * 0.8) * 4));
      const db_cpu = Math.round(55 + (8 * progress) + (Math.sin(i) * 2));

      data.push({
        time: label,
        server_a_cpu: srvA_cpu,
        server_a_temp: srvA_temp,
        server_a_traffic: srvA_traffic,
        server_a_err: srvA_err,
        server_a_power: srvA_power,
        server_a_risk: srvA_risk,
        server_b_cpu: srvB_cpu,
        server_c_cpu: srvC_cpu,
        db_cpu: db_cpu,
      });
    }
    return data;
  };

  const [data, setData] = useState(generateData(1));

  useEffect(() => {
    setData(generateData(timeframe));
  }, [timeframe]);

  const metricsConfig: Record<string, { title: string; unit: string; lines: { key: string; name: string; color: string }[] }> = {
    cpu: {
      title: 'CPU Utilization Comparison (%)',
      unit: '%',
      lines: [
        { key: 'server_a_cpu', name: 'Server A (Critical Drift)', color: '#ef4444' },
        { key: 'server_b_cpu', name: 'Server B (Healthy)', color: '#3b82f6' },
        { key: 'server_c_cpu', name: 'Server C (Healthy)', color: '#10b981' },
        { key: 'db_cpu', name: 'Primary DB Master', color: '#8b5cf6' },
      ]
    },
    temperature: {
      title: 'Operating Temperature Trajectory (°C)',
      unit: '°C',
      lines: [
        { key: 'server_a_temp', name: 'Server A Core Temp', color: '#f59e0b' }
      ]
    },
    traffic: {
      title: 'Network Traffic Ingress Saturation (%)',
      unit: '%',
      lines: [
        { key: 'server_a_traffic', name: 'Server A Traffic Load', color: '#06b6d4' }
      ]
    },
    error: {
      title: 'Network Error Rate & Packet Retransmissions (%)',
      unit: '%',
      lines: [
        { key: 'server_a_err', name: 'Server A Error Rate', color: '#ec4899' }
      ]
    },
    power: {
      title: 'Power Draw (Watts)',
      unit: 'W',
      lines: [
        { key: 'server_a_power', name: 'Server A Power Consumption', color: '#eab308' }
      ]
    },
    risk: {
      title: 'Predictive Failure Probability Trajectory (%)',
      unit: '%',
      lines: [
        { key: 'server_a_risk', name: 'Server A Failure Probability', color: '#dc2626' }
      ]
    }
  };

  const currentConfig = metricsConfig[selectedMetric];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-twin-surface to-slate-900 border border-twin-border shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                <BarChart2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Historical Telemetry Analytics
                </h2>
                <p className="text-xs text-slate-400">
                  Telemetry progression curves across compute, thermal, network, and failure risk dimensions
                </p>
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Time Window:</span>
            <div className="flex items-center bg-twin-surface border border-twin-border rounded-lg p-0.5 text-xs">
              {[
                { label: 'Last 1h', hours: 1 },
                { label: 'Last 6h', hours: 6 },
                { label: 'Last 24h', hours: 24 },
                { label: 'Last 7d', hours: 168 },
              ].map(tf => (
                <button
                  key={tf.hours}
                  onClick={() => setTimeframe(tf.hours)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    timeframe === tf.hours ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Category Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'cpu', label: 'CPU Utilization', icon: Cpu },
          { id: 'temperature', label: 'Temperature (°C)', icon: Thermometer },
          { id: 'traffic', label: 'Network Traffic', icon: Activity },
          { id: 'error', label: 'Error Rate', icon: ShieldAlert },
          { id: 'power', label: 'Power Consumption', icon: Zap },
          { id: 'risk', label: 'Failure Probability', icon: AlertCircle },
        ].map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedMetric === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedMetric(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-blue-600/20 text-cyan-300 border-blue-500/40 shadow-sm'
                  : 'bg-twin-card text-slate-400 border-twin-border hover:border-slate-500'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Main Chart */}
      <div className="p-6 rounded-2xl bg-twin-card border border-twin-border shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white font-mono">
            {currentConfig.title}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Values in {currentConfig.unit} • Sampled at high-precision telemetry intervals
          </span>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111726', 
                  borderColor: '#243049', 
                  borderRadius: '8px', 
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              {currentConfig.lines.map((l) => (
                <Line
                  key={l.key}
                  type="monotone"
                  dataKey={l.key}
                  name={l.name}
                  stroke={l.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: l.color }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
