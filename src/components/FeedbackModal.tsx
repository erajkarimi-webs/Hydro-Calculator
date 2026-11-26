import React, { useState } from 'react';
import { MessageSquare, X, Send, Check } from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
  calculatorTitle?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, calculatorTitle }) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general'>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Engineering Feedback &amp; Verification
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Verification Report Submitted
            </div>
            <p className="text-xs text-slate-500">
              Thank you for contributing to the continuous validation of AquaCalcs open-access models!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-xs text-slate-500">
              {calculatorTitle
                ? `Reporting feedback for: ${calculatorTitle}`
                : 'Share formula corrections, parameter boundary cases, or new tool suggestions.'}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  feedbackType === 'bug'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Formula Bug / Discrepancy
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('suggestion')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  feedbackType === 'suggestion'
                    ? 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-sky-950/30 dark:border-sky-800 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Tool Suggestion
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Your Email (Optional, for peer review follow-up)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@institution.edu"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Technical Observations / Equations
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Specify equation conditions, textbook citation, or boundary observations..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
