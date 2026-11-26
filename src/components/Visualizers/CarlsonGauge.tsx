import React from 'react';

interface CarlsonGaugeProps {
  tsi: number; // 0 to 100
  trophicClass: string;
}

export const CarlsonGauge: React.FC<CarlsonGaugeProps> = ({ tsi, trophicClass }) => {
  const clampedTsi = Math.max(0, Math.min(100, tsi));
  // Needle angle for top semicircle: sweeps clockwise from 180 deg (left, TSI 0) to 270 deg (top, TSI 50) to 360 deg (right, TSI 100)
  const angleDeg = 180 + (clampedTsi / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Center is (100, 100), radius is 75
  const cx = 100;
  const cy = 100;
  const needleLength = 62;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy + needleLength * Math.sin(angleRad);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="w-full max-w-[280px] aspect-[2/1.3] relative">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            {/* Gradients for gauge zones */}
            <linearGradient id="oligoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="mesoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="eutroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="hyperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background arc tracks */}
          {/* Zone 1: Oligotrophic 0-40 (angle -90 to -18) */}
          <path
            d="M 25 100 A 75 75 0 0 1 76.8 28.7"
            fill="none"
            stroke="#0284c7"
            strokeWidth="14"
            strokeLinecap="round"
            className="opacity-80"
          />
          {/* Zone 2: Mesotrophic 40-50 (angle -18 to 0) */}
          <path
            d="M 76.8 28.7 A 75 75 0 0 1 100 25"
            fill="none"
            stroke="#10b981"
            strokeWidth="14"
            className="opacity-80"
          />
          {/* Zone 3: Eutrophic 50-70 (angle 0 to +36) */}
          <path
            d="M 100 25 A 75 75 0 0 1 144.1 39.4"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="14"
            className="opacity-80"
          />
          {/* Zone 4: Hypereutrophic 70-100 (angle +36 to +90) */}
          <path
            d="M 144.1 39.4 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="14"
            strokeLinecap="round"
            className="opacity-80"
          />

          {/* Tick lines and labels */}
          <text x="25" y="115" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">0</text>
          <text x="70" y="22" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">40</text>
          <text x="100" y="16" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">50</text>
          <text x="145" y="28" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">70</text>
          <text x="175" y="115" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">100</text>

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#0f172a"
            className="dark:stroke-slate-100 transition-all duration-300 ease-out"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Needle center cap */}
          <circle cx={cx} cy={cy} r="6" fill="#0284c7" />
          <circle cx={cx} cy={cy} r="2.5" fill="white" />
        </svg>
      </div>

      <div className="text-center mt-2">
        <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
          {clampedTsi.toFixed(1)}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mt-0.5">
          {trophicClass}
        </div>
      </div>

      {/* Category legend */}
      <div className="grid grid-cols-4 gap-2 w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
        <div>
          <span className="block font-semibold text-sky-600 dark:text-sky-400">&lt;40</span>
          <span className="text-slate-500 text-[10px]">Oligotrophic</span>
        </div>
        <div>
          <span className="block font-semibold text-emerald-600 dark:text-emerald-400">40–50</span>
          <span className="text-slate-500 text-[10px]">Mesotrophic</span>
        </div>
        <div>
          <span className="block font-semibold text-amber-600 dark:text-amber-400">50–70</span>
          <span className="text-slate-500 text-[10px]">Eutrophic</span>
        </div>
        <div>
          <span className="block font-semibold text-rose-600 dark:text-rose-400">&gt;70</span>
          <span className="text-slate-500 text-[10px]">Hypereutrophic</span>
        </div>
      </div>
    </div>
  );
};
