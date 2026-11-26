import React, { useState, useEffect, useMemo } from 'react';
import { DomainId, Language, UnitSystem, CalculationResult, CalculatorMeta } from './types';
import { translations } from './i18n/translations';
import { ALL_CALCULATORS_META } from './calculators/engineeringCalculations';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { CalculatorWorkspace } from './components/CalculatorWorkspace';
import { CalculatorList } from './components/CalculatorList';
import { ReportPrintModal } from './components/ReportPrintModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { LearnModal } from './components/LearnModal';
import { calcCarlsonTsi } from './calculators/engineeringCalculations';
import {
  Droplets,
  ShieldCheck,
  BookOpen,
  Layers,
  Sparkles,
  Waves,
  FlaskConical,
  Zap,
  Globe,
  Sprout,
  Filter,
  ArrowRight,
  CheckCircle2,
  Share2,
  GitBranch,
  Mail,
  Users,
  Search,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [activeDomain, setActiveDomain] = useState<DomainId | 'all'>('all');
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>('carlson-tsi');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Report Sheet Modal state
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    result: CalculationResult | null;
    inputs: Record<string, any>;
  }>({
    isOpen: false,
    result: null,
    inputs: {},
  });

  // Sync dark mode class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync dir="rtl" for Persian/Farsi
  useEffect(() => {
    if (lang === 'fa') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [lang]);

  const t = translations[lang] || translations.en;

  // Domain calculator counts across all 7 domains
  const domainCounts = useMemo(() => {
    const counts: Record<DomainId, number> = {
      'water-quality': 0,
      'hydrology-reservoirs': 0,
      'wastewater': 0,
      'geo-energy': 0,
      'wef-nexus': 0,
      'agricultural': 0,
      'desalination': 0,
    };
    ALL_CALCULATORS_META.forEach((c) => {
      if (counts[c.domain] !== undefined) {
        counts[c.domain]++;
      }
    });
    return counts;
  }, []);

  // Filtered calculators list
  const filteredCalculators = useMemo(() => {
    return ALL_CALCULATORS_META.filter((calc) => {
      const matchesDomain = activeDomain === 'all' || calc.domain === activeDomain;
      const matchesSearch =
        searchTerm.trim() === '' ||
        calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.standardReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.equationSummary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDomain && matchesSearch;
    });
  }, [activeDomain, searchTerm]);

  // Active calculator metadata
  const activeCalculator = useMemo(() => {
    return (
      ALL_CALCULATORS_META.find((c) => c.id === activeCalculatorId) ||
      ALL_CALCULATORS_META[0]
    );
  }, [activeCalculatorId]);

  const handleOpenReport = (result: CalculationResult, inputs: Record<string, any>) => {
    setReportModalData({
      isOpen: true,
      result,
      inputs,
    });
  };

  const handleDefaultOpenReport = () => {
    const defaultRes = calcCarlsonTsi({ secchi: 2.1, chla: 6.5, tp: 24 });
    setReportModalData({
      isOpen: true,
      result: defaultRes,
      inputs: { secchi: 2.1, chla: 6.5, tp: 24 },
    });
  };

  const handleSelectCalculator = (id: string) => {
    setActiveCalculatorId(id);
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectDomainAndScroll = (domain: DomainId) => {
    setActiveDomain(domain);
    const el = document.getElementById('calculators');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Domain Cards Definition (matching user screenshot 2 & 5)
  const domainCards = [
    {
      id: 'water-quality' as DomainId,
      name: 'Water Quality & Limnology',
      toolCount: domainCounts['water-quality'] || 5,
      icon: Droplets,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800',
      description: 'Trophic state, dissolved oxygen, water quality indices, and AI-powered lab interpretation.',
    },
    {
      id: 'wastewater' as DomainId,
      name: 'Wastewater Treatment & Ponds',
      toolCount: domainCounts['wastewater'] || 6,
      icon: FlaskConical,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      description: 'Technology selection, process sizing, activated sludge design, and natural stabilization ponds.',
    },
    {
      id: 'hydrology-reservoirs' as DomainId,
      name: 'Reservoir & Hydraulics',
      toolCount: domainCounts['hydrology-reservoirs'] || 5,
      icon: Waves,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
      description: 'Reservoir sizing, spillway design, culvert analysis, and open channel hydraulics.',
    },
    {
      id: 'geo-energy' as DomainId,
      name: 'Geo-Energy & Renewables',
      toolCount: domainCounts['geo-energy'] || 4,
      icon: Zap,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      description: 'Solar PV yield, pumped storage feasibility, and multi-source hydraulic energy planning.',
    },
    {
      id: 'wef-nexus' as DomainId,
      name: 'WEF Nexus & Environment',
      toolCount: domainCounts['wef-nexus'] || 4,
      icon: Globe,
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
      description: 'Water-Energy-Food trade-offs, virtual water, evapotranspiration, and life-cycle footprints.',
    },
    {
      id: 'desalination' as DomainId,
      name: 'Desalination (SWRO & BWRO)',
      toolCount: domainCounts['desalination'] || 2,
      icon: Filter,
      iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800',
      description: 'Membrane flux, osmotic pressure, Net Driving Pressure (NDP), and isobaric energy recovery.',
    },
    {
      id: 'agricultural' as DomainId,
      name: 'Agricultural Water & Salinity',
      toolCount: domainCounts['agricultural'] || 2,
      icon: Sprout,
      iconBg: 'bg-lime-50 dark:bg-lime-950/50 text-lime-600 dark:text-lime-400 border border-lime-200 dark:border-lime-800',
      description: 'Crop leaching requirement (LR), soil salinity management, and drip lateral hydraulics.',
    },
  ];

  // Featured Calculators with difficulty badges (matching user screenshot 5)
  const featuredCalculators = useMemo(() => {
    return ALL_CALCULATORS_META.filter((c) => c.featured).slice(0, 8);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Navigation (matching user screenshots) */}
      <Navbar
        currentLang={lang}
        onLanguageChange={setLang}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        unitSystem={unitSystem}
        onToggleUnitSystem={() => setUnitSystem(unitSystem === 'metric' ? 'us' : 'metric')}
        onOpenReport={handleDefaultOpenReport}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onSelectCategory={(domainId) => handleSelectDomainAndScroll(domainId as any)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenLearn={() => setIsLearnOpen(true)}
        appName={t.appName}
      />

      {/* Hero Section (Matching Screenshot 1 exactly) */}
      <section className="relative w-full bg-gradient-to-b from-[#0c3547] via-[#0d3e54] to-[#124d68] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle hydraulic curved dam / water contours background graphic */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <svg className="w-full h-full object-cover" viewBox="0 0 1440 600" fill="none">
            <path
              d="M-100,500 C300,450 600,200 1540,320 L1540,600 L-100,600 Z"
              fill="currentColor"
              className="text-cyan-400"
            />
            <path
              d="M-50,550 C400,480 800,280 1500,400"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="6 6"
              fill="none"
            />
            <path
              d="M-50,480 C350,400 750,220 1500,340"
              stroke="cyan"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="720" cy="280" r="180" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" fill="none" opacity="0.4" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur-md border border-cyan-400/30 text-[11px] font-mono tracking-wider text-cyan-200">
            <span>FREE · NO LOGIN · 28+ ENGINEERING TOOLS</span>
          </div>

          {/* Heading matching screenshot 1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.12]">
            Engineering Calculators <br />
            for <span className="text-[#38bdf8] drop-shadow-sm">Water, Energy</span> <br />
            <span className="text-[#67e8f9]">&amp; Environment</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            Professional-grade tools for water quality assessment, reservoir design, wastewater treatment, geo-energy planning, and WEF nexus analysis. Built on peer-reviewed standards.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#calculators"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => setIsLearnOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white backdrop-blur-md border border-white/20 font-semibold text-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-300" />
              <span>Learning Hub</span>
            </button>
          </div>
        </div>
      </section>

      {/* Floating 3 Stat Cards Overlapping Section (Matching Screenshot 2) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-200/50 dark:border-cyan-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                28+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Free Tools
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-800">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                15+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Standards Referenced
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/50 dark:border-sky-800">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                10K+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Engineers &amp; Researchers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section: Five Engineering Domains (Matching Screenshot 2 & 5) */}
        <section id="domains" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Five Engineering Domains
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              From limnology to geo-energy, every tool is built on published engineering standards and validated against real-world datasets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {domainCards.map((domain) => {
              const IconComp = domain.icon;
              return (
                <div
                  key={domain.id}
                  onClick={() => handleSelectDomainAndScroll(domain.id)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${domain.iconBg}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {domain.toolCount} tools
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {domain.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {domain.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore tools</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Featured Calculators (Matching Screenshot 5) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Calculators
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Most-used tools by the engineering community.
              </p>
            </div>
            <a
              href="#calculators"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCalculators.map((calc) => {
              // badge color based on difficulty
              const badgeStyle =
                calc.difficulty === 'advanced'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  : calc.difficulty === 'intermediate'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';

              return (
                <div
                  key={calc.id}
                  onClick={() => handleSelectCalculator(calc.id)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    activeCalculatorId === calc.id
                      ? 'border-teal-500 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badgeStyle}`}>
                        {calc.difficulty || 'intermediate'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {calc.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {calc.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono truncate">
                    {calc.standardReference.split('·')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Active Interactive Calculator Workspace */}
        <section id="workspace" className="space-y-4 scroll-mt-20 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold block">
                Interactive Workspace
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Live Engineering Solver
              </h2>
            </div>
            <a
              href="#calculators"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Switch Tool ({ALL_CALCULATORS_META.length} Available) ↓
            </a>
          </div>

          <CalculatorWorkspace
            calculator={activeCalculator}
            unitSystem={unitSystem}
            t={t}
            onOpenReport={handleOpenReport}
          />
        </section>

        {/* Section: Complete Calculator Inventory & Search Section */}
        <section id="calculators" className="space-y-6 scroll-mt-20 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Comprehensive Calculator Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browse, filter, and launch all 28+ validated models across 7 engineering domains.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Showing {filteredCalculators.length} of {ALL_CALCULATORS_META.length} tools
            </div>
          </div>

          {/* Domain tabs filter */}
          <CategoryNav
            activeDomain={activeDomain}
            onSelectDomain={setActiveDomain}
            domainCounts={domainCounts}
            t={t}
          />

          {/* Interactive Calculator Cards Grid */}
          <CalculatorList
            calculators={filteredCalculators}
            activeCalculatorId={activeCalculatorId}
            onSelectCalculator={handleSelectCalculator}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            t={t}
          />
        </section>

        {/* Section: "Built by engineers, for engineers" (Matching Screenshot 4 exactly) */}
        <section id="about" className="p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Text & Features List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Built by engineers, <br />
                  <span className="text-teal-600 dark:text-teal-400">for engineers</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  Every calculator on AquaCalcs is built on peer-reviewed standards and validated equations. We cite our sources, explain our methods, and give you full transparency into the calculations.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      Peer-reviewed standards:
                    </strong>{' '}
                    WHO, EPA, FAO, USBR, FHWA, Metcalf &amp; Eddy.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      Full methodology transparency:
                    </strong>{' '}
                    Every tool page includes equations, derivations, and citations.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      No login required:
                    </strong>{' '}
                    All tools work instantly in your browser — free forever.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      Mobile-friendly:
                    </strong>{' '}
                    Use in the field, lab, or classroom on any tablet, laptop, or phone.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-fidelity Lab Testing Card matching screenshot 4 */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-cyan-900/40 via-slate-900 to-slate-950 p-6 min-h-[300px] flex items-center justify-center">
                {/* Visual beaker & lab graphic */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                    <circle cx="200" cy="150" r="100" stroke="#0284c7" strokeWidth="2" strokeDasharray="6 6" />
                    <circle cx="200" cy="150" r="140" stroke="#0d9488" strokeWidth="1" />
                    <line x1="50" y1="200" x2="350" y2="200" stroke="#38bdf8" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Styled beaker container representation */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-36 h-48 rounded-b-2xl border-2 border-cyan-400/50 bg-cyan-950/30 backdrop-blur-sm relative overflow-hidden flex flex-col justify-end p-2 shadow-inner">
                    <div className="h-28 w-full bg-gradient-to-t from-teal-500/60 to-cyan-400/40 rounded-b-xl border-t border-cyan-300 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-cyan-100 uppercase tracking-widest">
                        Lab Specimen
                      </span>
                    </div>
                    {/* Measurement graduation markings */}
                    <div className="absolute top-4 right-1 space-y-3 font-mono text-[8px] text-cyan-300/70">
                      <div>— 250ml</div>
                      <div>— 200ml</div>
                      <div>— 150ml</div>
                      <div>— 100ml</div>
                      <div>— 50ml</div>
                    </div>
                  </div>
                </div>

                {/* Floating Card: "Latest: Carlson TSI / TSI = 52.1 / Mesotrophic" (Matching Screenshot 4) */}
                <div className="absolute bottom-5 left-5 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono font-medium">
                    Latest: Carlson TSI
                  </div>
                  <div className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono tracking-tight">
                    TSI = 52.1
                  </div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Mesotrophic
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Banner: "Start calculating in seconds" (Matching Screenshot 3) */}
      <section className="w-full bg-[#0c3547] text-white py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Start calculating in seconds
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          No signup. No downloads. Just open a tool and get your answer.
        </p>
        <div className="pt-2">
          <a
            href="#calculators"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            <span>Browse All 28+ Tools</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Sleek Dark Navy Footer (Matching Screenshot 3) */}
      <footer className="w-full bg-[#061824] text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Column 1: Brand & Description */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/50 text-teal-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4 fill-current" />
                </div>
                <span className="text-xl font-extrabold text-white">
                  Aqua<span className="text-teal-400">Calc</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Free, professional engineering calculators for water quality, hydraulics, wastewater treatment, geo-energy, and environmental analysis. Trusted by engineers, researchers, and students worldwide.
              </p>

              {/* Social / action icons (matching screenshot 3) */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLearnOpen(true)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                  title="Methodology Tree"
                >
                  <GitBranch className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'AquaCalcs', url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                  title="Share AquaCalcs"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                  title="Contact Engineering Support"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column 2: Tool Categories (matching screenshot 3) */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                TOOL CATEGORIES
              </h4>
              <ul className="space-y-2 text-xs">
                {domainCards.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectDomainAndScroll(cat.id)}
                      className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                      <span>{cat.name}</span>
                      <span className="text-slate-500">({cat.toolCount})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Platform (matching screenshot 3) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                PLATFORM
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#calculators" className="hover:text-white transition-colors">
                    All Tools
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsLearnOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Learning Hub
                  </button>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    Methodology &amp; Standards
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsPricingOpen(true)}
                    className="hover:text-teal-400 text-amber-400 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Pro Account</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar (matching screenshot 3) */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 AquaCalcs. All rights reserved. Free for educational and professional use.
            </div>
            <div className="font-mono">
              Built with engineering precision · Backed by peer-reviewed standards
            </div>
          </div>
        </div>
      </footer>

      {/* Official Calculation Report Modal */}
      {reportModalData.isOpen && reportModalData.result && (
        <ReportPrintModal
          calculator={activeCalculator}
          result={reportModalData.result}
          inputs={reportModalData.inputs}
          onClose={() => setReportModalData({ ...reportModalData, isOpen: false })}
          lang={lang}
        />
      )}

      {/* Community Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          onClose={() => setIsFeedbackOpen(false)}
          calculatorTitle={activeCalculator.name}
        />
      )}

      {/* Auth Modal (Sign In / Register / Pro Master Access) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Pricing / Pro Access Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenAuth={() => {
          setIsPricingOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* Learning Hub Modal */}
      <LearnModal
        isOpen={isLearnOpen}
        onClose={() => setIsLearnOpen(false)}
      />
    </div>
  );
}
