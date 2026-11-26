import React, { useState } from 'react';
import {
  ReservoirOptOutput,
  ReservoirPeriodResult,
} from '../../calculators/reservoirOptimizationEngine';
import {
  TrendingUp,
  Droplets,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Layers,
  BarChart2,
  Calendar,
  CheckCircle2,
  Sliders,
  Eye,
  EyeOff,
  Activity,
  Gauge,
} from 'lucide-react';

interface ReservoirOptimizationVisualizerProps {
  data: ReservoirOptOutput;
}

export const ReservoirOptimizationVisualizer: React.FC<ReservoirOptimizationVisualizerProps> = ({
  data,
}) => {
  const [activeTab, setActiveTab] = useState<'operation' | 'hydropower' | 'hashimoto' | 'havcurve' | 'timeseries'>('operation');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Series visibility toggles for Graph 1 (Reservoir Operation Graph)
  const [visibleSeries, setVisibleSeries] = useState({
    storage: true,
    inflow: true,
    release: true,
    demands: true,
    evaporation: true,
    ruleCurve: true,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    algorithmUsed,
    totalPeriods,
    timeStepLabel,
    totalInflowMcm,
    totalCombinedReleaseMcm,
    totalSpillageMcm,
    totalEvaporationMcm,
    totalEnergyGeneratedGwh,
    totalDemandMcm,
    systemOverallReliabilityPct,
    systemOverallResiliencyPct,
    systemOverallVulnerabilityPct,
    demandMetrics,
    optimalRuleCurveProfile,
    trajectory,
    havCurveUsed,
    minStorageObservedMcm,
    maxStorageObservedMcm,
    finalStorageMcm,
  } = data;

  // Graph Dimensions
  const chartWidth = 820;
  const chartHeight = 300;
  const paddingLeft = 55;
  const paddingRight = 60;
  const paddingTop = 25;
  const paddingBottom = 45;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Max value for Left Y-Axis (Storage & Large Volumes in MCM)
  const maxStorageValue = Math.max(
    ...trajectory.map((p) => Math.max(p.storageEndMcm, p.targetRuleCurveMcm)),
    100
  ) * 1.08;

  // Max value for Right Y-Axis (Periodic Inflow, Release, Demand, Evaporation Flows in MCM)
  const maxFlowValue = Math.max(
    ...trajectory.map((p) => Math.max(p.inflowMcm, p.totalReleaseMcm, p.totalDemandMcm, p.evaporationMcm * 2)),
    20
  ) * 1.15;

  // Scaling helpers for Graph 1
  const getX = (index: number) => {
    return paddingLeft + (index / Math.max(1, trajectory.length - 1)) * plotWidth;
  };
  const getYStorage = (val: number) => {
    return paddingTop + plotHeight - (Math.max(0, val) / maxStorageValue) * plotHeight;
  };
  const getYFlow = (val: number) => {
    return paddingTop + plotHeight - (Math.max(0, val) / maxFlowValue) * plotHeight;
  };

  // Build SVG Paths for Graph 1
  const storagePath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYStorage(p.storageEndMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const storageAreaPath =
    storagePath +
    ` L ${getX(trajectory.length - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;

  const ruleCurvePath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYStorage(p.targetRuleCurveMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const inflowPath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYFlow(p.inflowMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const releasePath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYFlow(p.totalReleaseMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const demandPath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYFlow(p.totalDemandMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const evapPath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYFlow(p.evaporationMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // ==========================================
  // Graph 2: Hydropower & Energy Generation Scaling
  // ==========================================
  const maxEnergyValue = Math.max(
    ...trajectory.map((p) => Math.max(p.energyGeneratedGwh, p.energyTargetGwh)),
    5
  ) * 1.25;

  const maxTurbineFlow = Math.max(
    ...trajectory.map((p) => p.hydroReleaseMcm),
    5
  ) * 1.2;

  const getYEnergy = (val: number) => {
    return paddingTop + plotHeight - (Math.max(0, val) / maxEnergyValue) * plotHeight;
  };
  const getYTurbineFlow = (val: number) => {
    return paddingTop + plotHeight - (Math.max(0, val) / maxTurbineFlow) * plotHeight;
  };

  const energyPath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYEnergy(p.energyGeneratedGwh);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const energyAreaPath =
    energyPath +
    ` L ${getX(trajectory.length - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;

  const energyTargetPath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYEnergy(p.energyTargetGwh);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const turbineFlowPath = trajectory.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getYTurbineFlow(p.hydroReleaseMcm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const hoveredPeriod: ReservoirPeriodResult | null =
    hoveredIndex !== null && trajectory[hoveredIndex] ? trajectory[hoveredIndex] : null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-5">
      
      {/* Header Strip with Algorithm & System Health */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <Sliders className="w-4 h-4" />
            <span>OPTIMIZATION ENGINE: {algorithmUsed.toUpperCase()}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Reservoir Multi-Objective Operation &amp; Performance
          </h3>
          <p className="text-xs text-slate-400">
            Simulated horizon: {timeStepLabel} · Mass balance, evaporation losses, and clean hydropower generation.
          </p>
        </div>

        {/* Global Hashimoto Triad Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-teal-950/70 border border-teal-700/60 text-teal-300 text-xs font-mono">
            <span className="text-[10px] text-teal-400/80 block">RELIABILITY (α)</span>
            <span className="font-bold text-sm">{systemOverallReliabilityPct}%</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-sky-950/70 border border-sky-700/60 text-sky-300 text-xs font-mono">
            <span className="text-[10px] text-sky-400/80 block">RESILIENCY (γ)</span>
            <span className="font-bold text-sm">{systemOverallResiliencyPct}%</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-amber-950/70 border border-amber-700/60 text-amber-300 text-xs font-mono">
            <span className="text-[10px] text-amber-400/80 block">VULNERABILITY (ν)</span>
            <span className="font-bold text-sm">{systemOverallVulnerabilityPct}%</span>
          </div>
        </div>
      </div>

      {/* Visualizer Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('operation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'operation'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Graph 1: Reservoir Operation (Inflow, Release, Demand, Storage, Evap)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hydropower')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'hydropower'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Graph 2: Energy &amp; Hydropower Generation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hashimoto')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'hashimoto'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hashimoto Performance Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('havcurve')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'havcurve'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Height-Area-Volume Curve</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeseries')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'timeseries'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Periodic Mass Balance Table</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GRAPH 1 - RESERVOIR OPERATION MULTI-VARIABLE GRAPH                 */}
      {/* (Inflow, Release, Demands, Storage, Evaporation, Rule Curve)              */}
      {/* ========================================================================= */}
      {activeTab === 'operation' && (
        <div className="space-y-4">
          
          {/* Interactive Legend & Series Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">Click to toggle series:</span>

              {/* Storage Toggle */}
              <button
                type="button"
                onClick={() => toggleSeries('storage')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono ${
                  visibleSeries.storage ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60' : 'bg-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                <span>Storage ($S_t$) [Left]</span>
              </button>

              {/* Inflow Toggle */}
              <button
                type="button"
                onClick={() => toggleSeries('inflow')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono ${
                  visibleSeries.inflow ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' : 'bg-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className="w-2.5 h-1 bg-emerald-400 rounded inline-block" />
                <span>Inflow ($I_t$) [Right]</span>
              </button>

              {/* Release Toggle */}
              <button
                type="button"
                onClick={() => toggleSeries('release')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono ${
                  visibleSeries.release ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60' : 'bg-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className="w-2.5 h-1 bg-indigo-400 rounded inline-block" />
                <span>Release (R_total) [Right]</span>
              </button>

              {/* Demands Toggle */}
              <button
                type="button"
                onClick={() => toggleSeries('demands')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono ${
                  visibleSeries.demands ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' : 'bg-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className="w-2.5 h-0.5 bg-amber-400 border-t border-dashed border-amber-400 inline-block" />
                <span>Demands (D_total) [Right]</span>
              </button>

              {/* Evaporation Toggle */}
              <button
                type="button"
                onClick={() => toggleSeries('evaporation')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono ${
                  visibleSeries.evaporation ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60' : 'bg-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className="w-2.5 h-1 bg-purple-400 rounded inline-block" />
                <span>Evaporation ($E_t$) [Right]</span>
              </button>

              {/* Rule Curve Toggle */}
              <button
                type="button"
                onClick={() => toggleSeries('ruleCurve')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono ${
                  visibleSeries.ruleCurve ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className="w-2.5 h-0.5 bg-slate-400 border-t border-dashed border-slate-400 inline-block" />
                <span>Rule Curve</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Hover timeline for telemetry
            </div>
          </div>

          {/* SVG Main Reservoir Operations Chart */}
          <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl border border-slate-800/80 p-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[700px] select-none"
            >
              <defs>
                <linearGradient id="opStorageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (Left Axis: Storage MCM) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const sVal = maxStorageValue * ratio;
                const fVal = maxFlowValue * ratio;
                const y = getYStorage(sVal);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                    {/* Left Axis: Storage */}
                    <text
                      x={paddingLeft - 8}
                      y={y + 3.5}
                      fill="#06b6d4"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {sVal.toFixed(0)}
                    </text>
                    {/* Right Axis: Flows & Demands */}
                    <text
                      x={chartWidth - paddingRight + 8}
                      y={y + 3.5}
                      fill="#94a3b8"
                      fontSize="9"
                      textAnchor="start"
                      fontFamily="monospace"
                    >
                      {fVal.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Axis Label Titles */}
              <text
                x={12}
                y={paddingTop + plotHeight / 2}
                fill="#06b6d4"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                transform={`rotate(-90, 12, ${paddingTop + plotHeight / 2})`}
              >
                Storage Volume S [MCM]
              </text>
              <text
                x={chartWidth - 10}
                y={paddingTop + plotHeight / 2}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                transform={`rotate(90, ${chartWidth - 10}, ${paddingTop + plotHeight / 2})`}
              >
                Inflow / Release / Demands / Evap [MCM]
              </text>

              {/* 1. Storage Area & Line */}
              {visibleSeries.storage && (
                <>
                  <path d={storageAreaPath} fill="url(#opStorageGrad)" />
                  <path
                    d={storagePath}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* 2. Target Rule Curve */}
              {visibleSeries.ruleCurve && (
                <path
                  d={ruleCurvePath}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />
              )}

              {/* 3. Inflow Series (Emerald) */}
              {visibleSeries.inflow && (
                <path
                  d={inflowPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              {/* 4. Release Series (Indigo) */}
              {visibleSeries.release && (
                <path
                  d={releasePath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              {/* 5. Demands Series (Amber dashed) */}
              {visibleSeries.demands && (
                <path
                  d={demandPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  opacity="0.9"
                />
              )}

              {/* 6. Evaporation Loss (Purple) */}
              {visibleSeries.evaporation && (
                <path
                  d={evapPath}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Hover Nodes & Crosshair Scanning */}
              {trajectory.map((p, idx) => {
                const x = getX(idx);
                const isHovered = hoveredIndex === idx;

                return (
                  <g
                    key={p.period}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + plotHeight}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Storage node */}
                    {visibleSeries.storage && (
                      <circle
                        cx={x}
                        cy={getYStorage(p.storageEndMcm)}
                        r={isHovered ? 5.5 : 2.5}
                        fill={p.spillageMcm > 0.1 ? '#f43f5e' : '#06b6d4'}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* X-axis ticks */}
                    {idx % (trajectory.length > 24 ? 3 : 1) === 0 && (
                      <text
                        x={x}
                        y={chartHeight - 12}
                        fontSize="8"
                        fill="#64748b"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {p.label.replace('Yr ', 'Y').replace(' - ', ' ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hover Telemetry Card */}
          {hoveredPeriod ? (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-800/60 shadow-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono animate-in fade-in duration-100">
              <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white font-sans text-sm">
                  {hoveredPeriod.label} Telemetry
                </span>
                <span className="text-cyan-400">
                  Elevation: {hoveredPeriod.waterLevelElevationM} m (Surface Area: {hoveredPeriod.surfaceAreaKm2} km²)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 block">STORAGE END</span>
                <span className="text-sm font-bold text-cyan-300">{hoveredPeriod.storageEndMcm} MCM</span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 block">INFLOW</span>
                <span className="text-sm font-bold text-emerald-300">{hoveredPeriod.inflowMcm} MCM</span>
              </div>

              <div>
                <span className="text-[10px] text-indigo-400 block">COMBINED RELEASE</span>
                <span className="text-sm font-bold text-indigo-300">
                  {hoveredPeriod.totalReleaseMcm} MCM <span className="text-[10px] text-slate-400">({hoveredPeriod.totalReleaseM3s} m³/s)</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-amber-400 block">TOTAL DEMANDS</span>
                <span className="text-sm font-bold text-amber-300">{hoveredPeriod.totalDemandMcm} MCM</span>
              </div>

              <div>
                <span className="text-[10px] text-purple-400 block">EVAPORATION LOSS</span>
                <span className="text-sm font-bold text-purple-300">
                  {hoveredPeriod.evaporationMcm} MCM <span className="text-[10px] text-slate-400">({hoveredPeriod.evaporationDepthM} m)</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-rose-400 block">SPILLAGE</span>
                <span className="text-sm font-bold text-rose-300">
                  {hoveredPeriod.spillageMcm > 0 ? `${hoveredPeriod.spillageMcm} MCM` : '0.00 MCM'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
              <span>Hover over any period node in the graph above to view exact period mass balance numbers.</span>
              <span className="text-teal-400 font-mono">Mass balance: $S_{'{t+1}'} = S_t + I_t - R_t - Sp_t - E_t$</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRAPH 2 - ENERGY & HYDROPOWER GENERATION GRAPH                      */}
      {/* (Clean Energy GWh, Target GWh, Turbine Discharge m3/s, Hydraulic Head)     */}
      {/* ========================================================================= */}
      {activeTab === 'hydropower' && (
        <div className="space-y-4">
          
          {/* Hydropower Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-amber-900/40">
              <span className="text-[10px] text-amber-400 font-mono block uppercase">Total Clean Energy</span>
              <span className="text-lg font-bold font-mono text-amber-300">
                {totalEnergyGeneratedGwh} <span className="text-xs text-slate-400 font-normal">GWh</span>
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Energy Time Reliability</span>
              <span className="text-lg font-bold font-mono text-teal-300">
                {demandMetrics.hydropower.timeReliabilityPct}%
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Mean Hydraulic Head</span>
              <span className="text-lg font-bold font-mono text-sky-300">
                {(trajectory.reduce((s, p) => s + p.effectiveHeadM, 0) / trajectory.length).toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">m</span>
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Max Turbine Discharge</span>
              <span className="text-lg font-bold font-mono text-cyan-300">
                {Math.max(...trajectory.map((p) => p.hydroReleaseM3s)).toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">m³/s</span>
              </span>
            </div>
          </div>

          {/* SVG Hydropower Chart */}
          <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl border border-slate-800/80 p-2">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-mono text-slate-400 border-b border-slate-900">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span>Energy Generated (GWh)</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-0.5 bg-rose-400 border-t border-dashed border-rose-400 inline-block" />
                  <span>Energy Target Demand (GWh)</span>
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-1 bg-cyan-400 rounded inline-block" />
                  <span>Turbine Release Flow (MCM)</span>
                </span>
              </div>
              <span className="text-[11px] text-amber-400/90 font-mono font-semibold">
                Power(t) = η × 9810 × Q_hydro(t) × (WaterLevel(t) - Tailwater - headloss)
              </span>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[700px] select-none"
            >
              <defs>
                <linearGradient id="hydroEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const eVal = maxEnergyValue * ratio;
                const qVal = maxTurbineFlow * ratio;
                const y = getYEnergy(eVal);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                    {/* Left Axis: Energy GWh */}
                    <text
                      x={paddingLeft - 8}
                      y={y + 3.5}
                      fill="#eab308"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {eVal.toFixed(1)}
                    </text>
                    {/* Right Axis: Turbine Flow MCM */}
                    <text
                      x={chartWidth - paddingRight + 8}
                      y={y + 3.5}
                      fill="#06b6d4"
                      fontSize="9"
                      textAnchor="start"
                      fontFamily="monospace"
                    >
                      {qVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Axis Titles */}
              <text
                x={12}
                y={paddingTop + plotHeight / 2}
                fill="#eab308"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                transform={`rotate(-90, 12, ${paddingTop + plotHeight / 2})`}
              >
                Energy Generation [GWh]
              </text>
              <text
                x={chartWidth - 10}
                y={paddingTop + plotHeight / 2}
                fill="#06b6d4"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
                transform={`rotate(90, ${chartWidth - 10}, ${paddingTop + plotHeight / 2})`}
              >
                Turbine Release [MCM]
              </text>

              {/* Energy Area Fill */}
              <path d={energyAreaPath} fill="url(#hydroEnergyGrad)" />

              {/* Energy Target Line (Rose dashed) */}
              <path
                d={energyTargetPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.9"
              />

              {/* Turbine Release Flow Line (Cyan) */}
              <path
                d={turbineFlowPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Energy Generated Line (Gold) */}
              <path
                d={energyPath}
                fill="none"
                stroke="#eab308"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Nodes and Hover Triggers */}
              {trajectory.map((p, idx) => {
                const x = getX(idx);
                const y = getYEnergy(p.energyGeneratedGwh);
                const isHovered = hoveredIndex === idx;

                return (
                  <g
                    key={p.period}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + plotHeight}
                        stroke="#facc15"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5.5 : 2.5}
                      fill={p.energyDeficitGwh > 0.05 ? '#f43f5e' : '#eab308'}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />

                    {idx % (trajectory.length > 24 ? 3 : 1) === 0 && (
                      <text
                        x={x}
                        y={chartHeight - 12}
                        fontSize="8"
                        fill="#64748b"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {p.label.replace('Yr ', 'Y').replace(' - ', ' ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hydropower Telemetry Hover Card */}
          {hoveredPeriod ? (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-800/60 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono animate-in fade-in duration-100">
              <div>
                <span className="text-[10px] text-amber-400 block">ENERGY GENERATED</span>
                <span className="text-sm font-bold text-amber-300">
                  {hoveredPeriod.energyGeneratedGwh} GWh / period
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-400 block">ENERGY TARGET / DEFICIT</span>
                <span className="text-sm font-bold text-white">
                  Target: {hoveredPeriod.energyTargetGwh} GWh{' '}
                  <span className={hoveredPeriod.energyDeficitGwh > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    ({hoveredPeriod.energyDeficitGwh > 0 ? `-${hoveredPeriod.energyDeficitGwh} GWh deficit` : 'Target met'})
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block">TURBINE DISCHARGE</span>
                <span className="text-sm font-bold text-cyan-300">
                  {hoveredPeriod.hydroReleaseMcm} MCM ({hoveredPeriod.hydroReleaseM3s} m³/s)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-purple-400 block">EFFECTIVE HEAD</span>
                <span className="text-sm font-bold text-purple-300">
                  {hoveredPeriod.effectiveHeadM} meters net head
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs text-slate-400">
              Turbine discharge $R_{'{hydro}'}$ and non-power outlet discharge $R_{'{outlet}'}$ combine downstream to supply Drinking, Irrigation, Industry, and Ecological demands.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HASHIMOTO (1982) PERFORMANCE SCORECARD                             */}
      {/* ========================================================================= */}
      {activeTab === 'hashimoto' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-400">Hashimoto et al. (1982) Multi-Sector Water Performance:</strong>
            Evaluates Time Reliability ($\alpha_t$), Volume Reliability ($\alpha_v$), System Resiliency ($\gamma$ recovery probability), and Deficit Vulnerability ($\nu$).
          </div>

          {/* Dimensionless Normalized Objective Function Breakdown */}
          {data.normalizedObjectiveSummary && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-teal-800/60 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Normalized Multi-Criteria Objective Loss Breakdown
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-teal-300">
                  Total J: {data.normalizedObjectiveSummary.totalNormalizedObjective}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Every term is strictly normalized to [0, 1] before weights are applied so storage capacity does not swamp demand shortages.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Demand Penalty</span>
                  <span className="font-bold text-teal-300">{data.normalizedObjectiveSummary.demandNormalizedPenalty}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Storage Penalty</span>
                  <span className="font-bold text-purple-300">{data.normalizedObjectiveSummary.storageNormalizedPenalty}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Hydro Penalty</span>
                  <span className="font-bold text-amber-300">{data.normalizedObjectiveSummary.hydropowerNormalizedPenalty}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Unreliability (1-α)</span>
                  <span className="font-bold text-sky-300">{data.normalizedObjectiveSummary.reliabilityPenalty}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Vulnerability (ν)</span>
                  <span className="font-bold text-rose-300">{data.normalizedObjectiveSummary.vulnerabilityPenalty}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Non-Resiliency (1-γ)</span>
                  <span className="font-bold text-emerald-300">{data.normalizedObjectiveSummary.resiliencyPenalty}</span>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Sector Demand Target</th>
                  <th className="py-2.5 px-3">Total Demand</th>
                  <th className="py-2.5 px-3">Supplied</th>
                  <th className="py-2.5 px-3">Deficit</th>
                  <th className="py-2.5 px-3 text-teal-400">Time Rel. (α_t)</th>
                  <th className="py-2.5 px-3 text-sky-400">Vol Rel. (α_v)</th>
                  <th className="py-2.5 px-3 text-emerald-400">Resiliency (γ)</th>
                  <th className="py-2.5 px-3 text-amber-400">Avg Vuln. (ν)</th>
                  <th className="py-2.5 px-3 text-rose-400">Max Vuln. (ν_max)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-xs">
                {Object.keys(demandMetrics).map((key) => {
                  const metric = demandMetrics[key as keyof typeof demandMetrics];
                  if (!metric) return null;
                  const isHydro = key === 'hydropower';
                  const isStorage = key === 'storage';
                  return (
                    <tr key={key} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white font-sans flex items-center gap-1.5">
                        {isHydro ? (
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                        ) : isStorage ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Droplets className="w-3.5 h-3.5 text-teal-400" />
                        )}
                        <span>{metric.demandName}</span>
                      </td>
                      <td className="py-2.5 px-3">{metric.totalDemand} {isHydro ? 'GWh' : 'MCM'}</td>
                      <td className="py-2.5 px-3 text-teal-300 font-bold">{metric.totalSupplied} {isHydro ? 'GWh' : 'MCM'}</td>
                      <td className="py-2.5 px-3 text-rose-400">{metric.totalDeficit} {isHydro ? 'GWh' : 'MCM'}</td>
                      <td className="py-2.5 px-3 font-bold text-teal-300">{metric.timeReliabilityPct}%</td>
                      <td className="py-2.5 px-3 text-sky-300">{metric.volumeReliabilityPct}%</td>
                      <td className="py-2.5 px-3 text-emerald-300">{metric.resiliencyPct}%</td>
                      <td className="py-2.5 px-3 text-amber-300">{metric.avgVulnerabilityPct}%</td>
                      <td className="py-2.5 px-3 text-rose-400">{metric.maxVulnerabilityPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HEIGHT-AREA-VOLUME (H-A-V) CURVE PROFILE                           */}
      {/* ========================================================================= */}
      {activeTab === 'havcurve' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-400">Height-Area-Volume Stage-Storage Profile:</strong> Applied to calculate surface water area A(S) for evaporation depth losses (E = A × E_depth) and water surface elevation Z(S) for hydropower head.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {havCurveUsed.map((pt, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Stage #{idx + 1}</div>
                <div className="text-base font-bold text-cyan-400">{pt.elevationM} m</div>
                <div className="text-xs text-emerald-400">Area: {pt.areaKm2} km²</div>
                <div className="text-xs text-amber-400 font-bold">Storage: {pt.storageMcm} MCM</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TIME-STEP MASS BALANCE TABLE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'timeseries' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Simulated multi-period mass balance:</span>
            <span className="font-mono text-[11px] text-teal-400">Values in MCM (Evap depth in m · Energy in GWh)</span>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10 text-[10px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="py-2 px-2.5">Period</th>
                  <th className="py-2 px-2.5 text-cyan-400">Inflow</th>
                  <th className="py-2 px-2.5 text-purple-400">Evap (m)</th>
                  <th className="py-2 px-2.5 text-purple-300">Evap (MCM)</th>
                  <th className="py-2 px-2.5">Start S</th>
                  <th className="py-2 px-2.5">End S</th>
                  <th className="py-2 px-2.5 text-amber-400">Hydro Rel</th>
                  <th className="py-2 px-2.5">Outlet Rel</th>
                  <th className="py-2 px-2.5 text-indigo-300 font-bold">Total Rel</th>
                  <th className="py-2 px-2.5 text-amber-300">Demands</th>
                  <th className="py-2 px-2.5 text-rose-400">Spill</th>
                  <th className="py-2 px-2.5 text-amber-300">Energy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                {trajectory.slice(0, 48).map((p) => (
                  <tr key={p.period} className="hover:bg-slate-800/50">
                    <td className="py-1.5 px-2.5 text-white font-sans">{p.label}</td>
                    <td className="py-1.5 px-2.5 text-cyan-300">{p.inflowMcm}</td>
                    <td className="py-1.5 px-2.5 text-purple-400">{p.evaporationDepthM}</td>
                    <td className="py-1.5 px-2.5 text-purple-300 font-bold">{p.evaporationMcm}</td>
                    <td className="py-1.5 px-2.5 text-slate-400">{p.storageStartMcm}</td>
                    <td className="py-1.5 px-2.5 font-bold text-white">{p.storageEndMcm}</td>
                    <td className="py-1.5 px-2.5 text-amber-300">{p.hydroReleaseMcm}</td>
                    <td className="py-1.5 px-2.5 text-slate-300">{p.outletReleaseMcm}</td>
                    <td className="py-1.5 px-2.5 text-indigo-300 font-bold">{p.totalReleaseMcm}</td>
                    <td className="py-1.5 px-2.5 text-amber-300">{p.totalDemandMcm}</td>
                    <td className="py-1.5 px-2.5 text-rose-400">{p.spillageMcm > 0 ? p.spillageMcm : '-'}</td>
                    <td className="py-1.5 px-2.5 text-amber-400 font-bold">{p.energyGeneratedGwh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
