import React, { useState } from 'react';

interface CropWaterChartProps {
  schedule: Array<{ day: number; etc: number; nir: number; gir: number }>;
  cropName: string;
  grossTotal: number;
}

export const CropWaterChart: React.FC<CropWaterChartProps> = ({ schedule, cropName, grossTotal }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!schedule || schedule.length === 0) return null;

  const width = 540;
  const height = 200;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...schedule.map(d => Math.max(d.gir, d.etc)), 8) * 1.15;

  const scaleX = (idx: number) => padding.left + (idx / (schedule.length - 1)) * plotW;
  const scaleY = (val: number) => padding.top + plotH - (val / maxVal) * plotH;

  const girPath = schedule.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.gir)}`, '');
  const etcPath = schedule.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.etc)}`, '');
  const nirPath = schedule.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.nir)}`, '');

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          {cropName} Daily Water Demand &amp; Delivery Schedule
        </h4>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-sky-500 inline-block rounded-xs" /> GIR Delivery
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 inline-block rounded-xs" /> Crop ET_c
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-amber-500 inline-block rounded-xs" /> Net (NIR)
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
            const idx = Math.min(schedule.length - 1, Math.max(0, Math.round(((relX - padding.left) / plotW) * (schedule.length - 1))));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.33, 0.66, 1.0].map((frac) => {
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
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X ticks */}
          {schedule.map((d, i) => (
            <text
              key={d.day}
              x={scaleX(i)}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              className="text-[9px] fill-slate-400 font-mono"
            >
              Day {d.day}
            </text>
          ))}

          {/* Shaded Area under GIR */}
          <polygon
            points={`
              ${schedule.map((_, i) => `${scaleX(i)},${scaleY(schedule[i].gir)}`).join(' ')}
              ${scaleX(schedule.length - 1)},${scaleY(0)}
              ${scaleX(0)},${scaleY(0)}
            `}
            fill="#0284c7"
            className="opacity-10"
          />

          {/* GIR Line */}
          <path d={girPath} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Crop ETc Line */}
          <path d={etcPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 2" />

          {/* NIR Line */}
          <path d={nirPath} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="2 2" />

          {/* Hover crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={scaleX(hoverIndex)}
                y1={padding.top}
                x2={scaleX(hoverIndex)}
                y2={height - padding.bottom}
                stroke="#64748b"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle cx={scaleX(hoverIndex)} cy={scaleY(schedule[hoverIndex].gir)} r="4" fill="#0284c7" />
              <circle cx={scaleX(hoverIndex)} cy={scaleY(schedule[hoverIndex].etc)} r="3" fill="#10b981" />
              <circle cx={scaleX(hoverIndex)} cy={scaleY(schedule[hoverIndex].nir)} r="3" fill="#f59e0b" />
            </g>
          )}

          <text
            x={-height / 2}
            y={12}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[10px] fill-slate-500 font-medium"
          >
            mm / day
          </text>
        </svg>

        {hoverIndex !== null && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-700 tabular-nums pointer-events-none">
            <div>Day {schedule[hoverIndex].day}</div>
            <div className="text-sky-300">Gross Delivery: {schedule[hoverIndex].gir} mm/d</div>
            <div className="text-emerald-300">Crop ET: {schedule[hoverIndex].etc} mm/d</div>
            <div className="text-amber-300">Net Irrigation: {schedule[hoverIndex].nir} mm/d</div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Crop: {cropName}</span>
        <span>Average Gross Delivery: {grossTotal.toFixed(2)} mm/day</span>
      </div>
    </div>
  );
};
