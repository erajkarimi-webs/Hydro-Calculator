import React, { useState, useRef } from 'react';
import { HeightAreaVolumePoint, generateDefaultHavCurve } from '../calculators/reservoirOptimizationEngine';
import {
  exportHavCurveCsv,
  downloadHavCurveTemplate,
  parseHavCurveCsv,
} from '../utils/reservoirCsvHelper';
import {
  Download,
  Upload,
  RotateCcw,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  LineChart,
} from 'lucide-react';

interface ReservoirHavCurveModalProps {
  isOpen: boolean;
  onClose: () => void;
  curve: HeightAreaVolumePoint[];
  onUpdateCurve: (newCurve: HeightAreaVolumePoint[]) => void;
  maxCapacityMcm: number;
  deadStorageMcm?: number;
  onResetToDefault?: () => void;
}

export const ReservoirHavCurveModal: React.FC<ReservoirHavCurveModalProps> = ({
  isOpen,
  onClose,
  curve,
  onUpdateCurve,
  maxCapacityMcm,
  deadStorageMcm = 50,
  onResetToDefault,
}) => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sortedCurve = [...curve].sort((a, b) => a.storageMcm - b.storageMcm);

  const handleCellChange = (index: number, field: keyof HeightAreaVolumePoint, valStr: string) => {
    const val = parseFloat(valStr);
    const safeVal = isNaN(val) ? 0 : Math.max(0, val);
    const updated = curve.map((pt, idx) => {
      if (idx === index) {
        return { ...pt, [field]: safeVal };
      }
      return pt;
    });
    onUpdateCurve(updated);
  };

  const handleAddRow = () => {
    const last = sortedCurve[sortedCurve.length - 1] || { elevationM: 265, areaKm2: 35, storageMcm: 500 };
    const newPt: HeightAreaVolumePoint = {
      elevationM: parseFloat((last.elevationM + 5).toFixed(1)),
      areaKm2: parseFloat((last.areaKm2 * 1.15).toFixed(2)),
      storageMcm: parseFloat((last.storageMcm * 1.2).toFixed(1)),
    };
    onUpdateCurve([...curve, newPt]);
    setNotification({ type: 'success', message: 'Added new elevation stage point to H-A-V curve.' });
  };

  const handleDeleteRow = (index: number) => {
    if (curve.length <= 2) {
      setNotification({ type: 'error', message: 'H-A-V curve requires at least 2 points for continuous interpolation.' });
      return;
    }
    const updated = curve.filter((_, idx) => idx !== index);
    onUpdateCurve(updated);
    setNotification({ type: 'success', message: 'Removed elevation stage point.' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setNotification({ type: 'error', message: 'Failed to read uploaded CSV file.' });
        return;
      }
      const result = parseHavCurveCsv(text);
      if (result.success) {
        onUpdateCurve(result.points);
        setNotification({ type: 'success', message: result.message });
      } else {
        setNotification({ type: 'error', message: result.message });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setNotification({ type: 'error', message: 'File read error.' });
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    if (onResetToDefault) {
      onResetToDefault();
    } else {
      const defaults = generateDefaultHavCurve(maxCapacityMcm, deadStorageMcm);
      onUpdateCurve(defaults);
    }
    setNotification({ type: 'success', message: 'Reset Height-Area-Volume curve to standard valley profile.' });
  };

  // SVG Chart dimensions
  const chartW = 380;
  const chartH = 220;
  const pad = 35;
  const maxStorage = Math.max(...curve.map((p) => p.storageMcm), maxCapacityMcm * 1.05, 10);
  const minElev = Math.min(...curve.map((p) => p.elevationM), 180);
  const maxElev = Math.max(...curve.map((p) => p.elevationM), 275);
  const maxArea = Math.max(...curve.map((p) => p.areaKm2), 40);

  const getX = (stor: number) => pad + (stor / maxStorage) * (chartW - pad * 2);
  const getYElev = (elev: number) => chartH - pad - ((elev - minElev) / Math.max(1, maxElev - minElev)) * (chartH - pad * 2);
  const getYArea = (area: number) => chartH - pad - (area / maxArea) * (chartH - pad * 2);

  const elevPath = sortedCurve.reduce((acc, pt, idx) => {
    const x = getX(pt.storageMcm);
    const y = getYElev(pt.elevationM);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaPath = sortedCurve.reduce((acc, pt, idx) => {
    const x = getX(pt.storageMcm);
    const y = getYArea(pt.areaKm2);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reservoir Height-Area-Volume (H-A-V) Curve
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {curve.length} Stage Points
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Defines the physical Elevation-Area-Capacity relationship to calculate accurate surface area A(S) for evaporation depth (E = A × E_depth) and water head for hydropower.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`px-6 py-2.5 flex items-center justify-between text-xs font-medium shrink-0 ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-900'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-b border-rose-200 dark:border-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Toolbar & CSV Management Bar */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,text/csv,text/plain"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload H-A-V CSV</span>
            </button>

            <button
              type="button"
              onClick={() => downloadHavCurveTemplate(maxCapacityMcm, deadStorageMcm)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Template</span>
            </button>

            <button
              type="button"
              onClick={() => exportHavCurveCsv(curve)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Add Stage Point</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Content Body: Split Table and SVG Live Preview Chart */}
        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* Left Table Editor (7 cols on lg) */}
          <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs flex flex-col">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>H-A-V Elevation-Area-Volume Table</span>
              <span className="text-[10px] text-slate-400">1 km² × 1 m = 1 MCM</span>
            </div>

            <div className="overflow-auto max-h-[380px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-850 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3 text-cyan-600 dark:text-cyan-400">Elevation [m]</th>
                    <th className="py-2 px-3 text-emerald-600 dark:text-emerald-400">Surface Area [km²]</th>
                    <th className="py-2 px-3 text-amber-600 dark:text-amber-400">Storage Volume [MCM]</th>
                    <th className="py-2 px-2 text-center w-10">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  {curve.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-1.5 px-3 text-slate-400 font-sans">{idx + 1}</td>
                      
                      <td className="py-1.5 px-3">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={pt.elevationM}
                          onChange={(e) => handleCellChange(idx, 'elevationM', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 rounded"
                        />
                      </td>

                      <td className="py-1.5 px-3">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={pt.areaKm2}
                          onChange={(e) => handleCellChange(idx, 'areaKm2', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded"
                        />
                      </td>

                      <td className="py-1.5 px-3">
                        <input
                          type="number"
                          step="5"
                          min="0"
                          value={pt.storageMcm}
                          onChange={(e) => handleCellChange(idx, 'storageMcm', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded"
                        />
                      </td>

                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right SVG Live Preview Chart (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  <LineChart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>H-A-V Interactive Curve Chart</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                    <span className="w-2.5 h-0.5 bg-cyan-500 rounded-full inline-block" /> Elevation (m)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full inline-block" /> Area (km²)
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  <line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke="#334155" strokeWidth="1" />
                  <line x1={pad} y1={pad} x2={pad} y2={chartH - pad} stroke="#334155" strokeWidth="1" />

                  {/* Elevation Curve (Cyan) */}
                  <path d={elevPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Area Curve (Emerald) */}
                  <path d={areaPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />

                  {/* Points */}
                  {sortedCurve.map((pt, i) => (
                    <g key={i}>
                      <circle cx={getX(pt.storageMcm)} cy={getYElev(pt.elevationM)} r="3.5" fill="#06b6d4" />
                      <circle cx={getX(pt.storageMcm)} cy={getYArea(pt.areaKm2)} r="3" fill="#10b981" />
                    </g>
                  ))}

                  {/* Axis Labels */}
                  <text x={pad} y={chartH - 12} fontSize="9" fill="#94a3b8" fontFamily="monospace">0 MCM</text>
                  <text x={chartW - pad} y={chartH - 12} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="monospace">
                    {maxStorage.toFixed(0)} MCM
                  </text>
                  <text x={chartW / 2} y={chartH - 10} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
                    Storage Volume S [MCM]
                  </text>
                </svg>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div><strong>Evaporation Physics:</strong> E_t = A(S_t) × E_depth,t. Since 1 km² × 1 m = 1 MCM, multiplying surface area in km² by depth in meters gives evaporation volume directly in MCM.</div>
              <div><strong>Hydropower Head:</strong> Net head H_eff = Z(S_t) - Z_tailwater dynamically updates with current pool water elevation.</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>Curve updates are applied to evaporation and hydropower models immediately.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            Apply &amp; Return to Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
