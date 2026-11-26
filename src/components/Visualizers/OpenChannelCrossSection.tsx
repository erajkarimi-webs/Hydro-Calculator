import React from 'react';

interface OpenChannelCrossSectionProps {
  channelType: 'rectangular' | 'trapezoidal' | 'triangular' | 'circular';
  bottomWidth: number;
  waterDepth: number;
  sideSlopeZ: number;
  froudeNumber: number;
  flowVelocity: number;
  pipeDiameter?: number;
}

export const OpenChannelCrossSection: React.FC<OpenChannelCrossSectionProps> = ({
  channelType,
  bottomWidth,
  waterDepth,
  sideSlopeZ,
  froudeNumber,
  flowVelocity,
  pipeDiameter = 1.0,
}) => {
  const width = 480;
  const height = 180;
  const cx = width / 2;
  const groundY = 150;

  let channelPath = '';
  let waterPath = '';

  const scale = 40; // px per meter

  if (channelType === 'rectangular' || channelType === 'trapezoidal') {
    const bPx = Math.max(30, bottomWidth * scale);
    const yPx = Math.min(90, waterDepth * scale);
    const bankHPx = yPx + 25;
    const topWPx = bPx + 2 * sideSlopeZ * (bankHPx / scale) * scale;
    const waterTopWPx = bPx + 2 * sideSlopeZ * waterDepth * scale;

    channelPath = `M ${cx - topWPx / 2} ${groundY - bankHPx} L ${cx - bPx / 2} ${groundY} L ${cx + bPx / 2} ${groundY} L ${cx + topWPx / 2} ${groundY - bankHPx}`;
    waterPath = `M ${cx - waterTopWPx / 2} ${groundY - yPx} L ${cx - bPx / 2} ${groundY} L ${cx + bPx / 2} ${groundY} L ${cx + waterTopWPx / 2} ${groundY - yPx} Z`;
  } else if (channelType === 'triangular') {
    const yPx = Math.min(90, waterDepth * scale);
    const bankHPx = yPx + 25;
    const topWPx = 2 * sideSlopeZ * (bankHPx / scale) * scale;
    const waterTopWPx = 2 * sideSlopeZ * waterDepth * scale;

    channelPath = `M ${cx - topWPx / 2} ${groundY - bankHPx} L ${cx} ${groundY} L ${cx + topWPx / 2} ${groundY - bankHPx}`;
    waterPath = `M ${cx - waterTopWPx / 2} ${groundY - yPx} L ${cx} ${groundY} L ${cx + waterTopWPx / 2} ${groundY - yPx} Z`;
  } else if (channelType === 'circular') {
    const rPx = Math.min(60, (pipeDiameter / 2) * scale);
    const pipeCy = groundY - rPx;
    // Circular pipe
    channelPath = `M ${cx - rPx} ${pipeCy} A ${rPx} ${rPx} 0 1 0 ${cx + rPx} ${pipeCy} A ${rPx} ${rPx} 0 1 0 ${cx - rPx} ${pipeCy}`;
    const fillFrac = Math.min(1, Math.max(0, waterDepth / pipeDiameter));
    const waterY = groundY - (fillFrac * 2 * rPx);
    waterPath = `M ${cx - rPx} ${pipeCy} A ${rPx} ${rPx} 0 0 0 ${cx + rPx} ${pipeCy} Z`;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          Hydraulic Cross-Section &amp; Water Surface
        </h4>
        <div className="text-[11px] font-mono text-slate-500">
          Velocity: {flowVelocity.toFixed(2)} m/s · Fr: {froudeNumber.toFixed(3)}
        </div>
      </div>

      <div className="w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950/70 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Ground level */}
          <line x1="20" y1={groundY} x2={width - 20} y2={groundY} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

          {/* Channel bed walls */}
          <path
            d={channelPath}
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Water fill */}
          <path
            d={waterPath}
            fill="#0284c7"
            className="opacity-45"
          />

          {/* Water surface ripple */}
          {channelType !== 'circular' && (
            <line
              x1={cx - 100}
              y1={groundY - Math.min(90, waterDepth * scale)}
              x2={cx + 100}
              y2={groundY - Math.min(90, waterDepth * scale)}
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Dimension arrows */}
          <text x={cx} y={groundY + 18} textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">
            {channelType === 'circular' ? `Diameter: ${pipeDiameter} m` : `Bottom b = ${bottomWidth} m (Side slope z = ${sideSlopeZ})`}
          </text>
        </svg>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Water Depth y = {waterDepth.toFixed(2)} m</span>
        <span className={froudeNumber < 1 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
          {froudeNumber < 1 ? 'Subcritical Flow (Fr < 1)' : 'Supercritical Flow (Fr > 1)'}
        </span>
      </div>
    </div>
  );
};
