import React, { useState } from 'react';

interface PumpedStorageVisualizerProps {
  headM: number;
  flowGenM3s: number;
  powerMw: number;
  energyMwh: number;
  rtePct: number;
}

export const PumpedStorageVisualizer: React.FC<PumpedStorageVisualizerProps> = ({
  headM,
  flowGenM3s,
  powerMw,
  energyMwh,
  rtePct,
}) => {
  const [mode, setMode] = useState<'generation' | 'pumping'>('generation');

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          Pumped Storage Hydropower Operational Profile
        </h4>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('generation')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'generation'
                ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Generating (Discharge)
          </button>
          <button
            type="button"
            onClick={() => setMode('pumping')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'pumping'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pumping (Recharge)
          </button>
        </div>
      </div>

      <div className="w-full relative overflow-hidden bg-slate-950 rounded-lg p-2 border border-slate-800">
        <svg viewBox="0 0 600 230" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="waterFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width="600" height="230" fill="url(#skyGrad)" />

          {/* Mountain bedrock geometry */}
          <path
            d="M 0 110 L 140 110 L 170 80 L 250 80 L 400 190 L 600 190 L 600 230 L 0 230 Z"
            fill="url(#rockGrad)"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Upper Reservoir (Left top, elevated) */}
          <path
            d="M 30 70 L 140 70 L 140 100 L 45 100 Z"
            fill="#0284c7"
            className="opacity-75"
          />
          {/* Upper water surface */}
          <line x1="30" y1="72" x2="140" y2="72" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          <text x="85" y="60" textAnchor="middle" className="text-[10px] font-bold fill-sky-200">
            Upper Reservoir
          </text>
          <text x="85" y="90" textAnchor="middle" className="text-[9px] font-mono fill-sky-300">
            Head: {headM} m
          </text>

          {/* Penstock Conduit (Tunnel through mountain) */}
          {/* From (140, 95) down to Powerhouse at (420, 195) */}
          <path
            d="M 140 95 L 410 195"
            fill="none"
            stroke="#64748b"
            strokeWidth="8"
          />
          <path
            d="M 140 95 L 410 195"
            fill="none"
            stroke="url(#waterFlow)"
            strokeWidth="4"
          />

          {/* Animated Directional Flow Markers along Penstock */}
          {mode === 'generation' ? (
            <g className="fill-sky-300 animate-pulse">
              <polygon points="230,130 240,134 235,142" />
              <polygon points="320,162 330,166 325,174" />
            </g>
          ) : (
            <g className="fill-amber-300 animate-pulse">
              <polygon points="325,174 315,170 320,162" />
              <polygon points="235,142 225,138 230,130" />
            </g>
          )}

          {/* Powerhouse Cavern */}
          <rect x="405" y="180" width="35" height="30" rx="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Turbine / Pump rotor symbol */}
          <circle cx="422" cy="195" r="9" fill={mode === 'generation' ? '#0284c7' : '#d97706'} />
          <circle cx="422" cy="195" r="4" fill="white" />

          {/* Tailrace to Lower Reservoir */}
          <path
            d="M 440 195 L 480 195 L 580 195 L 580 215 L 460 215 Z"
            fill="#0284c7"
            className="opacity-75"
          />
          <line x1="460" y1="195" x2="580" y2="195" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          <text x="520" y="185" textAnchor="middle" className="text-[10px] font-bold fill-sky-200">
            Lower Reservoir
          </text>
          <text x="520" y="210" textAnchor="middle" className="text-[9px] font-mono fill-sky-300">
            Tailrace Return
          </text>

          {/* Real-Time Operational Tag */}
          <rect x="230" y="15" width="220" height="42" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="340" y="32" textAnchor="middle" className="text-[11px] font-bold fill-white">
            {mode === 'generation' ? 'DISCHARGE TURBINE MODE' : 'PUMP RECHARGE MODE'}
          </text>
          <text x="340" y="47" textAnchor="middle" className="text-[10px] font-mono fill-sky-400">
            {mode === 'generation'
              ? `Delivering ${powerMw.toFixed(1)} MW (${energyMwh.toFixed(0)} MWh)`
              : `Pumping ${flowGenM3s.toFixed(1)} m³/s to Mountain`}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px]">
        <div>
          <span className="text-slate-400 text-[10px] block">Gross Static Head</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{headM} m</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Penstock Flow</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{flowGenM3s} m³/s</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Peak Output</span>
          <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{powerMw.toFixed(1)} MW</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Round-Trip Efficiency</span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{rtePct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
