import React from 'react';
import { CalculatorMeta, DomainId } from '../types';
import { Translations } from '../i18n/translations';
import { Search, ChevronRight, Bookmark } from 'lucide-react';

interface CalculatorListProps {
  calculators: CalculatorMeta[];
  activeCalculatorId: string;
  onSelectCalculator: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  t: Translations;
}

export const CalculatorList: React.FC<CalculatorListProps> = ({
  calculators,
  activeCalculatorId,
  onSelectCalculator,
  searchTerm,
  onSearchChange,
  t,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of Calculator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc) => {
          const isSelected = calc.id === activeCalculatorId;
          return (
            <div
              key={calc.id}
              onClick={() => onSelectCalculator(calc.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-500/80 ring-1 ring-sky-500/50 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Domain & Reference metadata: clean text with bullet separators (anti-pill rule) */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-1.5 truncate">
                  <span className="capitalize text-sky-600 dark:text-sky-400">
                    {calc.domain.replace('-', ' ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{calc.id.toUpperCase()}</span>
                  {calc.featured && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Featured</span>
                    </>
                  )}
                </div>

                {/* Card Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {calc.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {calc.shortDescription}
                </p>
              </div>

              {/* Bottom Equation Kicker */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-500 truncate max-w-[80%]" title={calc.equationSummary}>
                  {calc.equationSummary}
                </span>
                <span className="flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Launch <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {calculators.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No calculators found matching your search term.</p>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="mt-2 text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
          >
            Reset search filter
          </button>
        </div>
      )}
    </div>
  );
};
