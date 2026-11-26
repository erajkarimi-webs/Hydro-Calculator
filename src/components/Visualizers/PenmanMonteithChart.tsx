import React, { useState } from 'react';

interface PenmanMonteithChartProps {
  seasonalData: Array<{ month: string; et0: number }>;
  dailyEt0: number;
}

export const PenmanMonteithChart: React.FC<PenmanMonteithChartProps> = ({
  seasonalData,
  dailyEt0,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!seasonalData || seasonalData.length === 0) return null;

  const maxVal = Math.max(...seasonalData.map(d => d.et0), 10) * 1.15;
  const height = 180;
  const width = 540;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const barWidth = plotW / seasonalData.length - 6;

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          Seasonal Monthly Reference Evapotranspiration (ET₀) Distribution
        </h4>
        <div className="text-[11px] text-slate-500 font-mono">
          Annual Total: {seasonalData.reduce((a, b) => a + b.et0, 0).toFixed(0)} mm / yr
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Horizontal lines */}
          {[0, 0.33, 0.66, 1.0].map((frac) => {
            const val = maxVal * frac;
            const y = padding.top + plotH - (val / maxVal) * plotH;
            return (
              <g key={frac}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {seasonalData.map((d, idx) => {
            const x = padding.left + idx * (plotW / seasonalData.length) + 3;
            const barH = (d.et0 / maxVal) * plotH;
            const y = padding.top + plotH - barH;
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="3"
                  className={`transition-all duration-150 ${
                    isHovered
                      ? 'fill-sky-500'
                      : 'fill-sky-600/80 hover:fill-sky-500 dark:fill-sky-500/70'
                  }`}
                />
                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 14}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-500 font-mono"
                >
                  {d.month}
                </text>
                {/* Bar Value */}
                {isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className="text-[9px] font-bold font-mono fill-sky-600 dark:fill-sky-400"
                  >
                    {d.et0}
                  </text>
                )}
              </g>
            );
          })}

          <text
            x={-height / 2}
            y={12}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[10px] fill-slate-500 font-medium"
          >
            mm / month
          </text>
        </svg>

        {hoverIndex !== null && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-mono px-2 py-1 rounded shadow-sm border border-slate-700 tabular-nums">
            {seasonalData[hoverIndex].month}: {seasonalData[hoverIndex].et0} mm/mo (
            {(seasonalData[hoverIndex].et0 / 30.4).toFixed(2)} mm/d)
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Current Input Day: {dailyEt0.toFixed(2)} mm/day</span>
        <span>Peak Irrigation Season: Jun - Aug</span>
      </div>
    </div>
  );
};
