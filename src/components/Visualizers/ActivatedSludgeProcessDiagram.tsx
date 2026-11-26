import React, { useState } from 'react';
import { Layers, Activity, Wind, RotateCcw, Droplets, CheckCircle, Info } from 'lucide-react';

interface ActivatedSludgeProcessDiagramProps {
  specs: {
    volume: number; // m3
    hrt: number;    // hours
    srt: number;    // days
    fm: number;     // kg BOD / kg MLSS-d
    mlss: number;   // mg/L
    o2Demand: number; // kg/d
    rasFlow: number;  // m3/d
    clarifierDiameter?: number; // m
    clarifierDepth?: number;    // m
    basinLength?: number;       // m
    basinWidth?: number;        // m
    basinDepth?: number;        // m
    flowRate?: number;          // m3/d
  };
}

export const ActivatedSludgeProcessDiagram: React.FC<ActivatedSludgeProcessDiagramProps> = ({
  specs,
}) => {
  const [activeElement, setActiveElement] = useState<string>('aeration');

  // Compute realistic equipment dimensions if not passed
  const basinL = specs.basinLength || (Math.cbrt(specs.volume) * 2.5).toFixed(1);
  const basinW = specs.basinWidth || (Math.cbrt(specs.volume) * 0.8).toFixed(1);
  const basinD = specs.basinDepth || 4.5;
  const clarifierDia = specs.clarifierDiameter || (Math.sqrt((specs.volume * 0.5) / 3.5) * 1.1).toFixed(1);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl space-y-4">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">
              Activated Sludge Process Flow &amp; Unit Sizing Diagram
            </div>
            <div className="text-[11px] text-slate-400">
              Interactive Metcalf &amp; Eddy Biological Treatment Train Architecture
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Click nodes to view unit engineering specifications</span>
        </div>
      </div>

      {/* SVG Engineering Flow Schematic */}
      <div className="w-full overflow-x-auto bg-slate-950/70 rounded-lg p-2 border border-slate-800/80">
        <svg
          viewBox="0 0 920 380"
          className="w-full min-w-[760px] h-auto select-none font-sans"
        >
          <defs>
            <linearGradient id="influentGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="aerationWaterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e7490" />
              <stop offset="70%" stopColor="#155e75" />
              <stop offset="100%" stopColor="#164e63" />
            </linearGradient>
            <linearGradient id="clarifierGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="60%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <marker
              id="flowArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker
              id="rasArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Background grid markings */}
          <line x1="50" y1="340" x2="880" y2="340" stroke="#1e293b" strokeDasharray="4 4" />

          {/* 1. INFLUENT STREAM */}
          <path
            d="M 20 160 L 90 160"
            stroke="#38bdf8"
            strokeWidth="4"
            markerEnd="url(#flowArrow)"
          />
          <text x="25" y="145" fill="#7dd3fc" fontSize="11" fontWeight="bold">
            Raw Influent
          </text>
          <text x="25" y="180" fill="#94a3b8" fontSize="10" fontFamily="monospace">
            {specs.flowRate ? `${specs.flowRate} m³/d` : 'Q_in'}
          </text>

          {/* 2. HEADWORKS / PRE-TREATMENT */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => setActiveElement('headworks')}
          >
            <rect
              x="95"
              y="115"
              width="90"
              height="90"
              rx="8"
              fill={activeElement === 'headworks' ? '#1e293b' : '#0f172a'}
              stroke={activeElement === 'headworks' ? '#38bdf8' : '#334155'}
              strokeWidth="2"
            />
            {/* Screen bars */}
            <line x1="120" y1="125" x2="120" y2="195" stroke="#64748b" strokeWidth="2" />
            <line x1="130" y1="125" x2="130" y2="195" stroke="#64748b" strokeWidth="2" />
            <line x1="140" y1="125" x2="140" y2="195" stroke="#64748b" strokeWidth="2" />
            <line x1="150" y1="125" x2="150" y2="195" stroke="#64748b" strokeWidth="2" />
            <line x1="160" y1="125" x2="160" y2="195" stroke="#64748b" strokeWidth="2" />
            <text x="140" y="105" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
              Screen &amp; Grit
            </text>
            <text x="140" y="222" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Coarse Solids
            </text>
          </g>

          {/* Connector to Primary Clarifier */}
          <path
            d="M 185 160 L 235 160"
            stroke="#38bdf8"
            strokeWidth="3"
            markerEnd="url(#flowArrow)"
          />

          {/* 3. PRIMARY CLARIFIER */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => setActiveElement('primary')}
          >
            <rect
              x="240"
              y="110"
              width="100"
              height="100"
              rx="8"
              fill={activeElement === 'primary' ? '#1e293b' : '#0f172a'}
              stroke={activeElement === 'primary' ? '#38bdf8' : '#334155'}
              strokeWidth="2"
            />
            {/* Circular tank inner view */}
            <circle cx="290" cy="160" r="38" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
            <line x1="290" y1="130" x2="290" y2="190" stroke="#38bdf8" strokeWidth="2" />
            <line x1="260" y1="160" x2="320" y2="160" stroke="#38bdf8" strokeWidth="2" />
            <text x="290" y="100" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
              Primary Clarifier
            </text>
            <text x="290" y="225" textAnchor="middle" fill="#94a3b8" fontSize="10">
              SOR: 30-45 m³/m²·d
            </text>
          </g>

          {/* Connector to Aeration Basin (with RAS junction) */}
          <path
            d="M 340 160 L 415 160"
            stroke="#38bdf8"
            strokeWidth="3"
            markerEnd="url(#flowArrow)"
          />
          {/* Mixing point circle */}
          <circle cx="390" cy="160" r="4" fill="#f59e0b" />

          {/* 4. AERATION BASIN (ACTIVATED SLUDGE REACTOR) */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => setActiveElement('aeration')}
          >
            <rect
              x="420"
              y="85"
              width="210"
              height="150"
              rx="12"
              fill="url(#aerationWaterGrad)"
              stroke={activeElement === 'aeration' ? '#2dd4bf' : '#0d9488'}
              strokeWidth={activeElement === 'aeration' ? '3' : '2'}
            />
            {/* Air diffusers along basin bottom */}
            <line x1="435" y1="215" x2="615" y2="215" stroke="#94a3b8" strokeWidth="3" />
            {[450, 480, 510, 540, 570, 600].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="215" r="4" fill="#e0f2fe" />
                {/* Bubble animations */}
                <circle cx={cx - 3} cy="190" r="2.5" fill="#bae6fd" opacity="0.8" />
                <circle cx={cx + 3} cy="165" r="3" fill="#bae6fd" opacity="0.7" />
                <circle cx={cx - 1} cy="140" r="3.5" fill="#bae6fd" opacity="0.6" />
                <circle cx={cx + 2} cy="115" r="2" fill="#bae6fd" opacity="0.5" />
              </g>
            ))}
            {/* Water level line */}
            <line x1="430" y1="105" x2="620" y2="105" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="5 3" />

            <text x="525" y="75" textAnchor="middle" fill="#5eead4" fontSize="13" fontWeight="bold">
              Aeration Basin (CSTR)
            </text>
            <text x="525" y="125" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              Vol: {Number(specs.volume).toLocaleString()} m³
            </text>
            <text x="525" y="145" textAnchor="middle" fill="#ccfbf1" fontSize="10" fontFamily="monospace">
              HRT = {specs.hrt} h · SRT = {specs.srt} d
            </text>
            <text x="525" y="165" textAnchor="middle" fill="#ccfbf1" fontSize="10" fontFamily="monospace">
              MLSS = {specs.mlss} mg/L
            </text>
            <text x="525" y="185" textAnchor="middle" fill="#fed7aa" fontSize="10" fontWeight="bold">
              F/M = {specs.fm} d⁻¹
            </text>
          </g>

          {/* Blower Air Injection Line */}
          <path
            d="M 525 290 L 525 220"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            markerEnd="url(#flowArrow)"
          />
          <text x="535" y="280" fill="#93c5fd" fontSize="10">
            Air Diffuser Grid ({specs.o2Demand} kg O₂/d)
          </text>

          {/* Mixed Liquor connector to Secondary Clarifier */}
          <path
            d="M 630 160 L 685 160"
            stroke="#38bdf8"
            strokeWidth="3"
            markerEnd="url(#flowArrow)"
          />
          <text x="655" y="150" textAnchor="middle" fill="#94a3b8" fontSize="9">
            Mixed Liquor
          </text>

          {/* 5. SECONDARY CLARIFIER */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => setActiveElement('clarifier')}
          >
            <rect
              x="690"
              y="95"
              width="130"
              height="130"
              rx="10"
              fill="url(#clarifierGrad)"
              stroke={activeElement === 'clarifier' ? '#38bdf8' : '#334155'}
              strokeWidth="2"
            />
            {/* Clarifier conical bottom hopper */}
            <polygon points="705,200 755,225 805,200" fill="#1e293b" stroke="#475569" />
            <circle cx="755" cy="155" r="45" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
            {/* Center well & rake arm */}
            <rect x="748" y="105" width="14" height="40" fill="#475569" />
            <line x1="718" y1="180" x2="792" y2="180" stroke="#94a3b8" strokeWidth="2" />

            <text x="755" y="85" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
              Secondary Clarifier
            </text>
            <text x="755" y="140" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              Ø {clarifierDia} m
            </text>
            <text x="755" y="160" textAnchor="middle" fill="#e2e8f0" fontSize="9">
              Solid-Liquid Separation
            </text>
            <text x="755" y="240" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
              Sludge Hopper
            </text>
          </g>

          {/* Effluent to Disinfection */}
          <path
            d="M 820 135 L 870 135"
            stroke="#34d399"
            strokeWidth="3"
            markerEnd="url(#flowArrow)"
          />
          <text x="845" y="125" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
            Treated Effluent
          </text>
          <text x="845" y="150" textAnchor="middle" fill="#6ee7b7" fontSize="9">
            BOD &lt; 10 mg/L
          </text>

          {/* 6. RETURN ACTIVATED SLUDGE (RAS) LOOP */}
          <path
            d="M 755 225 L 755 310 L 390 310 L 390 165"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 3"
            markerEnd="url(#rasArrow)"
          />
          <text x="570" y="325" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
            RAS Recycle Stream (Q_r = {specs.rasFlow} m³/d)
          </text>

          {/* 7. WASTE ACTIVATED SLUDGE (WAS) PURGE */}
          <path
            d="M 755 265 L 830 265 L 830 330"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            markerEnd="url(#flowArrow)"
          />
          <text x="840" y="300" fill="#f87171" fontSize="10" fontWeight="bold">
            WAS Sludge Waste
          </text>
          <text x="840" y="315" fill="#fca5a5" fontSize="9">
            θ_c = {specs.srt} days
          </text>
        </svg>
      </div>

      {/* Interactive Equipment Specification Card */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3 bg-slate-900 rounded-lg border border-teal-500/30">
          <div className="text-[10px] text-teal-400 uppercase font-mono font-bold">Aeration Basin Geometry</div>
          <div className="text-base font-bold text-white mt-1">{basinL}m × {basinW}m × {basinD}m</div>
          <div className="text-[11px] text-slate-400 mt-1">L:W:D ratio ~ 3:1:0.5 · Total Volume: {Number(specs.volume).toLocaleString()} m³</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-sky-500/30">
          <div className="text-[10px] text-sky-400 uppercase font-mono font-bold">Clarifier Hydraulics</div>
          <div className="text-base font-bold text-white mt-1">Ø {clarifierDia} m × 4.0 m Depth</div>
          <div className="text-[11px] text-slate-400 mt-1">Solids Flux &lt; 5.0 kg/m²·h · Surface Overflow &lt; 25 m³/m²·d</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-amber-500/30">
          <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">Recirculation &amp; Waste</div>
          <div className="text-base font-bold text-white mt-1">RAS = {specs.rasFlow} m³/d</div>
          <div className="text-[11px] text-slate-400 mt-1">Recycle ratio R ~ 0.50–0.75 · Sludge Age (SRT): {specs.srt} d</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-indigo-500/30">
          <div className="text-[10px] text-indigo-400 uppercase font-mono font-bold">Blower Aeration Duty</div>
          <div className="text-base font-bold text-white mt-1">{specs.o2Demand} kg O₂/day</div>
          <div className="text-[11px] text-slate-400 mt-1">Fine bubble floor grid · SOTR clean water efficiency ~ 32%</div>
        </div>
      </div>
    </div>
  );
};
