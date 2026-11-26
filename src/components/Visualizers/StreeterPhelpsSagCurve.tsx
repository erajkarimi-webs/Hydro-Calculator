import React, { useState } from 'react';

interface StreeterPhelpsSagCurveProps {
  curvePoints: Array<{ t: number; DO: number; deficit: number; BOD: number; distKm: number }>;
  minDO: number;
  tc: number;
  DOsat: number;
  criticalDistKm: number;
}

export const StreeterPhelpsSagCurve: React.FC<StreeterPhelpsSagCurveProps> = ({
  curvePoints,
  minDO,
  tc,
  DOsat,
  criticalDistKm,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!curvePoints || curvePoints.length === 0) return null;

  const width = 580;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxT = curvePoints[curvePoints.length - 1].t;
  const maxY = Math.max(10, Math.ceil(DOsat + 1));

  const scaleX = (t: number) => padding.left + (t / maxT) * plotW;
  const scaleY = (val: number) => padding.top + plotH - (Math.max(0, val) / maxY) * plotH;

  // Build SVG path for DO curve
  const doPathD = curvePoints.reduce((acc, pt, idx) => {
    const x = scaleX(pt.t);
    const y = scaleY(pt.DO);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build SVG path for BOD curve
  const bodPathD = curvePoints.reduce((acc, pt, idx) => {
    const x = scaleX(pt.t);
    const y = scaleY(pt.BOD);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Critical point coordinates
  const critX = scaleX(tc);
  const critY = scaleY(minDO);
  const satY = scaleY(DOsat);

  const activePoint = hoverIndex !== null ? curvePoints[hoverIndex] : null;

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          Streeter-Phelps Oxygen Sag Profile
        </h4>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-500 inline-block rounded" /> DO Curve
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block rounded border-dashed" /> BOD Decay
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-300 dark:bg-slate-700 inline-block" /> DO Saturation
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const tMouse = ((relX - padding.left) / plotW) * maxT;
            let closestIdx = 0;
            let minDiff = Infinity;
            curvePoints.forEach((pt, i) => {
              const diff = Math.abs(pt.t - tMouse);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
              }
            });
            setHoverIndex(closestIdx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10].map((tickVal) => {
            if (tickVal > maxY) return null;
            const y = scaleY(tickVal);
            return (
              <g key={tickVal}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* X axis ticks (days) */}
          {[0, 2, 4, 6, 8, 10].map((tVal) => {
            if (tVal > maxT) return null;
            const x = scaleX(tVal);
            return (
              <g key={tVal}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 4}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tVal} d
                </text>
              </g>
            );
          })}

          {/* DO Saturation reference line */}
          <line
            x1={padding.left}
            y1={satY}
            x2={width - padding.right}
            y2={satY}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={width - padding.right}
            y={satY - 5}
            textAnchor="end"
            className="text-[9px] fill-slate-400 font-mono"
          >
            DO_sat = {DOsat} mg/L
          </text>

          {/* BOD decay curve */}
          <path
            d={bodPathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            className="opacity-70"
          />

          {/* Oxygen Sag Curve */}
          <path
            d={doPathD}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Critical minimum point marker */}
          <g>
            <circle
              cx={critX}
              cy={critY}
              r="7"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              className="opacity-50"
            />
            <circle cx={critX} cy={critY} r="4.5" fill="#ef4444" />
            <line
              x1={critX}
              y1={critY}
              x2={critX}
              y2={height - padding.bottom}
              stroke="#ef4444"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <text
              x={Math.min(width - padding.right - 40, critX + 6)}
              y={Math.max(padding.top + 12, critY - 8)}
              className="text-[10px] font-bold fill-rose-600 dark:fill-rose-400 font-mono"
            >
              DO_min: {minDO.toFixed(2)} mg/L (t_c = {tc.toFixed(2)} d)
            </text>
          </g>

          {/* Hover Crosshair indicator */}
          {activePoint && (
            <g>
              <line
                x1={scaleX(activePoint.t)}
                y1={padding.top}
                x2={scaleX(activePoint.t)}
                y2={height - padding.bottom}
                stroke="#64748b"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle
                cx={scaleX(activePoint.t)}
                cy={scaleY(activePoint.DO)}
                r="4"
                fill="#0284c7"
                stroke="white"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Axes labels */}
          <text
            x={padding.left + plotW / 2}
            y={height - 4}
            textAnchor="middle"
            className="text-[10px] fill-slate-500 font-medium"
          >
            Stream Travel Time (days downstream)
          </text>
          <text
            x={-height / 2}
            y={12}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[10px] fill-slate-500 font-medium"
          >
            Concentration (mg/L)
          </text>
        </svg>

        {/* Live Hover Monospace HUD */}
        {activePoint && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-700 tabular-nums pointer-events-none">
            <div>t: {activePoint.t} d ({activePoint.distKm} km)</div>
            <div className="text-sky-300">DO: {activePoint.DO} mg/L</div>
            <div className="text-rose-300">Deficit: {activePoint.deficit} mg/L</div>
            <div className="text-amber-300">BOD: {activePoint.BOD} mg/L</div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Critical Reach: {criticalDistKm.toFixed(1)} km downstream</span>
        <span>Reaeration Rate &gt; Deoxygenation past t_c</span>
      </div>
    </div>
  );
};
