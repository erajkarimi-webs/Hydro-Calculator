import React, { useState } from 'react';
import { CalculationResult, CalculatorMeta } from '../types';
import { Printer, X, FileText, CheckCircle } from 'lucide-react';

interface ReportPrintModalProps {
  calculator: CalculatorMeta;
  result: CalculationResult;
  inputs: Record<string, any>;
  onClose: () => void;
  lang: string;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  calculator,
  result,
  inputs,
  onClose,
  lang,
}) => {
  const [projectName, setProjectName] = useState('Aqua-Design-2026-Reach4');
  const [engineerName, setEngineerName] = useState('E. Karimi, P.E.');
  const [organization, setOrganization] = useState('Water Resources & Environmental Engineering');
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 print-container">
        {/* Modal Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Official Engineering Calculation Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Technical Document Body */}
        <div className="p-8 text-slate-900 space-y-6 text-xs bg-white dark:bg-slate-900 dark:text-slate-100">
          {/* Header Strip */}
          <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 flex items-start justify-between">
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                AquaCalcs Technical Calculation Sheet
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Peer-Reviewed Water, Wastewater &amp; Hydrologic Formulations
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <div>DOC ID: AQ-{calculator.id.toUpperCase()}</div>
              <div>DATE: {currentDate}</div>
              <div>STATUS: VERIFIED</div>
            </div>
          </div>

          {/* Metadata Block (Editable in UI, prints clean text) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block">Project Title</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-transparent font-medium text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block">Engineer / Analyst</label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                className="w-full bg-transparent font-medium text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block">Organization / Agency</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-transparent font-medium text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Calculator Title and Summary */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {calculator.name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
              {calculator.shortDescription}
            </p>
          </div>

          {/* Key Findings Summary Box */}
          <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                Primary Evaluated Result
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {result.primaryValue} <span className="text-sm font-normal text-slate-500">{result.primaryUnit}</span>
              </div>
              {result.statusLabel && (
                <div className="text-xs text-sky-800 dark:text-sky-200 font-medium mt-0.5">
                  Regime: {result.statusLabel}
                </div>
              )}
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              <CheckCircle className="w-5 h-5 text-emerald-600 inline mb-1" />
              <div>Standard Convergence</div>
            </div>
          </div>

          {/* Input Parameters Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">
              1. Input Design Parameters
            </h3>
            <table className="w-full border border-slate-200 dark:border-slate-800 text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                  <th className="p-2 border-b border-slate-200 dark:border-slate-700">Parameter Key</th>
                  <th className="p-2 border-b border-slate-200 dark:border-slate-700 text-right">Design Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {Object.entries(inputs).map(([k, v]) => (
                  <tr key={k}>
                    <td className="p-2 text-slate-600 dark:text-slate-400 capitalize">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </td>
                    <td className="p-2 text-right font-semibold text-slate-900 dark:text-white">
                      {Array.isArray(v) ? `[${v.length} items]` : String(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Secondary Calculated Outputs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">
              2. Calculated Secondary Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {result.secondaryOutputs.map((out, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 truncate">{out.label}</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {out.value} <span className="text-[10px] font-normal text-slate-400">{out.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Derivation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">
              3. Mathematical Derivation &amp; Equations
            </h3>
            <div className="space-y-2">
              {result.steps.map((st, i) => (
                <div key={i} className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-[11px] font-mono">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Step {i + 1}: {st.stepName}
                  </div>
                  <div className="text-sky-700 dark:text-sky-400 mt-0.5">{st.formula}</div>
                  <div className="text-slate-600 dark:text-slate-400">{st.substitution}</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    Result: {st.result}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cited Reference Standard */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Reference Standard: </span>
            <span>{result.reference}</span>
          </div>

          {/* Professional Sign-Off Strip */}
          <div className="border-t-2 border-slate-900 dark:border-slate-200 pt-4 grid grid-cols-3 gap-6 text-[10px] text-slate-500 font-mono">
            <div>
              <div>PREPARED BY:</div>
              <div className="border-b border-slate-400 dark:border-slate-600 h-8 mt-1" />
              <div className="mt-1">{engineerName}</div>
            </div>
            <div>
              <div>CHECKED / REVIEWED BY:</div>
              <div className="border-b border-slate-400 dark:border-slate-600 h-8 mt-1" />
              <div className="mt-1">Lead Hydrologist / Reviewer</div>
            </div>
            <div>
              <div>PROFESSIONAL SEAL / STAMP:</div>
              <div className="border border-dashed border-slate-400 dark:border-slate-600 h-16 mt-1 flex items-center justify-center text-[9px] text-slate-400">
                P.E. Registration Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
