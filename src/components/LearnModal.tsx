import React from 'react';
import { X, BookOpen, CheckCircle, ExternalLink, Award, FileCode2 } from 'lucide-react';

interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearnModal: React.FC<LearnModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AquaCalcs Engineering Learning Hub &amp; Standards
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 max-h-[70vh] overflow-y-auto">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Peer-Reviewed Methodology &amp; Mathematical Rigor
            </h4>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">
              AquaCalcs was created to bridge theoretical environmental engineering literature with day-to-day consulting, research, and field design. Every formula is implemented without approximations, utilizing verified iterative solvers for non-linear equations (e.g. Colebrook-White implicit friction, Monod biological growth, and Meyer-Dalton vapor deficits).
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Core Reference Standards Coded into AquaCalcs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>Metcalf &amp; Eddy / AECOM</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Wastewater Engineering: Treatment and Resource Recovery (5th Edition). Monod kinetics, aeration volume, and clarifier hydraulics.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>FAO Irrigation Paper 56 &amp; 29</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Allen et al. standardized Penman-Monteith ET₀ equation, crop coefficients (Kc), and Rhodes leaching fraction for salinity control.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>US EPA Surface Water Rule</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Guidance Manual for Disinfection Profiling: CT concentration-time tables for Giardia and Virus inactivation credits.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>WHO &amp; Mara Stabilization Ponds</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Duncan Mara domestic wastewater treatment in developing countries: Anaerobic, Facultative, and Maturation kinetic pathogen die-off.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-teal-900 dark:text-teal-200">
                Multi-Format Export for Engineering Design Submittals
              </div>
              <div className="text-teal-800 dark:text-teal-300 mt-0.5 leading-relaxed">
                Every calculation card can be exported into an official Microsoft Word report (.doc), printable calculation sheet (PDF), or high-resolution PNG summary card with your project metadata and engineering stamp.
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer"
          >
            Close Learning Hub
          </button>
        </div>
      </div>
    </div>
  );
};
