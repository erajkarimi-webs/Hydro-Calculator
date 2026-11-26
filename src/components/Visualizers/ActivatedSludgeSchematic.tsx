import React from 'react';

interface ActivatedSludgeSchematicProps {
  flowQ: number;      // m3/day
  bodIn: number;      // mg/L
  bodOut: number;     // mg/L
  mlss: number;       // mg/L
  volumeM3: number;   // m3
  hrtHours: number;   // hr
  srtDays: number;    // days
  fmRatio: number;    // kg BOD/kg VSS·d
  roKgDay: number;    // kg O2/day
  rasRatioPct: number;// %
  qwM3Day: number;    // m3/day
}

export const ActivatedSludgeSchematic: React.FC<ActivatedSludgeSchematicProps> = ({
  flowQ,
  bodIn,
  bodOut,
  mlss,
  volumeM3,
  hrtHours,
  srtDays,
  fmRatio,
  roKgDay,
  rasRatioPct,
  qwM3Day,
}) => {
  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          Biological Reactor &amp; Clarifier Hydraulic Schematic
        </h4>
        <div className="text-[11px] text-slate-500 font-mono">
          Metcalf &amp; Eddy Complete-Mix Activated Sludge
        </div>
      </div>

      <div className="w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800/80">
        <svg viewBox="0 0 620 220" className="w-full h-auto select-none">
          <defs>
            {/* Water gradient */}
            <linearGradient id="aerationWater" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="sludgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#b45309" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* 1. Influent Line */}
          <line x1="20" y1="85" x2="130" y2="85" stroke="#0284c7" strokeWidth="4" />
          <polygon points="125,80 135,85 125,90" fill="#0284c7" />

          {/* Influent Tag */}
          <rect x="25" y="45" width="95" height="32" rx="4" fill="white" className="dark:fill-slate-900" stroke="#cbd5e1" strokeWidth="1" />
          <text x="72" y="58" textAnchor="middle" className="text-[9px] font-semibold fill-slate-700 dark:fill-slate-300">Raw Influent</text>
          <text x="72" y="71" textAnchor="middle" className="text-[9px] font-mono fill-sky-600 dark:fill-sky-400">
            Q: {flowQ.toLocaleString()} m³/d
          </text>

          {/* 2. Aeration Basin */}
          <rect x="135" y="50" width="180" height="90" rx="4" fill="url(#aerationWater)" stroke="#64748b" strokeWidth="2" />
          {/* Surface line */}
          <line x1="135" y1="62" x2="315" y2="62" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Aerator / Diffuser bubbles */}
          <g className="opacity-60">
            <circle cx="170" cy="115" r="3" fill="white" />
            <circle cx="172" cy="95" r="2.5" fill="white" />
            <circle cx="175" cy="75" r="2" fill="white" />
            <circle cx="220" cy="120" r="3" fill="white" />
            <circle cx="223" cy="98" r="2" fill="white" />
            <circle cx="221" cy="76" r="2.5" fill="white" />
            <circle cx="270" cy="116" r="3" fill="white" />
            <circle cx="272" cy="94" r="2" fill="white" />
            <circle cx="269" cy="74" r="2.5" fill="white" />
          </g>

          {/* Aeration Basin Labels */}
          <rect x="145" y="70" width="160" height="58" rx="4" fill="white" className="dark:fill-slate-900 opacity-95" stroke="#94a3b8" strokeWidth="1" />
          <text x="225" y="84" textAnchor="middle" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100">Aeration Basin</text>
          <text x="225" y="97" textAnchor="middle" className="text-[9px] font-mono fill-slate-600 dark:fill-slate-300">
            V = {Math.round(volumeM3).toLocaleString()} m³ · HRT = {hrtHours.toFixed(1)} h
          </text>
          <text x="225" y="110" textAnchor="middle" className="text-[9px] font-mono fill-emerald-600 dark:fill-emerald-400">
            MLSS = {mlss} mg/L · F/M = {fmRatio.toFixed(2)}
          </text>
          <text x="225" y="122" textAnchor="middle" className="text-[9px] font-mono fill-sky-600 dark:fill-sky-400">
            O₂ Demand: {Math.round(roKgDay).toLocaleString()} kg/d
          </text>

          {/* 3. Mixed Liquor Transfer Pipe */}
          <line x1="315" y1="85" x2="385" y2="85" stroke="#0284c7" strokeWidth="4" />
          <polygon points="380,80 390,85 380,90" fill="#0284c7" />

          {/* 4. Secondary Clarifier */}
          <path
            d="M 390 55 L 490 55 L 490 105 L 440 145 L 390 105 Z"
            fill="url(#sludgeGrad)"
            stroke="#64748b"
            strokeWidth="2"
          />
          {/* Clarifier Water line */}
          <line x1="390" y1="65" x2="490" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="440" y="80" textAnchor="middle" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100">Secondary Clarifier</text>
          <text x="440" y="94" textAnchor="middle" className="text-[9px] font-mono fill-slate-600 dark:fill-slate-300">Sludge Blanket</text>

          {/* 5. Treated Effluent Overflow */}
          <line x1="490" y1="65" x2="590" y2="65" stroke="#0284c7" strokeWidth="3" />
          <polygon points="585,61 595,65 585,69" fill="#0284c7" />

          {/* Effluent Tag */}
          <rect x="500" y="30" width="105" height="30" rx="4" fill="white" className="dark:fill-slate-900" stroke="#cbd5e1" strokeWidth="1" />
          <text x="552" y="43" textAnchor="middle" className="text-[9px] font-semibold fill-emerald-600 dark:fill-emerald-400">Treated Effluent</text>
          <text x="552" y="54" textAnchor="middle" className="text-[9px] font-mono fill-slate-600 dark:fill-slate-300">
            BOD: {bodOut} mg/L
          </text>

          {/* 6. Return Activated Sludge (RAS) Line */}
          {/* Drops from clarifier hopper bottom (440, 145) to y=185, runs left to x=100, then up to x=130 */}
          <path
            d="M 440 145 L 440 185 L 100 185 L 100 85"
            fill="none"
            stroke="#b45309"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <polygon points="96,95 100,85 104,95" fill="#b45309" />

          {/* RAS Badge */}
          <rect x="195" y="172" width="130" height="26" rx="4" fill="white" className="dark:fill-slate-900" stroke="#d97706" strokeWidth="1" />
          <text x="260" y="184" textAnchor="middle" className="text-[9px] font-bold fill-amber-700 dark:fill-amber-400">
            RAS Recycle: {rasRatioPct.toFixed(1)}%
          </text>
          <text x="260" y="194" textAnchor="middle" className="text-[8px] font-mono fill-slate-500">
            Flow: {(flowQ * rasRatioPct / 100).toFixed(0)} m³/d
          </text>

          {/* 7. Waste Activated Sludge (WAS) Line */}
          <line x1="440" y1="185" x2="520" y2="185" stroke="#78350f" strokeWidth="3" />
          <polygon points="515,181 525,185 515,189" fill="#78350f" />

          {/* WAS Tag */}
          <rect x="525" y="170" width="85" height="30" rx="4" fill="white" className="dark:fill-slate-900" stroke="#9a3412" strokeWidth="1" />
          <text x="567" y="183" textAnchor="middle" className="text-[9px] font-bold fill-rose-700 dark:fill-rose-400">Waste Sludge (WAS)</text>
          <text x="567" y="194" textAnchor="middle" className="text-[8px] font-mono fill-slate-600 dark:fill-slate-300">
            Q_w: {qwM3Day.toFixed(1)} m³/d
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px]">
        <div>
          <span className="text-slate-400 text-[10px] block">Sludge Age (SRT)</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{srtDays} days</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">BOD Removal Efficiency</span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {(((bodIn - bodOut) / bodIn) * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Biomass Growth Regime</span>
          <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
            {fmRatio <= 0.4 ? 'Endogenous Respiration' : 'Log Growth'}
          </span>
        </div>
      </div>
    </div>
  );
};
