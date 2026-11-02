import React, { useState, useRef } from 'react';
import { 
  Server, Database, Network, Cpu, Shield, Zap, 
  Wind, HardDrive, Globe, Info, ZoomIn, ZoomOut, 
  Maximize2, Eye, AlertCircle, CheckCircle2, AlertTriangle, Play
} from 'lucide-react';
import { ComponentNode, ComponentStatus, ComponentType } from '../types';

interface DigitalTwinGraphProps {
  components: Record<string, ComponentNode>;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onSimulateNode?: (id: string) => void;
  highlightedIds?: string[];
  simulationActive?: boolean;
}

export const DigitalTwinGraph: React.FC<DigitalTwinGraphProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onSimulateNode,
  highlightedIds = [],
  simulationActive = false
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [filterLayer, setFilterLayer] = useState<'all' | 'traffic_only' | 'infra_only'>('all');
  const [showBlastRadius, setShowBlastRadius] = useState<boolean>(true);
  const [componentSearch, setComponentSearch] = useState<string>('');
const [statusFilter, setStatusFilter] = useState<ComponentStatus | 'all'>('all');

  const selectedNode = selectedComponentId ? components[selectedComponentId] : null;
  const filteredComponents = Object.values(components).filter((node) => {
  const search = componentSearch.toLowerCase().trim();

  const matchesSearch =
    !search ||
    node.name.toLowerCase().includes(search) ||
    node.id.toLowerCase().includes(search) ||
    node.role.toLowerCase().includes(search) ||
    node.rack.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === 'all' || node.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  // Selected node dependencies & dependents
  const directDeps = selectedNode?.dependencies || [];
  const directConsumers = selectedNode?.dependents || [];

  // Helper for node icon
  const getNodeIcon = (type: ComponentType) => {
    switch (type) {
      case 'traffic': return Globe;
      case 'router': return Network;
      case 'load_balancer': return Network;
      case 'server': return Server;
      case 'database': return Database;
      case 'replica': return Database;
      case 'storage': return HardDrive;
      case 'cooling': return Wind;
      case 'power': return Zap;
      default: return Server;
    }
  };

  // Status colors & ring effects — Light theme
  const getStatusVisuals = (status: ComponentStatus) => {
    switch (status) {
      case 'healthy':
        return {
          border: 'border-emerald-300',
          bg: 'bg-emerald-50/80',
          text: 'text-emerald-600',
          indicator: 'bg-emerald-500',
          glow: 'shadow-sm',
          badgeText: 'HEALTHY',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'warning':
        return {
          border: 'border-amber-300',
          bg: 'bg-amber-50/80',
          text: 'text-amber-600',
          indicator: 'bg-amber-500',
          glow: 'shadow-sm shadow-amber-100',
          badgeText: 'WARNING',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'critical':
        return {
          border: 'border-red-400',
          bg: 'bg-red-50/80',
          text: 'text-red-600',
          indicator: 'bg-red-500',
          glow: 'shadow-md shadow-red-100',
          badgeText: 'CRITICAL',
          badgeClass: 'bg-red-50 text-red-700 border-red-300'
        };
      case 'offline':
        return {
          border: 'border-slate-300',
          bg: 'bg-slate-100/80',
          text: 'text-slate-400',
          indicator: 'bg-slate-400',
          glow: 'shadow-none',
          badgeText: 'OFFLINE',
          badgeClass: 'bg-slate-100 text-slate-500 border-slate-300'
        };
      case 'simulated':
        return {
          border: 'border-blue-300',
          bg: 'bg-blue-50/80',
          text: 'text-blue-600',
          indicator: 'bg-blue-500',
          glow: 'shadow-sm shadow-blue-100',
          badgeText: 'SIMULATED',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return {
          border: 'border-slate-200',
          bg: 'bg-white',
          text: 'text-slate-400',
          indicator: 'bg-slate-400',
          glow: '',
          badgeText: 'UNKNOWN',
          badgeClass: 'bg-slate-100 text-slate-500 border-slate-300'
        };
    }
  };

  // Pre-defined visual edges
  const edges = [
    // Ingress Flow
    { id: 'e1', source: 'user_traffic', target: 'router_gw', label: '100Gbps Ingress', layer: 'traffic' },
    { id: 'e2', source: 'router_gw', target: 'load_balancer', label: '40Gbps Duplex', layer: 'traffic' },
    { id: 'e3', source: 'load_balancer', target: 'server_a', label: 'LeastConn', layer: 'traffic' },
    { id: 'e4', source: 'load_balancer', target: 'server_b', label: 'LeastConn', layer: 'traffic' },
    { id: 'e5', source: 'load_balancer', target: 'server_c', label: 'LeastConn', layer: 'traffic' },
    { id: 'e6', source: 'server_a', target: 'db_primary', label: 'SQL / Pool', layer: 'traffic' },
    { id: 'e7', source: 'server_b', target: 'db_primary', label: 'SQL / Pool', layer: 'traffic' },
    { id: 'e8', source: 'server_c', target: 'db_primary', label: 'SQL / Pool', layer: 'traffic' },
    { id: 'e9', source: 'db_primary', target: 'db_replica', label: 'WAL Streaming (0.4s)', layer: 'traffic', dashed: true },
    { id: 'e10', source: 'db_primary', target: 'storage_san', label: '32Gbps FC', layer: 'traffic' },
    { id: 'e11', source: 'db_replica', target: 'storage_san', label: '32Gbps FC', layer: 'traffic' },
    
    // Cooling Loop
    { id: 'c1', source: 'cooling_unit', target: 'server_a', label: 'Chilled Air', layer: 'infra', dashed: true, color: '#0891b2' },
    { id: 'c2', source: 'cooling_unit', target: 'server_b', label: 'Chilled Air', layer: 'infra', dashed: true, color: '#0891b2' },
    { id: 'c3', source: 'cooling_unit', target: 'server_c', label: 'Chilled Air', layer: 'infra', dashed: true, color: '#0891b2' },
    { id: 'c4', source: 'cooling_unit', target: 'db_primary', label: 'Cold Aisle', layer: 'infra', dashed: true, color: '#0891b2' },

    // Power Delivery
    { id: 'p1', source: 'power_grid', target: 'load_balancer', label: '480V PDU', layer: 'infra', dashed: true, color: '#d97706' },
    { id: 'p2', source: 'power_grid', target: 'server_a', label: '480V PDU', layer: 'infra', dashed: true, color: '#d97706' },
    { id: 'p3', source: 'power_grid', target: 'server_b', label: '480V PDU', layer: 'infra', dashed: true, color: '#d97706' },
    { id: 'p4', source: 'power_grid', target: 'server_c', label: '480V PDU', layer: 'infra', dashed: true, color: '#d97706' },
    { id: 'p5', source: 'power_grid', target: 'cooling_unit', label: 'HVAC Feed', layer: 'infra', dashed: true, color: '#d97706' },
  ];

  return (
    <div className="relative w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
      {/* Top Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-slate-800 tracking-wide">
              Virtual Infrastructure Topology
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {Object.keys(components).length} Nodes • Interconnected Twin State
          </span>
        </div>

        {/* Filters & View Toggles */}
        <div className="flex items-center gap-2">
	{/* Component Search */}
<div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
  <input
    type="text"
    value={componentSearch}
    onChange={(e) => setComponentSearch(e.target.value)}
    placeholder="Search component..."
    className="w-40 bg-transparent px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none"
  />
</div>

{/* Status Filter */}
<select
  value={statusFilter}
  onChange={(e) =>
    setStatusFilter(e.target.value as ComponentStatus | 'all')
  }
  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none cursor-pointer"
>
  <option value="all">All Status</option>
  <option value="healthy">Healthy</option>
  <option value="warning">Warning</option>
  <option value="critical">Critical</option>
  <option value="offline">Offline</option>
</select>

<span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
  {filteredComponents.length}/{Object.keys(components).length} nodes
</span>
          {/* Layer Filter */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-0.5 flex text-xs">
            <button
              onClick={() => setFilterLayer('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterLayer === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setFilterLayer('traffic_only')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterLayer === 'traffic_only' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Traffic Flow
            </button>
            <button
              onClick={() => setFilterLayer('infra_only')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterLayer === 'infra_only' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Power & Thermal
            </button>
          </div>

          {/* Blast Radius Toggle */}
          <button
            onClick={() => setShowBlastRadius(!showBlastRadius)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showBlastRadius 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Blast Trace</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-500 px-2 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border-l border-slate-200 transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas & Node Overlay */}
      <div 
        className="relative cyber-grid w-full h-[580px] overflow-auto select-none flex items-center justify-center bg-slate-50/30"
        style={{ cursor: 'grab' }}
      >
        <div 
          className="relative transition-transform duration-200"
          style={{ 
            width: '1120px', 
            height: '560px', 
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* SVG Dependency Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
              </marker>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const srcNode = components[edge.source];
              const tgtNode = components[edge.target];
              if (!srcNode || !tgtNode) return null;
	      const visibleIds = new Set(filteredComponents.map((node) => node.id));

if (!visibleIds.has(edge.source) || !visibleIds.has(edge.target)) {
  return null;
}

              // Visibility filter
              if (filterLayer === 'traffic_only' && edge.layer !== 'traffic') return null;
              if (filterLayer === 'infra_only' && edge.layer !== 'infra') return null;

              const isConnectedToSelected = 
                selectedComponentId && (edge.source === selectedComponentId || edge.target === selectedComponentId);
              
              const isBlastPath = 
                showBlastRadius && selectedComponentId === 'server_a' && 
                ((edge.source === 'load_balancer' && ['server_b', 'server_c'].includes(edge.target)) ||
                 (edge.source === 'server_a' && edge.target === 'db_primary'));

              let strokeColor = edge.color || '#94a3b8';
              let strokeWidth = 2;
              let marker = 'url(#arrow-blue)';

              if (isBlastPath) {
                strokeColor = '#d97706';
                strokeWidth = 3;
                marker = 'url(#arrow-amber)';
              } else if (isConnectedToSelected) {
                strokeColor = '#2563eb';
                strokeWidth = 2.5;
                marker = 'url(#arrow-blue)';
              }

              // Path computation (bezier or straight)
              const x1 = srcNode.x + 75;
              const y1 = srcNode.y + 35;
              const x2 = tgtNode.x + 75;
              const y2 = tgtNode.y + 35;

              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx1 = x1 + dx * 0.45;
              const cy1 = y1;
              const cx2 = x1 + dx * 0.55;
              const cy2 = y2;

              const pathData = Math.abs(dy) > 40
                ? `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
                : `M ${x1} ${y1} L ${x2} ${y2}`;

              return (
                <g key={edge.id}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={edge.dashed ? '5,5' : undefined}
                    markerEnd={marker}
                    className="transition-colors duration-300"
                  />
                  {/* Moving packet dot animation for active traffic */}
                  {edge.layer === 'traffic' && !edge.dashed && (
                    <circle r="3" fill="#2563eb" className="opacity-50">
                      <animateMotion path={pathData} dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Render Component Nodes */}
         {filteredComponents.map((node) => {
            const Icon = getNodeIcon(node.type);
            const visuals = getStatusVisuals(node.status);
            const isSelected = selectedComponentId === node.id;
            const isHighlighted = highlightedIds.includes(node.id);
            const isDirectDependency = directDeps.includes(node.id);
            const isDirectConsumer = directConsumers.includes(node.id);

            return (
              <div
                key={node.id}
                onClick={() => onSelectComponent(node.id)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '160px',
                }}
                className={`absolute z-10 cursor-pointer rounded-xl border p-2.5 transition-all duration-300 ${visuals.bg} ${visuals.border} ${visuals.glow} ${
                  isSelected 
                    ? 'ring-2 ring-blue-400 scale-105 shadow-md' 
                    : 'hover:scale-102 hover:border-slate-400'
                } ${isHighlighted ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
              >
                {/* Status Indicator Bar */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full ${visuals.indicator} ${node.status === 'critical' ? 'animate-ping' : ''}`}></span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 truncate">
                      {node.rack}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${visuals.badgeClass}`}>
                    {visuals.badgeText}
                  </span>
                </div>

                {/* Node Title & Icon */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-white border border-slate-200 ${visuals.text}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={node.name}>
                      {node.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      {node.role}
                    </p>
                  </div>
                </div>

                {/* Live Telemetry Mini Metrics */}
                <div className="space-y-1 pt-1 border-t border-slate-200/70 text-[10px] font-mono">
                  {node.type !== 'traffic' ? (
                    <>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>CPU Load:</span>
                        <span className={`font-bold ${node.telemetry.cpu > 80 ? 'text-red-600' : (node.telemetry.cpu > 65 ? 'text-amber-600' : 'text-slate-700')}`}>
                          {node.telemetry.cpu}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Temp:</span>
                        <span className={`${node.telemetry.temperature > 70 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                          {node.telemetry.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Risk Score:</span>
                        <span className={`font-bold ${node.telemetry.failure_probability > 70 ? 'text-red-600' : (node.telemetry.failure_probability > 30 ? 'text-amber-600' : 'text-emerald-600')}`}>
                          {node.telemetry.failure_probability}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-blue-600">
                      <span>Ingress:</span>
                      <span className="font-bold">14.2k req/s</span>
                    </div>
                  )}
                </div>

                {/* Upstream/Downstream Relationship Pill Tags */}
                {isSelected && (
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1 text-[9px] font-mono">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded shadow-sm">
                      Selected Target
                    </span>
                  </div>
                )}
                {isDirectDependency && !isSelected && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center text-[9px] font-mono">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded shadow-sm">
                      ▲ Upstream Feed
                    </span>
                  </div>
                )}
                {isDirectConsumer && !isSelected && (
                  <div className="absolute -bottom-5 left-0 right-0 flex justify-center text-[9px] font-mono">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded shadow-sm">
                      ▼ Downstream Dep
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Interactive Dependency Insight Bar */}
      <div className="px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60 text-xs">
        {/* Status Legend */}
        <div className="flex items-center gap-4 text-slate-500">
          <span className="text-slate-600 font-semibold text-[11px] uppercase tracking-wider">Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Healthy (Nominal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Warning (Thermal/Delta)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-red-600 font-medium">Critical (Spike / Failure Risk)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Offline</span>
          </div>
        </div>

        {/* Selected Component Quick Action */}
        {selectedNode ? (
          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              Selected: <strong className="text-blue-600 font-mono">{selectedNode.name}</strong> ({selectedNode.role})
            </span>
            <button
              onClick={() => onSimulateNode && onSimulateNode(selectedNode.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate Node Failure</span>
            </button>
          </div>
        ) : (
          <div className="text-slate-500 flex items-center gap-1.5 text-xs">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Click any infrastructure node to inspect live telemetry, graph dependencies, and blast radiuses.</span>
          </div>
        )}
      </div>
    </div>
  );
};
