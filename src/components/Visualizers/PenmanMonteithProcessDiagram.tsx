import React, { useState } from 'react';
import { Sun, Wind, CloudRain, Droplets, ArrowDown, ArrowUp, Layers } from 'lucide-react';

interface PenmanMonteithProcessDiagramProps {
  specs: {
    et0: number; // mm/day
    etc?: number; // mm/day
    cropName?: string;
    kc?: number;
    temp: number; // C
    humidity: number; // %
    windSpeed: number; // m/s
    solarRad: number; // MJ/m2-d
    raw?: number; // mm
    taw?: number; // mm
    rootDepth?: number; // m
  };
}

export const PenmanMonteithProcessDiagram: React.FC<PenmanMonteithProcessDiagramProps> = ({
  specs,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string>('energy');

  const etcVal = specs.etc || (specs.et0 * (specs.kc || 1.15)).toFixed(2);
  const kcVal = specs.kc || 1.15;
  const tawVal = specs.taw || (120 * (specs.rootDepth || 0.8)).toFixed(1);
  const rawVal = specs.raw || ((specs.taw || 96) * 0.5).toFixed(1);
  const rootD = specs.rootDepth || 0.8;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl space-y-4">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">
              FAO-56 Penman-Monteith Energy Balance &amp; Root Zone Hydrology Diagram
            </div>
            <div className="text-[11px] text-slate-400">
              Atmospheric Boundary Layer Physics, Canopy Transpiration &amp; Soil Water Reservoirs
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Hover or click elements to inspect fluxes</span>
        </div>
      </div>

      {/* SVG Physics & Canopy Diagram */}
      <div className="w-full overflow-x-auto bg-slate-950/70 rounded-lg p-2 border border-slate-800/80">
        <svg
          viewBox="0 0 900 420"
          className="w-full min-w-[760px] h-auto select-none font-sans"
        >
          <defs>
            {/* Sky gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#082f49" />
              <stop offset="60%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            {/* Soil profile gradient */}
            <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#57280d" />
              <stop offset="100%" stopColor="#381c08" />
            </linearGradient>
            <marker
              id="fluxArrowUp"
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
              id="fluxArrowDown"
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

          {/* 1. ATMOSPHERE / SKY ZONE (y: 0 to 220) */}
          <rect x="10" y="10" width="880" height="210" rx="8" fill="url(#skyGrad)" />

          {/* Sun & Solar Radiation */}
          <circle cx="100" cy="65" r="32" fill="#fbbf24" opacity="0.9" />
          <circle cx="100" cy="65" r="42" fill="#fef08a" opacity="0.2" />
          <text x="100" y="70" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold">
            Solar Rs
          </text>

          {/* Net Radiation Arrow (Rn) */}
          <path
            d="M 125 90 L 190 190"
            stroke="#fbbf24"
            strokeWidth="3.5"
            markerEnd="url(#fluxArrowDown)"
          />
          <text x="175" y="130" fill="#fde047" fontSize="12" fontWeight="bold">
            R_n = {specs.solarRad} MJ/m²·d
          </text>
          <text x="175" y="148" fill="#fef08a" fontSize="10">
            Net Radiation Flux
          </text>

          {/* Atmospheric Wind Vector (u2 at 2m) */}
          <g transform="translate(40, 160)">
            <path
              d="M 10 0 C 40 -15, 80 15, 120 0 C 150 -10, 170 5, 200 0"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
            <path
              d="M 25 15 C 55 5, 95 25, 135 15 C 165 5, 185 20, 215 15"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
            <text x="10" y="-10" fill="#e0f2fe" fontSize="11" fontWeight="bold">
              Wind Speed u₂ @ 2m = {specs.windSpeed} m/s
            </text>
            <text x="10" y="32" fill="#7dd3fc" fontSize="9">
              Aerodynamic boundary layer resistance r_a
            </text>
          </g>

          {/* Vapor Pressure Deficit (es - ea) */}
          <rect x="280" y="30" width="180" height="60" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <text x="370" y="52" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="bold">
            Vapor Pressure Deficit
          </text>
          <text x="370" y="72" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace">
            (e_s - e_a) · RH = {specs.humidity}% · {specs.temp}°C
          </text>

          {/* Latent Heat Flux / Transpiration Arrow (λET) */}
          <path
            d="M 520 200 L 520 80"
            stroke="#38bdf8"
            strokeWidth="3.5"
            markerEnd="url(#fluxArrowUp)"
          />
          <text x="535" y="110" fill="#38bdf8" fontSize="13" fontWeight="bold">
            λ ET₀ = {specs.et0} mm/d
          </text>
          <text x="535" y="128" fill="#7dd3fc" fontSize="10">
            Reference Grass Evapotranspiration
          </text>
          <text x="535" y="146" fill="#a5f3fc" fontSize="11" fontWeight="bold">
            ET_c = K_c × ET₀ = {etcVal} mm/d
          </text>

          {/* Sensible Heat Flux Arrow (H) */}
          <path
            d="M 680 200 L 680 110"
            stroke="#f97316"
            strokeWidth="2.5"
            markerEnd="url(#fluxArrowUp)"
          />
          <text x="695" y="140" fill="#fdba74" fontSize="11" fontWeight="bold">
            Sensible Heat (H)
          </text>
          <text x="695" y="156" fill="#fed7aa" fontSize="9">
            Thermal convection to air
          </text>

          {/* Ground Heat Flux Arrow (G) */}
          <path
            d="M 780 215 L 780 260"
            stroke="#eab308"
            strokeWidth="2.5"
            markerEnd="url(#fluxArrowDown)"
          />
          <text x="795" y="240" fill="#fef08a" fontSize="10" fontWeight="bold">
            Soil Flux (G ≈ 0)
          </text>

          {/* 2. CROP CANOPY ARCHITECTURE (at surface level y: 175 to 220) */}
          {/* Reference Grass layer on left */}
          <g transform="translate(180, 195)">
            {[0, 15, 30, 45, 60, 75, 90, 105, 120].map((gx) => (
              <line key={gx} x1={gx} y1="25" x2={gx + 4} y2="0" stroke="#4ade80" strokeWidth="2.5" />
            ))}
            <text x="60" y="-8" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">
              Grass Ref (12 cm)
            </text>
          </g>

          {/* Actual Crop Canopy in middle (e.g. Wheat / Maize / Tomato) */}
          <g transform="translate(360, 140)">
            {/* Stems & Leaves */}
            <line x1="80" y1="80" x2="80" y2="10" stroke="#22c55e" strokeWidth="4" />
            <path d="M 80 50 Q 50 30 35 45" fill="none" stroke="#22c55e" strokeWidth="3" />
            <path d="M 80 35 Q 110 15 125 30" fill="none" stroke="#22c55e" strokeWidth="3" />
            <path d="M 80 20 Q 55 5 45 15" fill="none" stroke="#22c55e" strokeWidth="3" />
            {/* Fruit / Ear head */}
            <circle cx="80" cy="5" r="7" fill="#eab308" />
            <text x="80" y="-8" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="bold">
              {specs.cropName || 'Crop Canopy'} (Kc = {kcVal})
            </text>
          </g>

          {/* 3. SOIL PROFILE & WATER STORAGE RESERVOIR (y: 220 to 410) */}
          <rect x="10" y="220" width="880" height="190" rx="8" fill="url(#soilGrad)" />

          {/* Soil surface line */}
          <line x1="10" y1="220" x2="890" y2="220" stroke="#ca8a04" strokeWidth="3" />
          <text x="30" y="240" fill="#fef08a" fontSize="11" fontWeight="bold">
            Soil Surface (z = 0 m)
          </text>

          {/* Crop Root System */}
          <g transform="translate(440, 220)">
            <line x1="0" y1="0" x2="0" y2="120" stroke="#fcd34d" strokeWidth="2.5" />
            <line x1="0" y1="30" x2="-35" y2="70" stroke="#fcd34d" strokeWidth="1.5" />
            <line x1="0" y1="45" x2="35" y2="85" stroke="#fcd34d" strokeWidth="1.5" />
            <line x1="0" y1="75" x2="-25" y2="110" stroke="#fcd34d" strokeWidth="1.5" />
            <line x1="0" y1="90" x2="25" y2="125" stroke="#fcd34d" strokeWidth="1.5" />
            <circle cx="0" cy="125" r="3" fill="#fef08a" />
            <text x="15" y="125" fill="#fef08a" fontSize="10" fontFamily="monospace">
              Root Depth Zr = {rootD} m
            </text>
          </g>

          {/* Soil Moisture Layer Dividers */}
          {/* Layer 1: Readily Available Water (RAW) */}
          <rect x="560" y="235" width="310" height="45" rx="6" fill="#0284c7" opacity="0.4" stroke="#38bdf8" />
          <text x="575" y="255" fill="#ffffff" fontSize="11" fontWeight="bold">
            Readily Available Water (RAW) = {rawVal} mm
          </text>
          <text x="575" y="270" fill="#bae6fd" fontSize="9">
            Transpires without water stress · MAD = 50%
          </text>

          {/* Layer 2: Total Available Water (TAW) */}
          <rect x="560" y="290" width="310" height="45" rx="6" fill="#0369a1" opacity="0.3" stroke="#0ea5e9" />
          <text x="575" y="310" fill="#ffffff" fontSize="11" fontWeight="bold">
            Total Available Water (TAW) = {tawVal} mm
          </text>
          <text x="575" y="325" fill="#7dd3fc" fontSize="9">
            Available between Field Capacity (FC) &amp; Wilting Point (WP)
          </text>

          {/* Layer 3: Deep Percolation / Wilting Point */}
          <rect x="560" y="345" width="310" height="45" rx="6" fill="#1e1b4b" opacity="0.5" stroke="#6366f1" />
          <text x="575" y="365" fill="#cbd5e1" fontSize="11" fontWeight="bold">
            Permanent Wilting Point (PWP)
          </text>
          <text x="575" y="380" fill="#94a3b8" fontSize="9">
            Water tightly bound by soil capillary forces (&gt; 15 bar suction)
          </text>
        </svg>
      </div>

      {/* Physics Breakdown Footer Cards */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-3 bg-slate-900 rounded-lg border border-sky-500/30">
          <div className="text-[10px] text-sky-400 uppercase font-mono font-bold">Radiation Balance</div>
          <div className="text-base font-bold text-white mt-1">Rn = {specs.solarRad} MJ/m²·d</div>
          <div className="text-[11px] text-slate-400 mt-1">Net shortwave + longwave radiant energy driving water vaporization.</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-teal-500/30">
          <div className="text-[10px] text-teal-400 uppercase font-mono font-bold">Aerodynamic Term</div>
          <div className="text-base font-bold text-white mt-1">u₂ = {specs.windSpeed} m/s · RH = {specs.humidity}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Turbulent vapor removal from canopy microclimate into ambient air.</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-amber-500/30">
          <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">Crop Water Consumption</div>
          <div className="text-base font-bold text-white mt-1">ETc = {etcVal} mm/day ({Number(Number(etcVal) * 10).toFixed(0)} m³/ha·d)</div>
          <div className="text-[11px] text-slate-400 mt-1">Single crop coefficient approach: ETc = Kc × ET₀.</div>
        </div>
      </div>
    </div>
  );
};
