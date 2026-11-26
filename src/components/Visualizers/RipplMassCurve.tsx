import React, { useState } from 'react';

interface RipplMassCurveProps {
  cumInflow: number[];
  cumDemand: number[];
  deficits: number[];
  labels: string[];
  maxDeficitIndex: number;
  maxDeficitValue: number;
  unitLabel: string;
}

export const RipplMassCurve: React.FC<RipplMassCurveProps> = ({
  cumInflow,
  cumDemand,
  deficits,
  labels,
  maxDeficitIndex,
  maxDeficitValue,
  unitLabel,
}) => {
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const width = 580;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const n = labels.length;
  if (n === 0) return null;

  const maxVal = Math.max(
    cumInflow[cumInflow.length - 1] || 10,
    cumDemand[cumDemand.length - 1] || 10
  ) * 1.08;

  const scaleX = (idx: number) => padding.left + (idx / (n - 1)) * plotW;
  const scaleY = (val: number) => padding.top + plotH - (val / maxVal) * plotH;

  // Build SVG path for cumulative inflow
  const inflowPathD = cumInflow.reduce((acc, val, idx) => {
    const x = scaleX(idx);
    const y = scaleY(val);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build SVG path for cumulative demand
  const demandPathD = cumDemand.reduce((acc, val, idx) => {
    const x = scaleX(idx);
    const y = scaleY(val);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Deficit highlight at maxDeficitIndex
  const critX = scaleX(maxDeficitIndex);
  const demY = scaleY(cumDemand[maxDeficitIndex]);
  const infY = scaleY(cumInflow[maxDeficitIndex]);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          Rippl Mass Diagram &amp; Cumulative Deficit
        </h4>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 inline-block rounded" /> Cumulative Inflow (ΣQ)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 inline-block rounded" /> Cumulative Demand (ΣD)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500 inline-block rounded-xs" /> Max Deficit
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const idx = Math.min(n - 1, Math.max(0, Math.round(((relX - padding.left) / plotW) * (n - 1))));
            setHoverMonth(idx);
          }}
          onMouseLeave={() => setHoverMonth(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
            const val = maxVal * frac;
            const y = scaleY(val);
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
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Month labels on X axis */}
          {labels.map((lbl, idx) => {
            const x = scaleX(idx);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 4}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {lbl}
                </text>
              </g>
            );
          })}

          {/* Shaded Deficit Band between Cumulative Demand and Inflow */}
          <polygon
            points={`
              ${labels.map((_, i) => `${scaleX(i)},${scaleY(cumDemand[i])}`).join(' ')}
              ${labels.map((_, i) => `${scaleX(n - 1 - i)},${scaleY(cumInflow[n - 1 - i])}`).join(' ')}
            `}
            fill="#f43f5e"
            className="opacity-15"
          />

          {/* Cumulative Inflow Line */}
          <path
            d={inflowPathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Cumulative Demand Line */}
          <path
            d={demandPathD}
            fill="none"
            stroke="#e11d48"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Max Deficit Bracket Line */}
          <line
            x1={critX}
            y1={demY}
            x2={critX}
            y2={infY}
            stroke="#e11d48"
            strokeWidth="2"
          />
          <circle cx={critX} cy={demY} r="4" fill="#e11d48" />
          <circle cx={critX} cy={infY} r="4" fill="#2563eb" />

          {/* Max Deficit Annotation Tag */}
          <text
            x={Math.min(width - padding.right - 80, critX + 8)}
            y={(demY + infY) / 2 + 3}
            className="text-[10px] font-bold fill-rose-600 dark:fill-rose-400 font-mono"
          >
            S_req = {maxDeficitValue.toFixed(2)} {unitLabel}
          </text>

          {/* Hover indicator */}
          {hoverMonth !== null && (
            <g>
              <line
                x1={scaleX(hoverMonth)}
                y1={padding.top}
                x2={scaleX(hoverMonth)}
                y2={height - padding.bottom}
                stroke="#64748b"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle cx={scaleX(hoverMonth)} cy={scaleY(cumInflow[hoverMonth])} r="3.5" fill="#2563eb" />
              <circle cx={scaleX(hoverMonth)} cy={scaleY(cumDemand[hoverMonth])} r="3.5" fill="#e11d48" />
            </g>
          )}

          {/* Axis title */}
          <text
            x={-height / 2}
            y={12}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[10px] fill-slate-500 font-medium"
          >
            Volume ({unitLabel})
          </text>
        </svg>

        {hoverMonth !== null && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-700 tabular-nums pointer-events-none">
            <div>Month: {labels[hoverMonth]}</div>
            <div className="text-blue-300">Σ Inflow: {cumInflow[hoverMonth]} {unitLabel}</div>
            <div className="text-rose-300">Σ Demand: {cumDemand[hoverMonth]} {unitLabel}</div>
            <div className="text-amber-300">Cumulative Deficit: {deficits[hoverMonth]} {unitLabel}</div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Maximum Deficit timestep: {labels[maxDeficitIndex]}</span>
        <span>Storage buffer required: {maxDeficitValue.toFixed(2)} {unitLabel}</span>
      </div>
    </div>
  );
};
