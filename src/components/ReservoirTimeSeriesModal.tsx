import React, { useState, useRef } from 'react';
import {
  MonthlyTimeSeriesRow,
  exportMonthlyTimeSeriesCsv,
  downloadCsvTemplate,
  parseMonthlyTimeSeriesCsv,
} from '../utils/reservoirCsvHelper';
import {
  Download,
  Upload,
  RotateCcw,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Percent,
} from 'lucide-react';

interface ReservoirTimeSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: MonthlyTimeSeriesRow[];
  onUpdateRows: (newRows: MonthlyTimeSeriesRow[]) => void;
  onResetToBaseline: () => void;
  years: number;
}

export const ReservoirTimeSeriesModal: React.FC<ReservoirTimeSeriesModalProps> = ({
  isOpen,
  onClose,
  rows,
  onUpdateRows,
  onResetToBaseline,
  years,
}) => {
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>('all');
  const [importTarget, setImportTarget] = useState<'all' | 'inflow' | 'drinking' | 'irrigation' | 'industry' | 'environmental' | 'evaporation'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Aggregate sums
  const totalInflow = rows.reduce((sum, r) => sum + r.inflowMcm, 0);
  const totalDrinking = rows.reduce((sum, r) => sum + r.drinkingMcm, 0);
  const totalIrrig = rows.reduce((sum, r) => sum + r.irrigationMcm, 0);
  const totalIndus = rows.reduce((sum, r) => sum + r.industryMcm, 0);
  const totalEnv = rows.reduce((sum, r) => sum + r.environmentalMcm, 0);
  const avgEvapDepth = rows.length > 0 ? rows.reduce((sum, r) => sum + r.evaporationDepthM, 0) / rows.length : 0.08;
  const totalDemand = totalDrinking + totalIrrig + totalIndus + totalEnv;

  const filteredRows = selectedYearFilter === 'all'
    ? rows
    : rows.filter((r) => r.year === selectedYearFilter);

  const handleCellChange = (monthIdx: number, field: keyof MonthlyTimeSeriesRow, valStr: string) => {
    const val = parseFloat(valStr);
    const safeVal = isNaN(val) ? 0 : Math.max(0, val);
    const updated = rows.map((r) => {
      if (r.month === monthIdx) {
        return { ...r, [field]: safeVal };
      }
      return r;
    });
    onUpdateRows(updated);
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
      const result = parseMonthlyTimeSeriesCsv(text, rows, importTarget);
      if (result.success) {
        onUpdateRows(result.updatedRows);
        setNotification({ type: 'success', message: result.message });
      } else {
        setNotification({ type: 'error', message: result.message });
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setNotification({ type: 'error', message: 'File read error.' });
    };
    reader.readAsText(file);
  };

  const applyScaleFactor = (field: 'inflowMcm' | 'irrigationMcm' | 'evaporationDepthM', factor: number) => {
    const updated = rows.map((r) => ({
      ...r,
      [field]: parseFloat((r[field] * factor).toFixed(3)),
    }));
    onUpdateRows(updated);
    setNotification({
      type: 'success',
      message: `Scaled ${field === 'inflowMcm' ? 'inflows' : field === 'irrigationMcm' ? 'irrigation demands' : 'evaporation depth'} by ${factor > 1 ? '+' : ''}${((factor - 1) * 100).toFixed(0)}%.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Hydrology, Demands &amp; Evaporation Table
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {rows.length} Months ({years} Yr{years > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Input raw monthly data in MCM for inflows, individual demands, and evaporation depths/losses via CSV upload or direct cell editing.
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
          {/* CSV Import Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden File Input */}
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
              <span>Upload CSV File</span>
            </button>

            {/* Target Column Selector for Single-Demand CSV */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Target:</span>
              <select
                value={importTarget}
                onChange={(e) => setImportTarget(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Auto-Map Header (All-in-One CSV)</option>
                <option value="inflow">Inflows Time Series Only</option>
                <option value="drinking">Drinking Demand Only</option>
                <option value="irrigation">Irrigation Demand Only</option>
                <option value="industry">Industrial Demand Only</option>
                <option value="environmental">Environmental Flow Only</option>
                <option value="evaporation">Evaporation Losses Only</option>
              </select>
            </div>

            {/* Download Actions */}
            <button
              type="button"
              onClick={() => downloadCsvTemplate(years)}
              title="Download empty CSV template with standard column headers"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Template</span>
            </button>

            <button
              type="button"
              onClick={() => exportMonthlyTimeSeriesCsv(rows, `reservoir_timeseries_${years}yr.csv`)}
              title="Export current table values to CSV"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Quick Adjustment & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyScaleFactor('inflowMcm', 1.1)}
              title="Boost all monthly inflows by 10%"
              className="px-2 py-1 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              +10% Inflows
            </button>

            <button
              type="button"
              onClick={() => applyScaleFactor('irrigationMcm', 0.85)}
              title="Curtail agricultural irrigation demands by 15% for drought stress testing"
              className="px-2 py-1 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              -15% Irrigation
            </button>

            <button
              type="button"
              onClick={onResetToBaseline}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* Aggregates Summary Strip */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Inflow</span>
            <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400 text-sm">
              {totalInflow.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] font-normal text-slate-400">MCM</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Drinking</span>
            <span className="font-bold font-mono text-teal-600 dark:text-teal-400 text-sm">
              {totalDrinking.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] font-normal text-slate-400">MCM</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Irrigation</span>
            <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">
              {totalIrrig.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] font-normal text-slate-400">MCM</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Industry</span>
            <span className="font-bold font-mono text-blue-600 dark:text-blue-400 text-sm">
              {totalIndus.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] font-normal text-slate-400">MCM</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Env. Flow</span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
              {totalEnv.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] font-normal text-slate-400">MCM</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Evaporation</span>
            <span className="font-bold font-mono text-purple-600 dark:text-purple-400 text-sm">
              {avgEvapDepth.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">m/mo</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Downstream</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
              {totalDemand.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] font-normal text-slate-400">MCM</span>
            </span>
          </div>
        </div>

        {/* Year Filter Tabs */}
        {years > 1 && (
          <div className="px-6 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 shrink-0 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-400 mr-2">Filter Horizon:</span>
            <button
              type="button"
              onClick={() => setSelectedYearFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedYearFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All {years} Years ({rows.length} Mo)
            </button>
            {Array.from({ length: years }).map((_, idx) => (
              <button
                key={idx + 1}
                type="button"
                onClick={() => setSelectedYearFilter(idx + 1)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedYearFilter === idx + 1
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Year {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Editable Data Table */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono uppercase text-slate-600 dark:text-slate-300 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Period / Month</th>
                  <th className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400">Inflow (MCM)</th>
                  <th className="py-2.5 px-3 text-teal-600 dark:text-teal-400">Drinking (MCM)</th>
                  <th className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Irrigation (MCM)</th>
                  <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400">Industry (MCM)</th>
                  <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">Env. Flow (MCM)</th>
                  <th className="py-2.5 px-3 text-purple-600 dark:text-purple-400">Evap. Depth (m)</th>
                  <th className="py-2.5 px-3 text-right">Total Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {filteredRows.map((r) => {
                  const monthTotalDemand = r.drinkingMcm + r.irrigationMcm + r.industryMcm + r.environmentalMcm;
                  return (
                    <tr key={r.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-1.5 px-3 font-sans font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {r.label}
                      </td>

                      {/* Inflow Cell */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={r.inflowMcm}
                          onChange={(e) => handleCellChange(r.month, 'inflowMcm', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 rounded focus:ring-1 focus:ring-cyan-500"
                        />
                      </td>

                      {/* Drinking Demand Cell */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={r.drinkingMcm}
                          onChange={(e) => handleCellChange(r.month, 'drinkingMcm', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded focus:ring-1 focus:ring-teal-500"
                        />
                      </td>

                      {/* Irrigation Demand Cell */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="1.0"
                          min="0"
                          value={r.irrigationMcm}
                          onChange={(e) => handleCellChange(r.month, 'irrigationMcm', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </td>

                      {/* Industry Demand Cell */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={r.industryMcm}
                          onChange={(e) => handleCellChange(r.month, 'industryMcm', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Environmental Flow Cell */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={r.environmentalMcm}
                          onChange={(e) => handleCellChange(r.month, 'environmentalMcm', e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Evaporation Depth Cell */}
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.005"
                            min="0"
                            max="1.5"
                            value={r.evaporationDepthM}
                            onChange={(e) => handleCellChange(r.month, 'evaporationDepthM', e.target.value)}
                            className="w-20 px-2 py-1 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded focus:ring-1 focus:ring-purple-500"
                          />
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">m</span>
                        </div>
                      </td>

                      {/* Total Demand Read-Only */}
                      <td className="py-1.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                        {monthTotalDemand.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">MCM</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>Table changes are automatically linked to the optimization engine in real time.</span>
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
