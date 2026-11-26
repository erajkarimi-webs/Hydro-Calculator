import React from 'react';
import { DomainId } from '../types';
import { translations, Translations } from '../i18n/translations';

interface CategoryNavProps {
  activeDomain: DomainId | 'all';
  onSelectDomain: (domain: DomainId | 'all') => void;
  domainCounts: Record<DomainId, number>;
  t: Translations;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeDomain,
  onSelectDomain,
  domainCounts,
  t,
}) => {
  const domains: Array<{ id: DomainId | 'all'; label: string; count: number }> = [
    {
      id: 'all',
      label: t.allCalculators,
      count: Object.values(domainCounts).reduce((a, b) => a + b, 0),
    },
    {
      id: 'water-quality',
      label: t.domains['water-quality'],
      count: domainCounts['water-quality'] || 5,
    },
    {
      id: 'hydrology-reservoirs',
      label: t.domains['hydrology-reservoirs'],
      count: domainCounts['hydrology-reservoirs'] || 5,
    },
    {
      id: 'wastewater',
      label: t.domains['wastewater'],
      count: domainCounts['wastewater'] || 5,
    },
    {
      id: 'geo-energy',
      label: t.domains['geo-energy'],
      count: domainCounts['geo-energy'] || 4,
    },
    {
      id: 'wef-nexus',
      label: t.domains['wef-nexus'],
      count: domainCounts['wef-nexus'] || 4,
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 min-w-max">
        {domains.map((d) => {
          const isActive = activeDomain === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDomain(d.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{d.label}</span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                ({d.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
