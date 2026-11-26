import React from 'react';
import { X, Sparkles, Check, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, isPro, quickProLogin } = useAuth();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AquaCalcs Membership &amp; Pro Access
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Transparent Tools Built for Practicing Engineers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              All 28+ core calculators are completely free and open access forever with zero login barrier. Pro access unlocks advanced sensitivity parameters, process layout diagrams, and multi-format reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Free Tier */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Community Edition
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Standard access for university students, educators, and field technicians.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Access to all 28+ core civil &amp; environmental calculators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Real-time formula calculation and SI/US unit toggles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Step-by-step mathematical derivation derivations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Print calculation sheets</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Included by default</span>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="p-6 rounded-2xl border-2 border-teal-500 bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-900 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white uppercase tracking-wider shadow-xs">
                Professional
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-teal-600 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AquaCalcs Pro</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  $0 <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 font-semibold">(Granted to Registered Engineers)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Comprehensive engineering suite with process equipment diagrams and unlimited multi-format export.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>⚡ Pro Engineering Advanced Parameters &amp; Arrhenius Kinetics</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Download editable Microsoft Word (.doc) submittal reports</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Download high-resolution summary graphic cards (.png)</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Interactive Treatment Plant Process Diagrams (Activated Sludge &amp; FAO-56)</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>AI Multi-Barrier Treatment Train Generator (Gemini Powered)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-100 dark:border-teal-900/60">
                {isPro ? (
                  <div className="p-2.5 bg-teal-100 dark:bg-teal-950/80 rounded-xl text-center text-xs font-bold text-teal-800 dark:text-teal-200 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>You Have Full Pro Access Active</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                    >
                      Sign In / Register Free for Pro
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
