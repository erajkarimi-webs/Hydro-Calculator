import React, { useState } from 'react';
import { Language, UnitSystem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Droplets,
  User,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onToggleDark: () => void;
  unitSystem: UnitSystem;
  onToggleUnitSystem: () => void;
  onOpenReport: () => void;
  onOpenFeedback: () => void;
  onSelectCategory: (domainId: string) => void;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onOpenLearn: () => void;
  appName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  isDark,
  onToggleDark,
  unitSystem,
  onToggleUnitSystem,
  onOpenFeedback,
  onSelectCategory,
  onOpenAuth,
  onOpenPricing,
  onOpenLearn,
}) => {
  const { user, isPro, logout } = useAuth();
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const categories = [
    { id: 'water-quality', name: 'Water Quality & Limnology' },
    { id: 'wastewater', name: 'Wastewater Treatment & Ponds' },
    { id: 'hydrology-reservoirs', name: 'Reservoir & Hydraulics' },
    { id: 'geo-energy', name: 'Geo-Energy & Renewables' },
    { id: 'wef-nexus', name: 'WEF Nexus & Environment' },
    { id: 'agricultural', name: 'Agricultural Water & Irrigation' },
    { id: 'desalination', name: 'Desalination (SWRO & BWRO)' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (matching user screenshots) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 tracking-tight whitespace-nowrap shrink-0 group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0c3547] border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-xs group-hover:bg-[#0f435c] transition-colors">
            <Droplets className="w-4 h-4 fill-current" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            Aqua<span className="text-teal-600 dark:text-teal-400">Calc</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links (matching user screenshots) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          {/* Tools with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              onMouseEnter={() => setToolsDropdownOpen(true)}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-2"
            >
              <span>Tools</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {toolsDropdownOpen && (
              <div
                onMouseLeave={() => setToolsDropdownOpen(false)}
                className="absolute left-0 top-full mt-1 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase font-mono border-b border-slate-100 dark:border-slate-800">
                  Engineering Domains
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setToolsDropdownOpen(false);
                      const el = document.getElementById('calculators');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenLearn}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Learn
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>

          <a
            href="#about"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            About
          </a>

          <button
            type="button"
            onClick={onOpenFeedback}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Pro button, Start Calculating, Utilities, and Account */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Unit Toggle Button */}
          <button
            type="button"
            onClick={onToggleUnitSystem}
            title="Toggle Metric (SI) / US Customary"
            className="hidden sm:inline-flex px-2.5 py-1 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {unitSystem === 'metric' ? 'SI Units' : 'US Units'}
          </button>

          {/* Language Switcher */}
          <div className="hidden lg:flex items-center text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('fa')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                currentLang === 'fa'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="فارسی (Persian)"
            >
              فا
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('es')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                currentLang === 'es'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Español"
            >
              ES
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDark}
            aria-label="Toggle theme"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Pro Pill Button (Matching user screenshot) */}
          <button
            type="button"
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Pro</span>
          </button>

          {/* Start Calculating Button (Matching user screenshot teal button) */}
          <a
            href="#calculators"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Start Calculating</span>
          </a>

          {/* Account & Profile Menu */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden xl:inline">
                  {user.name.split(' ')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {user && userMenuOpen && (
              <div
                onMouseLeave={() => setUserMenuOpen(false)}
                className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 px-3 z-50 space-y-3"
              >
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pro Verified Account</span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Account Privileges &amp; Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
