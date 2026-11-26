import React from 'react';
import { StepMath } from '../types';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface ShowYourWorkProps {
  steps: StepMath[];
  reference: string;
  isOpen: boolean;
  onToggle: () => void;
  showText: string;
  hideText: string;
  stepWord: string;
  formulaWord: string;
  substWord: string;
  resultWord: string;
}

export const ShowYourWork: React.FC<ShowYourWorkProps> = ({
  steps,
  reference,
  isOpen,
  onToggle,
  showText,
  hideText,
  stepWord,
  formulaWord,
  substWord,
  resultWord,
}) => {
  return (
    <div className="w-full mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>{isOpen ? hideText : showText}</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {steps.length} {steps.length === 1 ? 'Derivation Step' : 'Derivation Steps'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-sky-600 dark:text-sky-400 font-mono">0{idx + 1}.</span>
                  {step.stepName}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>

              {/* Equation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 text-[11px] font-mono pt-1">
                <span className="text-slate-400">{formulaWord}:</span>
                <span className="md:col-span-3 text-sky-700 dark:text-sky-300 font-medium">
                  {step.formula}
                </span>
              </div>

              {/* Numeric Substitution */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 text-[11px] font-mono">
                <span className="text-slate-400">{substWord}:</span>
                <span className="md:col-span-3 text-slate-600 dark:text-slate-300">
                  {step.substitution}
                </span>
              </div>

              {/* Evaluated Value */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 text-[11px] font-mono">
                <span className="text-slate-400">{resultWord}:</span>
                <span className="md:col-span-3 font-bold text-slate-900 dark:text-white tabular-nums">
                  {step.result}
                </span>
              </div>

              {step.note && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-800/80">
                  {step.note}
                </div>
              )}
            </div>
          ))}

          {/* Governing Reference */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Governing Reference:
            </span>
            <span>{reference}</span>
          </div>
        </div>
      )}
    </div>
  );
};
