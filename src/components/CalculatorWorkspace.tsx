import React, { useState, useMemo } from 'react';
import { CalculatorMeta, CalculationResult, UnitSystem } from '../types';
import { Translations } from '../i18n/translations';
import {
  calcCarlsonTsi,
  calcStreeterPhelps,
  calcSequentPeak,
  calcPenmanMonteith,
  calcActivatedSludge,
  calcPumpedStorage,
  calcWaterDensityViscosity,
  calcPipeHeadLoss,
  calcManningFlow,
  calcRationalMethod,
  calcScsRunoff,
  calcStokesSettling,
  calcDilution,
  calcLangelierRyznar,
  calcTurbineSelection,
  calcCropWater,
  calcReservoirEvap,
  calcChlorineContactTank,
  calcWaterEnergyFootprint,
  calcPumpSizing,
  calcChlorineCT,
  calcRapidSandFilter,
  calcIrrigationUniformity,
  calcPondsTreatment,
  calcDesalinationRo,
  calcAgriculturalSalinity,
  calcLateralHydraulics,
  calcAiTreatmentTrain,
  calcReservoirOptimization,
} from '../calculators/engineeringCalculations';
import { CarlsonGauge } from './Visualizers/CarlsonGauge';
import { StreeterPhelpsSagCurve } from './Visualizers/StreeterPhelpsSagCurve';
import { RipplMassCurve } from './Visualizers/RipplMassCurve';
import { ActivatedSludgeSchematic } from './Visualizers/ActivatedSludgeSchematic';
import { ActivatedSludgeProcessDiagram } from './Visualizers/ActivatedSludgeProcessDiagram';
import { PumpedStorageVisualizer } from './Visualizers/PumpedStorageVisualizer';
import { PenmanMonteithChart } from './Visualizers/PenmanMonteithChart';
import { PenmanMonteithProcessDiagram } from './Visualizers/PenmanMonteithProcessDiagram';
import { OpenChannelCrossSection } from './Visualizers/OpenChannelCrossSection';
import { CropWaterChart } from './Visualizers/CropWaterChart';
import { ReservoirOptimizationVisualizer } from './Visualizers/ReservoirOptimizationVisualizer';
import { ReservoirTimeSeriesModal } from './ReservoirTimeSeriesModal';
import { ReservoirHavCurveModal } from './ReservoirHavCurveModal';
import { generateMonthlyBaselineRows, MonthlyTimeSeriesRow } from '../utils/reservoirCsvHelper';
import { generateDefaultHavCurve, HeightAreaVolumePoint } from '../calculators/reservoirOptimizationEngine';
import { ShowYourWork } from './ShowYourWork';
import { downloadWordReport, downloadPngReport } from '../utils/reportExport';
import { useAuth } from '../context/AuthContext';
import { Share2, Check, Printer, Info, RotateCcw, FileText, Image as ImageIcon, Sparkles, Brain, Download, Play, Sliders, ChevronDown, ChevronUp, FileSpreadsheet, Table, Layers, Cpu, Zap, Activity, ShieldCheck } from 'lucide-react';

interface CalculatorWorkspaceProps {
  calculator: CalculatorMeta;
  unitSystem: UnitSystem;
  t: Translations;
  onOpenReport: (result: CalculationResult, inputs: Record<string, any>) => void;
}

export const CalculatorWorkspace: React.FC<CalculatorWorkspaceProps> = ({
  calculator,
  unitSystem,
  t,
  onOpenReport,
}) => {
  const [showDerivation, setShowDerivation] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Carlson TSI Inputs
  const [carlsonInputs, setCarlsonInputs] = useState({ secchi: 2.1, chla: 6.5, tp: 24 });

  // 2. Streeter-Phelps Inputs
  const [streeterInputs, setStreeterInputs] = useState({
    kd: 0.25,
    kr: 0.55,
    L0: 28.0,
    D0: 2.0,
    DOsat: 9.1,
    velocity: 24.0, // km/day
    reachDays: 10,
  });

  // 3. Sequent Peak Inputs (Full 12-month text inputs)
  const [sequentInputs, setSequentInputs] = useState({
    monthlyInflows: [12, 16, 25, 38, 22, 14, 8, 5, 4, 7, 9, 11],
    monthlyDemands: [15, 15, 16, 16, 18, 18, 18, 18, 17, 16, 15, 15],
  });

  // 4. FAO-56 Penman-Monteith Inputs
  const [penmanInputs, setPenmanInputs] = useState({
    tempMean: 22.5,
    solarRad: 21.0,
    windSpeed: 2.4,
    relHumidity: 52,
    elevation: 350,
  });

  // 5. Activated Sludge Inputs
  const [sludgeInputs, setSludgeInputs] = useState({
    flowQ: 10000,
    bodIn: 220,
    bodOut: 12,
    mlss: 3000,
    srt: 8,
    tknIn: 38,
    tknOut: 2.5,
  });

  // 6. Pumped Storage Hydropower Inputs
  const [pumpedInputs, setPumpedInputs] = useState({
    upperVolMm3: 15.0,
    lowerVolMm3: 18.0,
    maxDrawdownPct: 35, // %
    headM: 320,
    penstockDiamM: 3.5,
    penstockLengthM: 1200,
    systemType: 'reversible' as 'reversible' | 'separate',
    flowGenM3s: 45,
    genHours: 6,
    pumpingPowerMw: 160,
    pumpHours: 7,
    etaTurbine: 0.91,
    etaPump: 0.86,
  });

  // 7. Water Density & Viscosity Inputs
  const [tempCInput, setTempCInput] = useState(20);
  const [pressureAtmInput, setPressureAtmInput] = useState(1.0);

  // 8. Pipe Head Loss Inputs
  const [pipeInputs, setPipeInputs] = useState({
    flowM3s: 0.12,
    diamM: 0.35,
    lengthM: 850,
    roughnessMm: 0.045,
    hwC: 130,
    tempC: 20,
    sumK: 4.5,
  });

  // 9. Manning Open Channel Flow Inputs
  const [manningInputs, setManningInputs] = useState({
    channelType: 'trapezoidal' as 'trapezoidal' | 'rectangular' | 'triangular' | 'circular',
    bottomWidth: 3.0,
    waterDepth: 1.4,
    sideSlopeZ: 1.5,
    pipeDiameter: 1.2,
    bedSlopeS0: 0.0015,
    manningN: 0.025,
  });

  // 10. Rational Method Inputs
  const [rationalInputs, setRationalInputs] = useState({
    runoffC: 0.55,
    rainIntensityMmHr: 45,
    areaHa: 18,
  });

  // 11. SCS Runoff Curve Number Inputs
  const [scsInputs, setScsInputs] = useState({
    curveNumber: 74,
    precipitationMm: 65,
  });

  // 12. Stokes Settling Inputs
  const [stokesInputs, setStokesInputs] = useState({
    particleDiamMm: 0.08,
    particleDensity: 2650,
    waterTempC: 20,
  });

  // 13. Dilution Mass Balance Inputs
  const [dilutionInputs, setDilutionInputs] = useState({
    streamFlow: 8.5,
    streamConc: 1.2,
    effluentFlow: 0.65,
    effluentConc: 48,
    wqsStandard: 5.0,
  });

  // 14. Langelier & Ryznar Inputs
  const [langelierInputs, setLangelierInputs] = useState({
    pH: 7.8,
    tempC: 22,
    tdsMgL: 320,
    calciumHardnessMgL: 140,
    alkalinityMgL: 125,
  });

  // 15. Turbine Selection Inputs
  const [turbineInputs, setTurbineInputs] = useState({
    headM: 85,
    flowM3s: 14,
    rpm: 450,
    etaTurbine: 0.90,
  });

  // 16. Crop Water Requirement Inputs
  const [cropInputs, setCropInputs] = useState({
    cropName: 'Maize / Field Corn',
    cropKc: 1.15,
    et0MmDay: 5.2,
    effectiveRainMmDay: 1.2,
    soilAWCmmM: 140,
    rootDepthM: 1.0,
    madPct: 50,
    irrigationEfficiencyPct: 75,
  });

  // 17. Reservoir Evaporation Inputs
  const [evapInputs, setEvapInputs] = useState({
    surfaceAreaHa: 250,
    latitudeDeg: 34.5,
    elevationM: 420,
    tempC: 24,
    windSpeedMps: 3.2,
    relHumidityPct: 45,
    panEvapMmMonth: 180,
    panCoeff: 0.75,
  });

  // 18. Chlorine Contact Tank Sizing Inputs
  const [tankInputs, setTankInputs] = useState({
    peakFlowM3Hr: 600,
    reqT10Minutes: 30,
    bafflingFactor: 0.65,
    waterDepthM: 2.5,
    channelWidthM: 3.0,
  });

  // 19. Water-Energy Nexus Footprint Inputs
  const [footprintInputs, setFootprintInputs] = useState({
    volM3Day: 25000,
    abstractionKwhM3: 0.35,
    treatmentKwhM3: 0.22,
    distributionKwhM3: 0.45,
    wastewaterKwhM3: 0.55,
    electricityCostPerKwh: 0.12,
    gridCo2KgKwh: 0.45,
  });

  // 20. Centrifugal Pump Sizing & Affinity Inputs
  const [pumpInputs, setPumpInputs] = useState({
    flowM3Hr: 350,
    totalHeadM: 45,
    baseRpm: 1450,
    baseDiamMm: 280,
    pumpEfficiencyPct: 78,
    motorEfficiencyPct: 92,
    scaledRpm: 1750,
    scaledDiamMm: 280,
    suctionLiftM: 2.5,
    suctionFrictionM: 0.8,
  });

  // 21. Chlorine Disinfection CT & Pathogen Inputs
  const [chlorineCtInputs, setChlorineCtInputs] = useState({
    freeChlorineMgL: 1.2,
    contactTimeMin: 45,
    waterTempC: 15,
    waterPH: 7.5,
    targetLogGiardia: 3.0,
  });

  // 22. Rapid Sand Filter Inputs
  const [sandFilterInputs, setSandFilterInputs] = useState({
    filtRateM3M2Hr: 8.5,
    bedDepthM: 0.9,
    grainDiamMm: 0.55,
    porosity: 0.42,
    sphericity: 0.85,
    waterTempC: 20,
  });

  // 23. Irrigation Uniformity Inputs
  const [uniformityInputs, setUniformityInputs] = useState({
    depthsMm: [14, 16, 12, 15, 18, 11, 13, 17, 19, 15, 14, 16],
    testDurationHours: 1.0,
    pressureKpa: 250,
    lateralSpacingM: 12,
    emitterSpacingM: 12,
  });

  // 24. Waste Stabilization Ponds Inputs
  const [pondsInputs, setPondsInputs] = useState({
    flowRate: 5000,
    bodIn: 240,
    temp: 20,
    coliformIn: 10000000,
    maturationPondsCount: 2,
    proTheta: 1.05,
  });

  // 25. Desalination RO Inputs
  const [desalInputs, setDesalInputs] = useState({
    feedTds: 35000,
    feedFlow: 450,
    recovery: 45,
    temp: 22,
    saltRejection: 99.7,
    erdEfficiency: 95,
    pumpEfficiency: 85,
    proFlux: 14,
  });

  // 26. Agricultural Salinity Inputs
  const [salinityInputs, setSalinityInputs] = useState({
    ecw: 1.8,
    ece: 2.5,
    etc: 5.5,
    irrEfficiency: 85,
    cropName: 'Tomato',
  });

  // 27. Lateral Hydraulics Inputs
  const [lateralInputs, setLateralInputs] = useState({
    pipeDiameter: 16,
    lateralLength: 100,
    emitterSpacing: 0.5,
    emitterDischarge: 2.2,
    operatingPressure: 1.5,
    roughnessC: 150,
  });

  // 28. AI Multi-Barrier Advisor Inputs & State
  const [advisorInputs, setAdvisorInputs] = useState({
    waterType: 'Municipal Secondary Effluent',
    flowRate: 10000,
    turbidity: 25,
    bod: 180,
    tds: 750,
    coliform: 100000,
    targetStandard: 'WHO / EPA Drinking Water Standard',
    hasHeavyMetals: false,
    hasOrganicMicropollutants: true,
  });
  const [advisorReport, setAdvisorReport] = useState<string | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  // 29. Reservoir Operation Optimization (LP Simplex & Evolutionary Algorithm) Inputs
  const [resOptInputs, setResOptInputs] = useState({
    maxCapacityMcm: 500,
    deadStorageMcm: 50,
    initialStorageMcm: 350,
    maxReleaseM3s: 60,
    spillwayCapacityM3s: 450,
    maxTurbineReleaseM3s: 45,
    headLossM: 2.5,
    turbineEfficiency: 0.86,
    energyDemandGwhPerPeriod: 12.0,
    drinkingDemandMcm: 15.0,
    irrigationDemandMcm: 35.0,
    industryDemandMcm: 8.0,
    environmentalFlowMcm: 5.0,
    weightDrinking: 5.0,
    weightIrrigation: 3.0,
    weightIndustry: 2.5,
    weightEnvironmental: 4.0,
    weightHydropower: 3.5,
    weightStorage: 4.5,
    weightReliability: 5.0,
    weightVulnerability: 4.0,
    weightResiliency: 4.0,
    timeStep: 'monthly' as 'monthly' | 'weekly',
    years: 3,
    hydrologyScenario: 'realistic_cycle' as 'realistic_cycle' | 'drought_stress' | 'average_normal' | 'wet_flood',
    meanAnnualInflowMcm: 720,
    ruleCurveMode: 'derive_optimal' as 'none' | 'apply_target' | 'derive_optimal',
    userTargetStoragePct: 80,
    algorithm: 'lp-simplex' as 'lp-simplex' | 'evolutionary',
    eaGenerations: 60,
    eaPopulationSize: 35,
  });

  // Custom Monthly Time Series State (Inflows, Demands, Evaporation)
  const [useCustomTimeSeries, setUseCustomTimeSeries] = useState(false);
  const [isTimeSeriesModalOpen, setIsTimeSeriesModalOpen] = useState(false);
  const [monthlyTimeSeriesRows, setMonthlyTimeSeriesRows] = useState<MonthlyTimeSeriesRow[]>(() =>
    generateMonthlyBaselineRows(3, 720, 'realistic_cycle', {
      drinkingMcm: 15.0,
      irrigationMcm: 35.0,
      industryMcm: 8.0,
      environmentalMcm: 5.0,
    })
  );

  const handleYearsChange = (newYears: number) => {
    setResOptInputs((prev) => ({ ...prev, years: newYears }));
    setMonthlyTimeSeriesRows((prevRows) => {
      const targetCount = newYears * 12;
      const baseline = generateMonthlyBaselineRows(newYears, resOptInputs.meanAnnualInflowMcm, resOptInputs.hydrologyScenario, {
        drinkingMcm: resOptInputs.drinkingDemandMcm,
        irrigationMcm: resOptInputs.irrigationDemandMcm,
        industryMcm: resOptInputs.industryDemandMcm,
        environmentalMcm: resOptInputs.environmentalFlowMcm,
      });
      if (prevRows.length === targetCount) return prevRows;
      return baseline.map((b, idx) => (prevRows[idx] ? { ...prevRows[idx], month: b.month, year: b.year, monthInYear: b.monthInYear, label: b.label } : b));
    });
  };

  const handleResetTimeSeriesBaseline = () => {
    const baseline = generateMonthlyBaselineRows(resOptInputs.years, resOptInputs.meanAnnualInflowMcm, resOptInputs.hydrologyScenario, {
      drinkingMcm: resOptInputs.drinkingDemandMcm,
      irrigationMcm: resOptInputs.irrigationDemandMcm,
      industryMcm: resOptInputs.industryDemandMcm,
      environmentalMcm: resOptInputs.environmentalFlowMcm,
    });
    setMonthlyTimeSeriesRows(baseline);
  };

  // Height-Area-Volume (H-A-V) Curve State
  const [havCurve, setHavCurve] = useState<HeightAreaVolumePoint[]>(() => generateDefaultHavCurve(500));
  const [isHavModalOpen, setIsHavModalOpen] = useState(false);
  const [tailwaterElevationM, setTailwaterElevationM] = useState<number>(195);

  // Explicit Execution State for Reservoir Operation Optimization (User-Triggered Analysis)
  const [isReservoirOptimizing, setIsReservoirOptimizing] = useState(false);
  const [reservoirExecutedOutput, setReservoirExecutedOutput] = useState<{
    inputs: any;
    result: CalculationResult;
    algorithm: string;
    timestamp: string;
  }>(() => {
    const initialInputs = {
      ...resOptInputs,
      useCustomTimeSeries: false,
      havCurve: generateDefaultHavCurve(500),
      tailwaterElevationM: 195,
      customInflowsMcm: undefined,
      customDrinkingDemandsMcm: undefined,
      customIrrigationDemandsMcm: undefined,
      customIndustryDemandsMcm: undefined,
      customEnvironmentalDemandsMcm: undefined,
      customEvaporationDepthsM: undefined,
    };
    return {
      inputs: initialInputs,
      result: calcReservoirOptimization(initialInputs),
      algorithm: initialInputs.algorithm,
      timestamp: 'Initial Benchmark Solution',
    };
  });

  // Current inputs assembled from all controls (staged for run)
  const currentResInputs = useMemo(() => {
    return {
      ...resOptInputs,
      useCustomTimeSeries,
      havCurve,
      tailwaterElevationM,
      customInflowsMcm: useCustomTimeSeries ? monthlyTimeSeriesRows.map((r) => r.inflowMcm) : undefined,
      customDrinkingDemandsMcm: useCustomTimeSeries ? monthlyTimeSeriesRows.map((r) => r.drinkingMcm) : undefined,
      customIrrigationDemandsMcm: useCustomTimeSeries ? monthlyTimeSeriesRows.map((r) => r.irrigationMcm) : undefined,
      customIndustryDemandsMcm: useCustomTimeSeries ? monthlyTimeSeriesRows.map((r) => r.industryMcm) : undefined,
      customEnvironmentalDemandsMcm: useCustomTimeSeries ? monthlyTimeSeriesRows.map((r) => r.environmentalMcm) : undefined,
      customEvaporationDepthsM: useCustomTimeSeries ? monthlyTimeSeriesRows.map((r) => r.evaporationDepthM) : undefined,
    };
  }, [resOptInputs, useCustomTimeSeries, havCurve, tailwaterElevationM, monthlyTimeSeriesRows]);

  // Check if inputs have changed since last analysis run
  const isReservoirInputsDirty = useMemo(() => {
    if (!reservoirExecutedOutput) return false;
    const curr = currentResInputs;
    const prev = reservoirExecutedOutput.inputs;
    if (curr.algorithm !== prev.algorithm) return true;
    if (curr.maxCapacityMcm !== prev.maxCapacityMcm) return true;
    if (curr.deadStorageMcm !== prev.deadStorageMcm) return true;
    if (curr.initialStorageMcm !== prev.initialStorageMcm) return true;
    if (curr.maxReleaseM3s !== prev.maxReleaseM3s) return true;
    if (curr.spillwayCapacityM3s !== prev.spillwayCapacityM3s) return true;
    if (curr.maxTurbineReleaseM3s !== prev.maxTurbineReleaseM3s) return true;
    if (curr.headLossM !== prev.headLossM) return true;
    if (curr.turbineEfficiency !== prev.turbineEfficiency) return true;
    if (curr.energyDemandGwhPerPeriod !== prev.energyDemandGwhPerPeriod) return true;
    if (curr.drinkingDemandMcm !== prev.drinkingDemandMcm) return true;
    if (curr.irrigationDemandMcm !== prev.irrigationDemandMcm) return true;
    if (curr.industryDemandMcm !== prev.industryDemandMcm) return true;
    if (curr.environmentalFlowMcm !== prev.environmentalFlowMcm) return true;
    if (curr.weightDrinking !== prev.weightDrinking) return true;
    if (curr.weightIrrigation !== prev.weightIrrigation) return true;
    if (curr.weightIndustry !== prev.weightIndustry) return true;
    if (curr.weightEnvironmental !== prev.weightEnvironmental) return true;
    if (curr.weightHydropower !== prev.weightHydropower) return true;
    if (curr.weightStorage !== prev.weightStorage) return true;
    if (curr.timeStep !== prev.timeStep) return true;
    if (curr.years !== prev.years) return true;
    if (curr.hydrologyScenario !== prev.hydrologyScenario) return true;
    if (curr.meanAnnualInflowMcm !== prev.meanAnnualInflowMcm) return true;
    if (curr.ruleCurveMode !== prev.ruleCurveMode) return true;
    if (curr.userTargetStoragePct !== prev.userTargetStoragePct) return true;
    if (curr.useCustomTimeSeries !== prev.useCustomTimeSeries) return true;
    if (curr.tailwaterElevationM !== prev.tailwaterElevationM) return true;
    if (curr.havCurve !== prev.havCurve) return true;
    if (curr.eaGenerations !== prev.eaGenerations) return true;
    if (curr.eaPopulationSize !== prev.eaPopulationSize) return true;
    return false;
  }, [currentResInputs, reservoirExecutedOutput]);

  const handleRunReservoirOptimization = () => {
    setIsReservoirOptimizing(true);
    setTimeout(() => {
      const result = calcReservoirOptimization(currentResInputs);
      setReservoirExecutedOutput({
        inputs: currentResInputs,
        result,
        algorithm: currentResInputs.algorithm,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setIsReservoirOptimizing(false);
    }, 280);
  };

  // Pro features & Diagram tab states
  const { isPro } = useAuth();
  const [showProOptions, setShowProOptions] = useState(false);
  const [activeDiagramTab, setActiveDiagramTab] = useState<'schematic' | 'process'>('process');

  const handleGenerateAdvisorReport = async () => {
    setIsAdvisorLoading(true);
    setAdvisorError(null);
    try {
      const resp = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advisorInputs),
      });
      const data = await resp.json();
      if (data.success && data.report) {
        setAdvisorReport(data.report);
      } else {
        throw new Error(data.error || 'Server error generating advisor report');
      }
    } catch (err: any) {
      console.warn('Using client engineering fallback for advisor:', err);
      setAdvisorReport(`
# AquaCalc AI Treatment Train Advisor Report
**Project Standard:** ${advisorInputs.targetStandard}  
**Source Raw Water:** ${advisorInputs.waterType} (Design Flow: ${advisorInputs.flowRate.toLocaleString()} m³/d)  
**Verification Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  
**Standard Reference:** Metcalf & Eddy / AECOM Wastewater Engineering & US EPA/WHO Water Treatment  

---

## 1. Executive Summary & Regulatory Compliance
A comprehensive multi-barrier treatment sequence has been synthesized for raw **${advisorInputs.waterType}** with turbidity **${advisorInputs.turbidity} NTU**, BOD **${advisorInputs.bod} mg/L**, and TDS **${advisorInputs.tds} mg/L** to achieve the target standard **${advisorInputs.targetStandard}**.

---

## 2. Recommended Multi-Barrier Flowsheet
1. **Mechanical Bar Screen & Vortex Grit Removal:** Peak approach velocity 0.75 m/s, hydro-cyclone particulate removal.
2. **Flash Mix & Flocculation:** Rapid mix G = 800 s⁻¹, Alum dosing 32 mg/L, 20 min hydraulic flocculation.
3. **Lamella High-Rate Clarification:** Counter-current 60° inclined plates, Surface Overflow Rate: 1.8 m/h.
4. **Submerged Membrane Bioreactor (MBR) or CAS:** Basin volume ~ ${(advisorInputs.flowRate * 0.35).toFixed(0)} m³, MLSS: 8,500 mg/L, SRT: 18 days, fine bubble floor diffusers.
5. **Two-Pass Reverse Osmosis (BWRO/SWRO):** Specific Energy Consumption ~ 1.5 kWh/m³, recovery 75–80%, isobaric ERD.
6. **UV Disinfection & Chloramination:** > 4-log Cryptosporidium/Giardia inactivation, post-chloramine residual 2.0 mg/L.

---

## 3. Anticipated Treated Water Quality
- **Turbidity:** < 0.15 NTU (EPA SWTR Compliant)
- **BOD₅:** < 4.0 mg/L (98% reduction)
- **TDS:** < 180 mg/L
- **Total Coliform:** 0 MPN / 100 mL (> 6.0 Log Cumulative Pathogen Barrier)
      `);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Compute result dynamically
  const { result, currentInputsObject } = useMemo(() => {
    switch (calculator.id) {
      case 'carlson-tsi':
        return { result: calcCarlsonTsi(carlsonInputs), currentInputsObject: carlsonInputs };
      case 'streeter-phelps-sag':
        return { result: calcStreeterPhelps(streeterInputs), currentInputsObject: streeterInputs };
      case 'sequent-peak-reservoir':
        return {
          result: calcSequentPeak({
            monthlyInflows: sequentInputs.monthlyInflows,
            monthlyDemands: sequentInputs.monthlyDemands,
            unitLabel: unitSystem === 'metric' ? 'M m³' : 'ac-ft',
          }),
          currentInputsObject: sequentInputs,
        };
      case 'penman-monteith-et0':
        return { result: calcPenmanMonteith(penmanInputs), currentInputsObject: penmanInputs };
      case 'activated-sludge':
        return { result: calcActivatedSludge(sludgeInputs), currentInputsObject: sludgeInputs };
      case 'pumped-storage-hydro':
        return { result: calcPumpedStorage(pumpedInputs), currentInputsObject: pumpedInputs };
      case 'water-density-viscosity':
        return {
          result: calcWaterDensityViscosity({ tempC: tempCInput, pressureAtm: pressureAtmInput }),
          currentInputsObject: { tempC: tempCInput, pressureAtm: pressureAtmInput },
        };
      case 'pipe-head-loss':
        return { result: calcPipeHeadLoss(pipeInputs), currentInputsObject: pipeInputs };
      case 'manning-open-channel':
        return { result: calcManningFlow(manningInputs), currentInputsObject: manningInputs };
      case 'rational-method-runoff':
        return { result: calcRationalMethod(rationalInputs), currentInputsObject: rationalInputs };
      case 'scs-curve-number':
        return { result: calcScsRunoff(scsInputs), currentInputsObject: scsInputs };
      case 'particle-settling':
        return { result: calcStokesSettling(stokesInputs), currentInputsObject: stokesInputs };
      case 'dilution-mass-balance':
        return { result: calcDilution(dilutionInputs), currentInputsObject: dilutionInputs };
      case 'langelier-ryznar':
        return { result: calcLangelierRyznar(langelierInputs), currentInputsObject: langelierInputs };
      case 'turbine-selection':
        return { result: calcTurbineSelection(turbineInputs), currentInputsObject: turbineInputs };
      case 'crop-water-requirement':
        return { result: calcCropWater(cropInputs), currentInputsObject: cropInputs };
      case 'reservoir-evaporation':
        return { result: calcReservoirEvap(evapInputs), currentInputsObject: evapInputs };
      case 'chlorine-contact-tank':
        return { result: calcChlorineContactTank(tankInputs), currentInputsObject: tankInputs };
      case 'water-energy-footprint':
        return { result: calcWaterEnergyFootprint(footprintInputs), currentInputsObject: footprintInputs };
      case 'pump-sizing-affinity':
        return { result: calcPumpSizing(pumpInputs), currentInputsObject: pumpInputs };
      case 'chlorine-disinfection-ct':
        return { result: calcChlorineCT(chlorineCtInputs), currentInputsObject: chlorineCtInputs };
      case 'rapid-sand-filter':
        return { result: calcRapidSandFilter(sandFilterInputs), currentInputsObject: sandFilterInputs };
      case 'irrigation-efficiency':
        return {
          result: calcIrrigationUniformity({
            depthsMm: uniformityInputs.depthsMm,
            testDurationHours: uniformityInputs.testDurationHours,
            pressureKpa: uniformityInputs.pressureKpa,
            lateralSpacingM: uniformityInputs.lateralSpacingM,
            emitterSpacingM: uniformityInputs.emitterSpacingM,
          }),
          currentInputsObject: uniformityInputs,
        };
      case 'ponds-treatment':
        return { result: calcPondsTreatment(pondsInputs), currentInputsObject: pondsInputs };
      case 'desalination-ro':
        return { result: calcDesalinationRo(desalInputs), currentInputsObject: desalInputs };
      case 'agricultural-salinity':
        return { result: calcAgriculturalSalinity(salinityInputs), currentInputsObject: salinityInputs };
      case 'irrigation-lateral-hydraulics':
        return { result: calcLateralHydraulics(lateralInputs), currentInputsObject: lateralInputs };
      case 'ai-treatment-train':
        return { result: calcAiTreatmentTrain(advisorInputs), currentInputsObject: advisorInputs };
      case 'reservoir-optimization': {
        return {
          result: reservoirExecutedOutput.result,
          currentInputsObject: reservoirExecutedOutput.inputs,
        };
      }
      default:
        return { result: calcCarlsonTsi(carlsonInputs), currentInputsObject: carlsonInputs };
    }
  }, [
    calculator.id,
    unitSystem,
    carlsonInputs,
    streeterInputs,
    sequentInputs,
    penmanInputs,
    sludgeInputs,
    pumpedInputs,
    tempCInput,
    pressureAtmInput,
    pipeInputs,
    manningInputs,
    rationalInputs,
    scsInputs,
    stokesInputs,
    dilutionInputs,
    langelierInputs,
    turbineInputs,
    cropInputs,
    evapInputs,
    tankInputs,
    footprintInputs,
    pumpInputs,
    chlorineCtInputs,
    sandFilterInputs,
    uniformityInputs,
    pondsInputs,
    desalInputs,
    salinityInputs,
    lateralInputs,
    advisorInputs,
    reservoirExecutedOutput,
  ]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Workspace Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 font-mono">
            <span>TOOL REF: {calculator.id.toUpperCase()}</span>
            <span>·</span>
            <span className="capitalize">{calculator.domain.replace('-', ' ')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {calculator.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            {calculator.shortDescription}
          </p>
        </div>

        {/* Action Controls: PDF, Word, PNG & Pro Badging */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isPro && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Pro Active</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? t.linkCopied : t.copyLink}</span>
          </button>

          {/* Word (.doc) Download */}
          <button
            type="button"
            onClick={() => downloadWordReport(calculator, result, currentInputsObject)}
            title="Download editable Microsoft Word report (.doc)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Word (.doc)</span>
          </button>

          {/* PNG Card Download */}
          <button
            type="button"
            onClick={() => downloadPngReport(calculator, result, currentInputsObject)}
            title="Download high-resolution summary card (.png)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>PNG</span>
          </button>

          {/* PDF Report Trigger */}
          <button
            type="button"
            onClick={() => onOpenReport(result, currentInputsObject)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Direct Parameter Text Input Boxes (5 cols on large) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
              Design Input Parameters
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {unitSystem === 'metric' ? 'Metric SI' : 'US Customary'}
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Carlson TSI */}
            {calculator.id === 'carlson-tsi' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Secchi Disk Transparency Depth (SD) [meters]
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="30"
                    value={carlsonInputs.secchi}
                    onChange={(e) => setCarlsonInputs({ ...carlsonInputs, secchi: parseFloat(e.target.value) || 0.1 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Light extinction depth (typical lakes: 0.5 – 6.0 m)</span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Epilimnetic Chlorophyll-a (Chl-a) [µg/L]
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="200"
                    value={carlsonInputs.chla}
                    onChange={(e) => setCarlsonInputs({ ...carlsonInputs, chla: parseFloat(e.target.value) || 0.1 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Direct indicator of phytoplankton standing algal biomass</span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Total Phosphorus (TP) [µg/L]
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="500"
                    value={carlsonInputs.tp}
                    onChange={(e) => setCarlsonInputs({ ...carlsonInputs, tp: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Primary limiting macronutrient for freshwater lakes</span>
                </div>
              </>
            )}

            {/* 2. Streeter-Phelps DO Sag */}
            {calculator.id === 'streeter-phelps-sag' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Deoxygenation Rate (k_d) [1/day]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="2.0"
                      value={streeterInputs.kd}
                      onChange={(e) => setStreeterInputs({ ...streeterInputs, kd: parseFloat(e.target.value) || 0.1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Reaeration Rate (k_r) [1/day]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="3.0"
                      value={streeterInputs.kr}
                      onChange={(e) => setStreeterInputs({ ...streeterInputs, kr: parseFloat(e.target.value) || 0.1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Stream Ultimate BOD (L₀) [mg/L]
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="150"
                    value={streeterInputs.L0}
                    onChange={(e) => setStreeterInputs({ ...streeterInputs, L0: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Initial Deficit (D₀) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="12"
                      value={streeterInputs.D0}
                      onChange={(e) => setStreeterInputs({ ...streeterInputs, D0: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Saturation DO (DO_sat) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="4"
                      max="15"
                      value={streeterInputs.DOsat}
                      onChange={(e) => setStreeterInputs({ ...streeterInputs, DOsat: parseFloat(e.target.value) || 9 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Stream Velocity [km/day]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="2"
                      max="150"
                      value={streeterInputs.velocity}
                      onChange={(e) => setStreeterInputs({ ...streeterInputs, velocity: parseFloat(e.target.value) || 10 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Simulation Span [days]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="3"
                      max="30"
                      value={streeterInputs.reachDays}
                      onChange={(e) => setStreeterInputs({ ...streeterInputs, reachDays: parseInt(e.target.value) || 10 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 3. Sequent Peak Reservoir */}
            {calculator.id === 'sequent-peak-reservoir' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block">
                    Hydrologic Inflow &amp; Demand Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      type="button"
                      onClick={() =>
                        setSequentInputs({
                          monthlyInflows: [12, 16, 25, 38, 22, 14, 8, 5, 4, 7, 9, 11],
                          monthlyDemands: [15, 15, 16, 16, 18, 18, 18, 18, 17, 16, 15, 15],
                        })
                      }
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-sky-500 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Continental Snowmelt</div>
                      <div className="text-[10px] text-slate-400">Spring flood with dry summer</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSequentInputs({
                          monthlyInflows: [18, 20, 28, 12, 7, 3, 2, 2, 3, 5, 8, 10],
                          monthlyDemands: [14, 14, 14, 16, 20, 24, 25, 25, 20, 16, 14, 14],
                        })
                      }
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-sky-500 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Critical Drought Cycle</div>
                      <div className="text-[10px] text-slate-400">Severe summer irrigation deficit</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Inflow Streamflow ({unitSystem === 'metric' ? 'M m³' : 'ac-ft'}) [Month 1 to 12]
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 font-mono text-xs">
                    {sequentInputs.monthlyInflows.map((val, idx) => (
                      <div key={idx}>
                        <span className="text-[9px] text-slate-400 block text-center">M{idx + 1}</span>
                        <input
                          type="number"
                          step="0.5"
                          value={val}
                          onChange={(e) => {
                            const newArr = [...sequentInputs.monthlyInflows];
                            newArr[idx] = parseFloat(e.target.value) || 0;
                            setSequentInputs({ ...sequentInputs, monthlyInflows: newArr });
                          }}
                          className="w-full text-center py-1 px-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Water Demand ({unitSystem === 'metric' ? 'M m³' : 'ac-ft'}) [Month 1 to 12]
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 font-mono text-xs">
                    {sequentInputs.monthlyDemands.map((val, idx) => (
                      <div key={idx}>
                        <span className="text-[9px] text-slate-400 block text-center">M{idx + 1}</span>
                        <input
                          type="number"
                          step="0.5"
                          value={val}
                          onChange={(e) => {
                            const newArr = [...sequentInputs.monthlyDemands];
                            newArr[idx] = parseFloat(e.target.value) || 0;
                            setSequentInputs({ ...sequentInputs, monthlyDemands: newArr });
                          }}
                          className="w-full text-center py-1 px-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 4. FAO-56 Penman-Monteith */}
            {calculator.id === 'penman-monteith-et0' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Mean Air Temperature (T_mean) [°C]
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-10"
                    max="50"
                    value={penmanInputs.tempMean}
                    onChange={(e) => setPenmanInputs({ ...penmanInputs, tempMean: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Solar Radiation (R_s) [MJ/m²·day]
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="40"
                    value={penmanInputs.solarRad}
                    onChange={(e) => setPenmanInputs({ ...penmanInputs, solarRad: parseFloat(e.target.value) || 10 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Wind Speed (u₂ at 2m) [m/s]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="20"
                      value={penmanInputs.windSpeed}
                      onChange={(e) => setPenmanInputs({ ...penmanInputs, windSpeed: parseFloat(e.target.value) || 0.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Relative Humidity (RH) [%]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="100"
                      value={penmanInputs.relHumidity}
                      onChange={(e) => setPenmanInputs({ ...penmanInputs, relHumidity: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Elevation Above Sea Level [meters]
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    max="4500"
                    value={penmanInputs.elevation}
                    onChange={(e) => setPenmanInputs({ ...penmanInputs, elevation: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* 5. Activated Sludge */}
            {calculator.id === 'activated-sludge' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Daily Influent Flow Rate (Q) [m³/day]
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="100"
                    max="500000"
                    value={sludgeInputs.flowQ}
                    onChange={(e) => setSludgeInputs({ ...sludgeInputs, flowQ: parseFloat(e.target.value) || 1000 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Influent BOD₅ (S₀) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="50"
                      max="1000"
                      value={sludgeInputs.bodIn}
                      onChange={(e) => setSludgeInputs({ ...sludgeInputs, bodIn: parseFloat(e.target.value) || 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Effluent BOD Target (S) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="50"
                      value={sludgeInputs.bodOut}
                      onChange={(e) => setSludgeInputs({ ...sludgeInputs, bodOut: parseFloat(e.target.value) || 5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Aeration MLSS (X) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="1000"
                      max="8000"
                      value={sludgeInputs.mlss}
                      onChange={(e) => setSludgeInputs({ ...sludgeInputs, mlss: parseFloat(e.target.value) || 2000 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Sludge Age (SRT θ_c) [days]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="30"
                      value={sludgeInputs.srt}
                      onChange={(e) => setSludgeInputs({ ...sludgeInputs, srt: parseFloat(e.target.value) || 5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 6. Pumped Storage Hydropower Feasibility */}
            {calculator.id === 'pumped-storage-hydro' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Upper Reservoir Gross [M m³]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="200"
                      value={pumpedInputs.upperVolMm3}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, upperVolMm3: parseFloat(e.target.value) || 5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Lower Reservoir Gross [M m³]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="200"
                      value={pumpedInputs.lowerVolMm3}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, lowerVolMm3: parseFloat(e.target.value) || 5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Max Allowed Drawdown [%]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="10"
                      max="90"
                      value={pumpedInputs.maxDrawdownPct}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, maxDrawdownPct: parseFloat(e.target.value) || 30 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Gross Static Head [m]
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="30"
                      max="1200"
                      value={pumpedInputs.headM}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, headM: parseFloat(e.target.value) || 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    System Architecture
                  </label>
                  <select
                    value={pumpedInputs.systemType}
                    onChange={(e) => setPumpedInputs({ ...pumpedInputs, systemType: e.target.value as any })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="reversible">Reversible Pump-Turbine (Single Francis RPT Machine)</option>
                    <option value="separate">Separate System (Ternary Set / Separate Pump &amp; Turbine)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Generating Flow [m³/s]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="300"
                      value={pumpedInputs.flowGenM3s}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, flowGenM3s: parseFloat(e.target.value) || 10 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Generation Dispatch [hrs/day]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="16"
                      value={pumpedInputs.genHours}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, genHours: parseFloat(e.target.value) || 4 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {pumpedInputs.systemType === 'separate' && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Available Off-Peak Pumping Power [MW]
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="10"
                      max="1000"
                      value={pumpedInputs.pumpingPowerMw}
                      onChange={(e) => setPumpedInputs({ ...pumpedInputs, pumpingPowerMw: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </>
            )}

            {/* 7. Water Density & Viscosity */}
            {calculator.id === 'water-density-viscosity' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Water Temperature [°C] (0.0 to 100.0 °C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={tempCInput}
                    onChange={(e) => setTempCInput(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Equivalent to {(tempCInput * 1.8 + 32).toFixed(1)} °F</span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Atmospheric Pressure [atm]
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="2.0"
                    value={pressureAtmInput}
                    onChange={(e) => setPressureAtmInput(parseFloat(e.target.value) || 1.0)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* 8. Pipe Head Loss */}
            {calculator.id === 'pipe-head-loss' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Flow Rate [m³/s]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.001"
                      max="10"
                      value={pipeInputs.flowM3s}
                      onChange={(e) => setPipeInputs({ ...pipeInputs, flowM3s: parseFloat(e.target.value) || 0.01 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Pipe Diameter (D) [m]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.02"
                      max="3.0"
                      value={pipeInputs.diamM}
                      onChange={(e) => setPipeInputs({ ...pipeInputs, diamM: parseFloat(e.target.value) || 0.1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Pipe Length (L) [m]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="1"
                      max="50000"
                      value={pipeInputs.lengthM}
                      onChange={(e) => setPipeInputs({ ...pipeInputs, lengthM: parseFloat(e.target.value) || 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Roughness (ε) [mm]
                    </label>
                    <input
                      type="number"
                      step="0.005"
                      min="0.001"
                      max="5.0"
                      value={pipeInputs.roughnessMm}
                      onChange={(e) => setPipeInputs({ ...pipeInputs, roughnessMm: parseFloat(e.target.value) || 0.045 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Hazen-Williams C
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="60"
                      max="160"
                      value={pipeInputs.hwC}
                      onChange={(e) => setPipeInputs({ ...pipeInputs, hwC: parseFloat(e.target.value) || 130 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Minor Loss Coeff (ΣK)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      value={pipeInputs.sumK}
                      onChange={(e) => setPipeInputs({ ...pipeInputs, sumK: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 9. Manning Open Channel Flow */}
            {calculator.id === 'manning-open-channel' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Channel Cross-Section Geometry
                  </label>
                  <select
                    value={manningInputs.channelType}
                    onChange={(e) => setManningInputs({ ...manningInputs, channelType: e.target.value as any })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="rectangular">Rectangular Flume (No side slopes)</option>
                    <option value="trapezoidal">Trapezoidal Canal (Bottom width + side slopes)</option>
                    <option value="triangular">Triangular V-Ditch (Side slope, zero bottom width)</option>
                    <option value="circular">Circular Culvert / Pipe (Diameter, zero side slopes)</option>
                  </select>
                </div>

                {/* Conditional fields based on channel shape */}
                {(manningInputs.channelType === 'rectangular' || manningInputs.channelType === 'trapezoidal') && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Bottom Width (b) [meters]
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.1"
                      max="50"
                      value={manningInputs.bottomWidth}
                      onChange={(e) => setManningInputs({ ...manningInputs, bottomWidth: parseFloat(e.target.value) || 1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {(manningInputs.channelType === 'trapezoidal' || manningInputs.channelType === 'triangular') && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Side Slope (z) [Horizontal to 1 Vertical]
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.1"
                      max="5.0"
                      value={manningInputs.sideSlopeZ}
                      onChange={(e) => setManningInputs({ ...manningInputs, sideSlopeZ: parseFloat(e.target.value) || 1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {manningInputs.channelType === 'circular' && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Culvert Pipe Internal Diameter (D) [meters]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="10.0"
                      value={manningInputs.pipeDiameter}
                      onChange={(e) => setManningInputs({ ...manningInputs, pipeDiameter: parseFloat(e.target.value) || 1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Flow Water Depth (y) [m]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.05"
                      max="10.0"
                      value={manningInputs.waterDepth}
                      onChange={(e) => setManningInputs({ ...manningInputs, waterDepth: parseFloat(e.target.value) || 0.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Bed Slope (S₀) [m/m]
                    </label>
                    <input
                      type="number"
                      step="0.0005"
                      min="0.00005"
                      max="0.1"
                      value={manningInputs.bedSlopeS0}
                      onChange={(e) => setManningInputs({ ...manningInputs, bedSlopeS0: parseFloat(e.target.value) || 0.001 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Manning Roughness Coefficient (n)
                  </label>
                  <input
                    type="number"
                    step="0.002"
                    min="0.009"
                    max="0.08"
                    value={manningInputs.manningN}
                    onChange={(e) => setManningInputs({ ...manningInputs, manningN: parseFloat(e.target.value) || 0.02 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Smooth concrete: 0.013 · Earth: 0.025 · Vegetated: 0.040</span>
                </div>
              </>
            )}

            {/* 10. Rational Method Runoff */}
            {calculator.id === 'rational-method-runoff' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Runoff Coefficient (C) [0.05 to 0.95]
                    </label>
                    <select
                      onChange={(e) => setRationalInputs({ ...rationalInputs, runoffC: parseFloat(e.target.value) })}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Quick Presets...</option>
                      <option value="0.90">Roofs / Impervious (0.90)</option>
                      <option value="0.85">Concrete / Asphalt (0.85)</option>
                      <option value="0.75">Commercial Downtown (0.75)</option>
                      <option value="0.50">Suburban Residential (0.50)</option>
                      <option value="0.25">Parks &amp; Pastures (0.25)</option>
                      <option value="0.15">Forests &amp; Wooded (0.15)</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.95"
                    value={rationalInputs.runoffC}
                    onChange={(e) => setRationalInputs({ ...rationalInputs, runoffC: parseFloat(e.target.value) || 0.5 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Rainfall Intensity (I) [mm/hr]
                  </label>
                  <input
                    type="number"
                    step="2"
                    min="5"
                    max="250"
                    value={rationalInputs.rainIntensityMmHr}
                    onChange={(e) => setRationalInputs({ ...rationalInputs, rainIntensityMmHr: parseFloat(e.target.value) || 20 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Catchment Drainage Area (A) [hectares]
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0.1"
                    max="500"
                    value={rationalInputs.areaHa}
                    onChange={(e) => setRationalInputs({ ...rationalInputs, areaHa: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">1 hectare = 10,000 m² ≈ 2.47 acres</span>
                </div>
              </>
            )}

            {/* 11. SCS Runoff Curve Number */}
            {calculator.id === 'scs-curve-number' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    NRCS Runoff Curve Number (CN) [30 to 98]
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="30"
                    max="98"
                    value={scsInputs.curveNumber}
                    onChange={(e) => setScsInputs({ ...scsInputs, curveNumber: parseInt(e.target.value) || 70 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Paved: 98 · Residential: 75–85 · Cultivated: 65–78 · Woods: 55–65</span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Storm Event Precipitation Depth (P) [mm]
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="350"
                    value={scsInputs.precipitationMm}
                    onChange={(e) => setScsInputs({ ...scsInputs, precipitationMm: parseFloat(e.target.value) || 10 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* 12. Stokes Settling */}
            {calculator.id === 'particle-settling' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Particle Diameter (d) [mm]
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    max="5.0"
                    value={stokesInputs.particleDiamMm}
                    onChange={(e) => setStokesInputs({ ...stokesInputs, particleDiamMm: parseFloat(e.target.value) || 0.05 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Sand: 0.1–1.0 mm · Silt: 0.01–0.05 mm · Floc: 0.2–1.0 mm</span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Particle Density (ρ_p) [kg/m³]
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="1000"
                    max="5000"
                    value={stokesInputs.particleDensity}
                    onChange={(e) => setStokesInputs({ ...stokesInputs, particleDensity: parseFloat(e.target.value) || 2000 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Silica sand: 2650 kg/m³ · Alum floc: 1010–1050 kg/m³</span>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Water Temperature [°C]
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="45"
                    value={stokesInputs.waterTempC}
                    onChange={(e) => setStokesInputs({ ...stokesInputs, waterTempC: parseFloat(e.target.value) || 20 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* 13. Dilution Mass Balance */}
            {calculator.id === 'dilution-mass-balance' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Upstream River Flow (Q_s) [m³/s]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.01"
                      max="1000"
                      value={dilutionInputs.streamFlow}
                      onChange={(e) => setDilutionInputs({ ...dilutionInputs, streamFlow: parseFloat(e.target.value) || 1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Upstream Conc (C_s) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="200"
                      value={dilutionInputs.streamConc}
                      onChange={(e) => setDilutionInputs({ ...dilutionInputs, streamConc: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Effluent Discharge (Q_e) [m³/s]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.001"
                      max="50"
                      value={dilutionInputs.effluentFlow}
                      onChange={(e) => setDilutionInputs({ ...dilutionInputs, effluentFlow: parseFloat(e.target.value) || 0.1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Effluent Conc (C_e) [mg/L]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="1000"
                      value={dilutionInputs.effluentConc}
                      onChange={(e) => setDilutionInputs({ ...dilutionInputs, effluentConc: parseFloat(e.target.value) || 10 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Water Quality Standard Limit (WQS) [mg/L]
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="100"
                    value={dilutionInputs.wqsStandard}
                    onChange={(e) => setDilutionInputs({ ...dilutionInputs, wqsStandard: parseFloat(e.target.value) || 5 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* 14. Langelier (LSI) & Ryznar (RSI) */}
            {calculator.id === 'langelier-ryznar' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Measured pH (6.0 to 10.0)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="5.0"
                      max="11.0"
                      value={langelierInputs.pH}
                      onChange={(e) => setLangelierInputs({ ...langelierInputs, pH: parseFloat(e.target.value) || 7.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Water Temperature [°C]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="90"
                      value={langelierInputs.tempC}
                      onChange={(e) => setLangelierInputs({ ...langelierInputs, tempC: parseFloat(e.target.value) || 20 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Total Dissolved Solids (TDS) [mg/L]
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    max="5000"
                    value={langelierInputs.tdsMgL}
                    onChange={(e) => setLangelierInputs({ ...langelierInputs, tdsMgL: parseFloat(e.target.value) || 100 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Calcium Hardness [mg/L as CaCO₃]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="5"
                      max="1000"
                      value={langelierInputs.calciumHardnessMgL}
                      onChange={(e) => setLangelierInputs({ ...langelierInputs, calciumHardnessMgL: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Total Alkalinity [mg/L as CaCO₃]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="5"
                      max="800"
                      value={langelierInputs.alkalinityMgL}
                      onChange={(e) => setLangelierInputs({ ...langelierInputs, alkalinityMgL: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 15. Hydro Turbine Selection & Specific Speed */}
            {calculator.id === 'turbine-selection' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Net Hydraulic Head (H) [meters]
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="2"
                    max="1500"
                    value={turbineInputs.headM}
                    onChange={(e) => setTurbineInputs({ ...turbineInputs, headM: parseFloat(e.target.value) || 10 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Design Discharge Flow Rate (Q) [m³/s]
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.05"
                    max="500"
                    value={turbineInputs.flowM3s}
                    onChange={(e) => setTurbineInputs({ ...turbineInputs, flowM3s: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Rotational Speed (N) [RPM]
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="3000"
                      value={turbineInputs.rpm}
                      onChange={(e) => setTurbineInputs({ ...turbineInputs, rpm: parseFloat(e.target.value) || 300 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Turbine Efficiency (η) [%]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="70"
                      max="96"
                      value={Math.round((turbineInputs.etaTurbine || 0.9) * 100)}
                      onChange={(e) => setTurbineInputs({ ...turbineInputs, etaTurbine: (parseFloat(e.target.value) || 90) / 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 16. Crop Water Requirement & Irrigation Scheduling */}
            {calculator.id === 'crop-water-requirement' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Crop Selection &amp; FAO-56 Growth Stage
                  </label>
                  <select
                    value={cropInputs.cropName}
                    onChange={(e) => {
                      const name = e.target.value;
                      let kc = 1.0;
                      if (name.includes('Corn')) kc = 1.20;
                      else if (name.includes('Wheat')) kc = 1.15;
                      else if (name.includes('Rice')) kc = 1.25;
                      else if (name.includes('Alfalfa')) kc = 1.20;
                      else if (name.includes('Cotton')) kc = 1.20;
                      else if (name.includes('Tomato')) kc = 1.15;
                      else if (name.includes('Citrus')) kc = 0.85;
                      else if (name.includes('Vineyard')) kc = 0.70;
                      else if (name.includes('Olive')) kc = 0.65;
                      setCropInputs({ ...cropInputs, cropName: name, cropKc: kc });
                    }}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Maize / Field Corn">Maize / Field Corn (Mid-Season Kc: 1.20)</option>
                    <option value="Wheat & Small Grains">Wheat &amp; Small Grains (Mid-Season Kc: 1.15)</option>
                    <option value="Paddy Rice">Paddy Rice (Mid-Season Kc: 1.25)</option>
                    <option value="Alfalfa / Pasture">Alfalfa / Pasture Forage (Kc: 1.20)</option>
                    <option value="Cotton">Cotton (Mid-Season Kc: 1.20)</option>
                    <option value="Tomato / Vegetables">Tomato &amp; Fresh Veg (Kc: 1.15)</option>
                    <option value="Citrus & Orchards">Citrus &amp; Fruit Orchards (Kc: 0.85)</option>
                    <option value="Vineyard / Table Grapes">Vineyard / Table Grapes (Kc: 0.70)</option>
                    <option value="Olive Groves">Olive Groves (Kc: 0.65)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Crop Coefficient (K_c)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.2"
                      max="1.5"
                      value={cropInputs.cropKc}
                      onChange={(e) => setCropInputs({ ...cropInputs, cropKc: parseFloat(e.target.value) || 1.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Reference ET₀ [mm/day]
                    </label>
                    <input
                      type="number"
                      step="0.2"
                      min="1.0"
                      max="15.0"
                      value={cropInputs.et0MmDay}
                      onChange={(e) => setCropInputs({ ...cropInputs, et0MmDay: parseFloat(e.target.value) || 5.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Effective Rainfall [mm/day]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={cropInputs.effectiveRainMmDay}
                      onChange={(e) => setCropInputs({ ...cropInputs, effectiveRainMmDay: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      System Efficiency [%]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="40"
                      max="98"
                      value={cropInputs.irrigationEfficiencyPct}
                      onChange={(e) => setCropInputs({ ...cropInputs, irrigationEfficiencyPct: parseFloat(e.target.value) || 75 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Soil Available Water [mm/m]
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="50"
                      max="220"
                      value={cropInputs.soilAWCmmM}
                      onChange={(e) => setCropInputs({ ...cropInputs, soilAWCmmM: parseFloat(e.target.value) || 140 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Root Zone Depth [meters]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.3"
                      max="3.0"
                      value={cropInputs.rootDepthM}
                      onChange={(e) => setCropInputs({ ...cropInputs, rootDepthM: parseFloat(e.target.value) || 1.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 17. Reservoir Evaporation Loss */}
            {calculator.id === 'reservoir-evaporation' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Surface Water Area [ha]
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="1"
                      max="50000"
                      value={evapInputs.surfaceAreaHa}
                      onChange={(e) => setEvapInputs({ ...evapInputs, surfaceAreaHa: parseFloat(e.target.value) || 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Latitude / Coordinates [°N/S]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="-60"
                      max="60"
                      value={evapInputs.latitudeDeg}
                      onChange={(e) => setEvapInputs({ ...evapInputs, latitudeDeg: parseFloat(e.target.value) || 35 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Reservoir Elevation [meters]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      max="3500"
                      value={evapInputs.elevationM}
                      onChange={(e) => setEvapInputs({ ...evapInputs, elevationM: parseFloat(e.target.value) || 200 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Air Temperature [°C]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="50"
                      value={evapInputs.tempC}
                      onChange={(e) => setEvapInputs({ ...evapInputs, tempC: parseFloat(e.target.value) || 20 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Wind Speed at 2m [m/s]
                    </label>
                    <input
                      type="number"
                      step="0.2"
                      min="0.5"
                      max="15"
                      value={evapInputs.windSpeedMps}
                      onChange={(e) => setEvapInputs({ ...evapInputs, windSpeedMps: parseFloat(e.target.value) || 2.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Relative Humidity [%]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="10"
                      max="95"
                      value={evapInputs.relHumidityPct}
                      onChange={(e) => setEvapInputs({ ...evapInputs, relHumidityPct: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 18. Chlorine Contact Tank */}
            {calculator.id === 'chlorine-contact-tank' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Peak Hourly Flow [m³/hr]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="10"
                      max="5000"
                      value={tankInputs.peakFlowM3Hr}
                      onChange={(e) => setTankInputs({ ...tankInputs, peakFlowM3Hr: parseFloat(e.target.value) || 200 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Required T_10 Time [min]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="5"
                      max="120"
                      value={tankInputs.reqT10Minutes}
                      onChange={(e) => setTankInputs({ ...tankInputs, reqT10Minutes: parseFloat(e.target.value) || 20 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Baffling Condition (BF = T_10 / HRT)
                  </label>
                  <select
                    value={tankInputs.bafflingFactor}
                    onChange={(e) => setTankInputs({ ...tankInputs, bafflingFactor: parseFloat(e.target.value) })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="0.10">Unbaffled Basin (BF = 0.10 - Single inlet/outlet)</option>
                    <option value="0.30">Poor Baffling (BF = 0.30 - Single cross baffle)</option>
                    <option value="0.50">Average Baffling (BF = 0.50 - Multi-baffle)</option>
                    <option value="0.70">Superior Baffling (BF = 0.70 - Multi-pass serpentine)</option>
                    <option value="1.00">Ideal Plug Flow (BF = 1.00 - Long pipeline)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Water Depth [m]
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="1.0"
                      max="6.0"
                      value={tankInputs.waterDepthM}
                      onChange={(e) => setTankInputs({ ...tankInputs, waterDepthM: parseFloat(e.target.value) || 2.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Channel Width [m]
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.5"
                      max="10.0"
                      value={tankInputs.channelWidthM}
                      onChange={(e) => setTankInputs({ ...tankInputs, channelWidthM: parseFloat(e.target.value) || 2.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 19. Water-Energy Nexus Footprint */}
            {calculator.id === 'water-energy-footprint' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Municipal Water Supply Volume [m³/day]
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="500"
                    max="500000"
                    value={footprintInputs.volM3Day}
                    onChange={(e) => setFootprintInputs({ ...footprintInputs, volM3Day: parseFloat(e.target.value) || 10000 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Abstraction Energy [kWh/m³]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="2.5"
                      value={footprintInputs.abstractionKwhM3}
                      onChange={(e) => setFootprintInputs({ ...footprintInputs, abstractionKwhM3: parseFloat(e.target.value) || 0.2 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Treatment Energy [kWh/m³]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="4.0"
                      value={footprintInputs.treatmentKwhM3}
                      onChange={(e) => setFootprintInputs({ ...footprintInputs, treatmentKwhM3: parseFloat(e.target.value) || 0.2 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Distribution Pumping [kWh/m³]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="2.0"
                      value={footprintInputs.distributionKwhM3}
                      onChange={(e) => setFootprintInputs({ ...footprintInputs, distributionKwhM3: parseFloat(e.target.value) || 0.3 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Wastewater Aeration [kWh/m³]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="2.0"
                      value={footprintInputs.wastewaterKwhM3}
                      onChange={(e) => setFootprintInputs({ ...footprintInputs, wastewaterKwhM3: parseFloat(e.target.value) || 0.4 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Electricity Tariff [$/kWh]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.02"
                      max="0.60"
                      value={footprintInputs.electricityCostPerKwh}
                      onChange={(e) => setFootprintInputs({ ...footprintInputs, electricityCostPerKwh: parseFloat(e.target.value) || 0.1 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Grid Carbon Factor [kg CO₂e/kWh]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="1.2"
                      value={footprintInputs.gridCo2KgKwh}
                      onChange={(e) => setFootprintInputs({ ...footprintInputs, gridCo2KgKwh: parseFloat(e.target.value) || 0.45 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 20. Centrifugal Pump Sizing & Affinity */}
            {calculator.id === 'pump-sizing-affinity' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Duty Flow (Q₁) [m³/hr]
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="5"
                      max="5000"
                      value={pumpInputs.flowM3Hr}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, flowM3Hr: parseFloat(e.target.value) || 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Dynamic Head (H₁) [m]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="3"
                      max="300"
                      value={pumpInputs.totalHeadM}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, totalHeadM: parseFloat(e.target.value) || 20 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Base Speed (N₁) [RPM]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="500"
                      max="3600"
                      value={pumpInputs.baseRpm}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, baseRpm: parseFloat(e.target.value) || 1450 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Scaled Speed (N₂) [RPM]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="500"
                      max="3600"
                      value={pumpInputs.scaledRpm}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, scaledRpm: parseFloat(e.target.value) || 1450 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Base Impeller (D₁) [mm]
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="100"
                      max="800"
                      value={pumpInputs.baseDiamMm}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, baseDiamMm: parseFloat(e.target.value) || 250 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Scaled Impeller (D₂) [mm]
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="100"
                      max="800"
                      value={pumpInputs.scaledDiamMm}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, scaledDiamMm: parseFloat(e.target.value) || 250 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Pump Efficiency (η) [%]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="40"
                      max="92"
                      value={pumpInputs.pumpEfficiencyPct}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, pumpEfficiencyPct: parseFloat(e.target.value) || 75 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Suction Lift (z_s) [m]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="8.0"
                      value={pumpInputs.suctionLiftM}
                      onChange={(e) => setPumpInputs({ ...pumpInputs, suctionLiftM: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 21. Chlorine Disinfection CT */}
            {calculator.id === 'chlorine-disinfection-ct' && (
              <>
                <div className="p-3 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> What is CT and What Does it Calculate?
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Under the EPA Surface Water Treatment Rule (SWTR), <strong>CT</strong> is the concentration of disinfectant residual (C in mg/L) multiplied by effective contact time (T₁₀ in minutes). It governs compliance for 3-log (99.9%) Giardia lamblia cyst and 4-log enteric virus inactivation.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Free Chlorine Residual [mg/L]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      value={chlorineCtInputs.freeChlorineMgL}
                      onChange={(e) => setChlorineCtInputs({ ...chlorineCtInputs, freeChlorineMgL: parseFloat(e.target.value) || 0.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Contact Time (T₁₀) [minutes]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      max="240"
                      value={chlorineCtInputs.contactTimeMin}
                      onChange={(e) => setChlorineCtInputs({ ...chlorineCtInputs, contactTimeMin: parseFloat(e.target.value) || 10 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Water Temperature [°C]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0.5"
                      max="30"
                      value={chlorineCtInputs.waterTempC}
                      onChange={(e) => setChlorineCtInputs({ ...chlorineCtInputs, waterTempC: parseFloat(e.target.value) || 15 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Water pH (6.0 to 9.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="6.0"
                      max="9.0"
                      value={chlorineCtInputs.waterPH}
                      onChange={(e) => setChlorineCtInputs({ ...chlorineCtInputs, waterPH: parseFloat(e.target.value) || 7.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Target Pathogen Log Reduction
                  </label>
                  <select
                    value={chlorineCtInputs.targetLogGiardia}
                    onChange={(e) => setChlorineCtInputs({ ...chlorineCtInputs, targetLogGiardia: parseFloat(e.target.value) })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="0.5">0.5-log Giardia (68.4% inactivation)</option>
                    <option value="1.0">1.0-log Giardia (90.0% inactivation)</option>
                    <option value="2.0">2.0-log Giardia (99.0% inactivation)</option>
                    <option value="3.0">3.0-log Giardia (99.9% standard EPA SWTR)</option>
                    <option value="4.0">4.0-log Giardia / Viruses (99.99% high-log)</option>
                  </select>
                </div>
              </>
            )}

            {/* 22. Rapid Sand Filter */}
            {calculator.id === 'rapid-sand-filter' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Filtration Rate [m/hr]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="25"
                      value={sandFilterInputs.filtRateM3M2Hr}
                      onChange={(e) => setSandFilterInputs({ ...sandFilterInputs, filtRateM3M2Hr: parseFloat(e.target.value) || 5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Sand Bed Depth (L) [m]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.3"
                      max="2.5"
                      value={sandFilterInputs.bedDepthM}
                      onChange={(e) => setSandFilterInputs({ ...sandFilterInputs, bedDepthM: parseFloat(e.target.value) || 0.8 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Effective Sand Grain (d) [mm]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.2"
                      max="2.0"
                      value={sandFilterInputs.grainDiamMm}
                      onChange={(e) => setSandFilterInputs({ ...sandFilterInputs, grainDiamMm: parseFloat(e.target.value) || 0.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Media Porosity (ε) [0.35-0.5]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.30"
                      max="0.55"
                      value={sandFilterInputs.porosity}
                      onChange={(e) => setSandFilterInputs({ ...sandFilterInputs, porosity: parseFloat(e.target.value) || 0.42 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Sand Sphericity (ψ) [0.7-1.0]
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.6"
                      max="1.0"
                      value={sandFilterInputs.sphericity}
                      onChange={(e) => setSandFilterInputs({ ...sandFilterInputs, sphericity: parseFloat(e.target.value) || 0.85 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Water Temp [°C]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="40"
                      value={sandFilterInputs.waterTempC}
                      onChange={(e) => setSandFilterInputs({ ...sandFilterInputs, waterTempC: parseFloat(e.target.value) || 20 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 23. Irrigation Uniformity (DU & CU) */}
            {calculator.id === 'irrigation-efficiency' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Catch-Can Water Depths [mm] (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={uniformityInputs.depthsMm.join(', ')}
                    onChange={(e) => {
                      const vals = e.target.value.split(',').map((s) => parseFloat(s.trim())).filter((v) => !isNaN(v));
                      if (vals.length > 0) setUniformityInputs({ ...uniformityInputs, depthsMm: vals });
                    }}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {uniformityInputs.depthsMm.length} cans evaluated. Low-quarter evaluates the 25% lowest depths.
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Test Duration [hours]
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="8"
                      value={uniformityInputs.testDurationHours}
                      onChange={(e) => setUniformityInputs({ ...uniformityInputs, testDurationHours: parseFloat(e.target.value) || 1.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Operating Pressure [kPa]
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="600"
                      value={uniformityInputs.pressureKpa}
                      onChange={(e) => setUniformityInputs({ ...uniformityInputs, pressureKpa: parseFloat(e.target.value) || 200 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 24. Waste Stabilization Ponds (WSP Suite) */}
            {calculator.id === 'ponds-treatment' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Wastewater Flow Rate [m³/day]
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="100"
                      max="100000"
                      value={pondsInputs.flowRate}
                      onChange={(e) => setPondsInputs({ ...pondsInputs, flowRate: parseFloat(e.target.value) || 1000 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Raw Influent BOD₅ [mg/L]
                    </label>
                    <input
                      type="number"
                      step="20"
                      min="50"
                      max="1200"
                      value={pondsInputs.bodIn}
                      onChange={(e) => setPondsInputs({ ...pondsInputs, bodIn: parseFloat(e.target.value) || 200 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Critical Winter Temp [°C]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="35"
                      value={pondsInputs.temp}
                      onChange={(e) => setPondsInputs({ ...pondsInputs, temp: parseFloat(e.target.value) || 15 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Coldest month mean water temp</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Maturation Ponds in Series
                    </label>
                    <select
                      value={pondsInputs.maturationPondsCount}
                      onChange={(e) => setPondsInputs({ ...pondsInputs, maturationPondsCount: parseInt(e.target.value) || 2 })}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="1">1 Maturation Pond (Restricted irrigation)</option>
                      <option value="2">2 Maturation Ponds (Unrestricted irrigation WHO)</option>
                      <option value="3">3 Maturation Ponds (High pathogen sensitivity)</option>
                      <option value="4">4 Maturation Ponds (Bathing / aquaculture)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Raw Fecal Coliform Count [MPN / 100mL]
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    min="10000"
                    max="1000000000"
                    value={pondsInputs.coliformIn}
                    onChange={(e) => setPondsInputs({ ...pondsInputs, coliformIn: parseFloat(e.target.value) || 1e7 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Typical municipal raw sewage: 10⁷ – 10⁸ MPN/100mL</span>
                </div>
              </>
            )}

            {/* 25. Desalination RO */}
            {calculator.id === 'desalination-ro' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Feed Water Salinity / TDS [mg/L or ppm]
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setDesalInputs({ ...desalInputs, feedTds: 35000, recovery: 45, proFlux: 14 })}
                      className="px-2 py-1 text-[10px] rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                    >
                      Seawater (35k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesalInputs({ ...desalInputs, feedTds: 45000, recovery: 40, proFlux: 12 })}
                      className="px-2 py-1 text-[10px] rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                    >
                      Gulf SWRO (45k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesalInputs({ ...desalInputs, feedTds: 4500, recovery: 75, proFlux: 20 })}
                      className="px-2 py-1 text-[10px] rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                    >
                      Brackish BWRO (4.5k)
                    </button>
                  </div>
                  <input
                    type="number"
                    step="1000"
                    min="500"
                    max="65000"
                    value={desalInputs.feedTds}
                    onChange={(e) => setDesalInputs({ ...desalInputs, feedTds: parseFloat(e.target.value) || 35000 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Feed Flow Rate [m³/h]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="5"
                      max="10000"
                      value={desalInputs.feedFlow}
                      onChange={(e) => setDesalInputs({ ...desalInputs, feedFlow: parseFloat(e.target.value) || 200 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      System Recovery Rate (Y) [%]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="20"
                      max="88"
                      value={desalInputs.recovery}
                      onChange={(e) => setDesalInputs({ ...desalInputs, recovery: parseFloat(e.target.value) || 45 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">SWRO: 40-50% · BWRO: 70-85%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Water Temperature [°C]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="45"
                      value={desalInputs.temp}
                      onChange={(e) => setDesalInputs({ ...desalInputs, temp: parseFloat(e.target.value) || 22 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Isobaric ERD Efficiency [%]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="70"
                      max="98"
                      value={desalInputs.erdEfficiency}
                      onChange={(e) => setDesalInputs({ ...desalInputs, erdEfficiency: parseFloat(e.target.value) || 95 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 26. Agricultural Salinity */}
            {calculator.id === 'agricultural-salinity' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Select Target Crop Variety
                  </label>
                  <select
                    value={salinityInputs.cropName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const cropPresets: Record<string, number> = {
                        Tomato: 2.5,
                        Wheat: 6.0,
                        Corn: 1.7,
                        Alfalfa: 2.0,
                        DatePalm: 4.0,
                        Barley: 8.0,
                        Citrus: 1.7,
                        Potato: 1.7,
                      };
                      setSalinityInputs({
                        ...salinityInputs,
                        cropName: name,
                        ece: cropPresets[name] || 2.5,
                      });
                    }}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white mb-2"
                  >
                    <option value="Tomato">Tomato (Threshold EC_e = 2.5 dS/m - Moderately Sensitive)</option>
                    <option value="Wheat">Wheat (Threshold EC_e = 6.0 dS/m - Tolerant)</option>
                    <option value="Corn">Corn / Maize (Threshold EC_e = 1.7 dS/m - Sensitive)</option>
                    <option value="Alfalfa">Alfalfa (Threshold EC_e = 2.0 dS/m - Moderately Sensitive)</option>
                    <option value="DatePalm">Date Palm (Threshold EC_e = 4.0 dS/m - Tolerant)</option>
                    <option value="Barley">Barley (Threshold EC_e = 8.0 dS/m - Highly Tolerant)</option>
                    <option value="Citrus">Citrus (Threshold EC_e = 1.7 dS/m - Sensitive)</option>
                    <option value="Potato">Potato (Threshold EC_e = 1.7 dS/m - Sensitive)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Irrigation Water Salinity (EC_w) [dS/m]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="12"
                      value={salinityInputs.ecw}
                      onChange={(e) => setSalinityInputs({ ...salinityInputs, ecw: parseFloat(e.target.value) || 1.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">1 dS/m ≈ 640 mg/L TDS</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Crop Tolerance Threshold (EC_e) [dS/m]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="15"
                      value={salinityInputs.ece}
                      onChange={(e) => setSalinityInputs({ ...salinityInputs, ece: parseFloat(e.target.value) || 2.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Crop ET Demand (ET_c) [mm]
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="25"
                      value={salinityInputs.etc}
                      onChange={(e) => setSalinityInputs({ ...salinityInputs, etc: parseFloat(e.target.value) || 5.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Application System Efficiency [%]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="40"
                      max="98"
                      value={salinityInputs.irrEfficiency}
                      onChange={(e) => setSalinityInputs({ ...salinityInputs, irrEfficiency: parseFloat(e.target.value) || 85 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 27. Lateral Hydraulics */}
            {calculator.id === 'irrigation-lateral-hydraulics' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Pipe Internal Diameter (D) [mm]
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="100"
                      value={lateralInputs.pipeDiameter}
                      onChange={(e) => setLateralInputs({ ...lateralInputs, pipeDiameter: parseFloat(e.target.value) || 16 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Lateral Total Length [meters]
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="20"
                      max="500"
                      value={lateralInputs.lateralLength}
                      onChange={(e) => setLateralInputs({ ...lateralInputs, lateralLength: parseFloat(e.target.value) || 100 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Emitter Spacing [meters]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="10"
                      value={lateralInputs.emitterSpacing}
                      onChange={(e) => setLateralInputs({ ...lateralInputs, emitterSpacing: parseFloat(e.target.value) || 0.5 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Emitter Discharge [L / hr]
                    </label>
                    <input
                      type="number"
                      step="0.2"
                      min="0.5"
                      max="50"
                      value={lateralInputs.emitterDischarge}
                      onChange={(e) => setLateralInputs({ ...lateralInputs, emitterDischarge: parseFloat(e.target.value) || 2.0 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Inlet Operating Pressure [bar]
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="6.0"
                    value={lateralInputs.operatingPressure}
                    onChange={(e) => setLateralInputs({ ...lateralInputs, operatingPressure: parseFloat(e.target.value) || 1.5 })}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standard drip tubing: 1.0–2.0 bar · Sprinkler: 2.0–4.0 bar</span>
                </div>
              </>
            )}

            {/* 28. AI Multi-Barrier Advisor */}
            {calculator.id === 'ai-treatment-train' && (
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Raw Water Source Type
                  </label>
                  <select
                    value={advisorInputs.waterType}
                    onChange={(e) => setAdvisorInputs({ ...advisorInputs, waterType: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Municipal Secondary Effluent">Municipal Secondary Effluent (Water Reuse)</option>
                    <option value="Turbid Surface River Water">Turbid Surface River / Lake Water</option>
                    <option value="Saline Groundwater / Well">Saline / High Hardness Groundwater</option>
                    <option value="Industrial Chemical / Textile Wastewater">Industrial Chemical / Textile Wastewater</option>
                    <option value="Landfill Leachate / High Strength">Landfill Leachate / High COD Waste</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Design Flow Rate [m³/d]
                    </label>
                    <input
                      type="number"
                      step="1000"
                      min="100"
                      max="500000"
                      value={advisorInputs.flowRate}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, flowRate: parseFloat(e.target.value) || 5000 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Target Effluent Standard
                    </label>
                    <select
                      value={advisorInputs.targetStandard}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, targetStandard: e.target.value })}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="WHO / EPA Drinking Water Standard">WHO / EPA Drinking Water Standard</option>
                      <option value="Agricultural Unrestricted Reuse (WHO)">Agricultural Unrestricted Reuse (WHO)</option>
                      <option value="Surface Water River Discharge Limit">Surface Water River Discharge Limit</option>
                      <option value="High-Pressure Boiler Feed Demineralized">High-Pressure Boiler Feed Demineralized</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Turbidity [NTU]
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={advisorInputs.turbidity}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, turbidity: parseFloat(e.target.value) || 10 })}
                      className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      BOD₅ [mg/L]
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={advisorInputs.bod}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, bod: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      TDS [mg/L]
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={advisorInputs.tds}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, tds: parseFloat(e.target.value) || 500 })}
                      className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advisorInputs.hasHeavyMetals}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, hasHeavyMetals: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Presence of Heavy Metals (Pb, As, Cd, Cr)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advisorInputs.hasOrganicMicropollutants}
                      onChange={(e) => setAdvisorInputs({ ...advisorInputs, hasOrganicMicropollutants: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Presence of Trace Organic Micropollutants (PFAS, Pesticides, EDCs)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAdvisorReport}
                  disabled={isAdvisorLoading}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isAdvisorLoading ? 'Synthesizing Treatment Train...' : 'Generate AI Treatment Train Report'}</span>
                </button>
              </div>
            )}

            {/* 29. Reservoir Operation Optimization (LP Simplex & Evolutionary Algorithm) */}
            {calculator.id === 'reservoir-optimization' && (
              <div className="space-y-4">
                {/* 1. Algorithm Selection & Explicit Run Analysis Control */}
                <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl border border-slate-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <label className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                        Optimization Solver Engine
                      </label>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      User-Triggered Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResOptInputs({ ...resOptInputs, algorithm: 'lp-simplex' })}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                        resOptInputs.algorithm === 'lp-simplex'
                          ? 'bg-teal-600 text-white border-teal-400 shadow-sm ring-2 ring-teal-400/40'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>LP (Simplex Method)</span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-1">Exact global piecewise linear optimization</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResOptInputs({ ...resOptInputs, algorithm: 'evolutionary' })}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                        resOptInputs.algorithm === 'evolutionary'
                          ? 'bg-teal-600 text-white border-teal-400 shadow-sm ring-2 ring-teal-400/40'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Activity className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Evolutionary (GA)</span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-1">Multi-criteria genetic search &amp; non-linear penalties</div>
                    </button>
                  </div>

                  {resOptInputs.algorithm === 'evolutionary' && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Generations (Epochs)</label>
                        <input
                          type="number"
                          step="10"
                          min="20"
                          max="200"
                          value={resOptInputs.eaGenerations}
                          onChange={(e) => setResOptInputs({ ...resOptInputs, eaGenerations: parseInt(e.target.value) || 60 })}
                          className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-700 bg-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Population Size</label>
                        <input
                          type="number"
                          step="5"
                          min="15"
                          max="100"
                          value={resOptInputs.eaPopulationSize}
                          onChange={(e) => setResOptInputs({ ...resOptInputs, eaPopulationSize: parseInt(e.target.value) || 35 })}
                          className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-700 bg-slate-800 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Explicit Run Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleRunReservoirOptimization}
                      disabled={isReservoirOptimizing}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                        isReservoirOptimizing
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : isReservoirInputsDirty
                          ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-white ring-2 ring-emerald-400/50 shadow-emerald-900/40 animate-pulse'
                          : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/50'
                      }`}
                    >
                      {isReservoirOptimizing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Executing {resOptInputs.algorithm === 'lp-simplex' ? 'LP Simplex Solver' : 'Evolutionary Search'}...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Run Optimization Analysis ({resOptInputs.algorithm === 'lp-simplex' ? 'LP Simplex' : 'Evolutionary'})</span>
                        </>
                      )}
                    </button>

                    {/* Solver execution status banner */}
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono px-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isReservoirInputsDirty ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                        <span className={isReservoirInputsDirty ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                          {isReservoirInputsDirty
                            ? 'Inputs modified — Click Run to solve'
                            : `Solved (${reservoirExecutedOutput.algorithm === 'lp-simplex' ? 'LP Simplex' : 'Evolutionary'})`}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {reservoirExecutedOutput.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Temporal Horizon & Time Steps */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Time Step Interval
                    </label>
                    <select
                      value={resOptInputs.timeStep}
                      onChange={(e) => setResOptInputs({ ...resOptInputs, timeStep: e.target.value as any })}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="monthly">Monthly Time Steps (12/yr)</option>
                      <option value="weekly">Weekly Time Steps (52/yr)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Planning Horizon (1-5 Years)
                    </label>
                    <select
                      value={resOptInputs.years}
                      onChange={(e) => handleYearsChange(parseInt(e.target.value) || 3)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="1">1 Year ({resOptInputs.timeStep === 'monthly' ? '12' : '52'} periods)</option>
                      <option value="2">2 Years ({resOptInputs.timeStep === 'monthly' ? '24' : '104'} periods)</option>
                      <option value="3">3 Years ({resOptInputs.timeStep === 'monthly' ? '36' : '156'} periods)</option>
                      <option value="4">4 Years ({resOptInputs.timeStep === 'monthly' ? '48' : '208'} periods)</option>
                      <option value="5">5 Years ({resOptInputs.timeStep === 'monthly' ? '60' : '260'} periods)</option>
                    </select>
                  </div>
                </div>

                {/* Hydrologic Inflow Cycle */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Hydrology Scenario
                    </label>
                    <select
                      value={resOptInputs.hydrologyScenario}
                      onChange={(e) => setResOptInputs({ ...resOptInputs, hydrologyScenario: e.target.value as any })}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="realistic_cycle">Multi-Year Wet/Dry Drought Cycle</option>
                      <option value="drought_stress">Critical Drought Stress Scenario</option>
                      <option value="average_normal">Average Normal Hydrology</option>
                      <option value="wet_flood">High Wet / Surcharge Flood Cycle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Mean Annual Inflow [MCM/yr]
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="50"
                      max="10000"
                      value={resOptInputs.meanAnnualInflowMcm}
                      onChange={(e) => setResOptInputs({ ...resOptInputs, meanAnnualInflowMcm: parseFloat(e.target.value) || 720 })}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Monthly Time Series Data Source (CSV Upload & In-App Table Editor) */}
                <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200/80 dark:border-teal-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-[11px] font-bold text-teal-900 dark:text-teal-200">
                        Monthly Time Series (CSV &amp; Table)
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                      useCustomTimeSeries
                        ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {useCustomTimeSeries ? 'Custom CSV/Table Active' : 'Scenario Model Active'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Supply raw monthly series for inflows, individual demands (Drinking, Irrigation, Industry, Environmental Flow), and evaporation via CSV or edit directly in the table.
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1 border-y border-teal-100 dark:border-teal-900/40">
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-teal-100 dark:border-teal-900">
                      <div className="text-[9px] text-slate-400 uppercase">Inflow Series</div>
                      <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        {monthlyTimeSeriesRows.reduce((s, r) => s + r.inflowMcm, 0).toFixed(0)} MCM
                      </div>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-teal-100 dark:border-teal-900">
                      <div className="text-[9px] text-slate-400 uppercase">Demands Total</div>
                      <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {monthlyTimeSeriesRows.reduce((s, r) => s + (r.drinkingMcm + r.irrigationMcm + r.industryMcm + r.environmentalMcm), 0).toFixed(0)} MCM
                      </div>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-teal-100 dark:border-teal-900">
                      <div className="text-[9px] text-slate-400 uppercase">Avg Evap Depth</div>
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {(monthlyTimeSeriesRows.reduce((s, r) => s + (r.evaporationDepthM ?? 0.08), 0) / Math.max(1, monthlyTimeSeriesRows.length)).toFixed(3)} m/mo
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCustomTimeSeries}
                        onChange={(e) => setUseCustomTimeSeries(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Enable Custom Monthly Data</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomTimeSeries(true);
                        setIsTimeSeriesModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Edit Table / Upload CSV</span>
                    </button>
                  </div>
                </div>

                {/* 3. Reservoir Capacity Parameters */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Max Capacity [MCM]
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="10"
                      max="5000"
                      value={resOptInputs.maxCapacityMcm}
                      onChange={(e) => setResOptInputs({ ...resOptInputs, maxCapacityMcm: parseFloat(e.target.value) || 500 })}
                      className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Dead Storage [MCM]
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="1000"
                      value={resOptInputs.deadStorageMcm}
                      onChange={(e) => setResOptInputs({ ...resOptInputs, deadStorageMcm: parseFloat(e.target.value) || 50 })}
                      className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Initial Storage [MCM]
                    </label>
                    <input
                      type="number"
                      step="20"
                      min="1"
                      max="5000"
                      value={resOptInputs.initialStorageMcm}
                      onChange={(e) => setResOptInputs({ ...resOptInputs, initialStorageMcm: parseFloat(e.target.value) || 350 })}
                      className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Reservoir Height-Area-Volume (H-A-V) Stage-Storage Curve */}
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                        Height-Area-Volume (H-A-V) Curve
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                      {havCurve.length} Points Configured
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Elevation-Area-Capacity relationship dynamically calculates pool elevation Z(S) for hydropower head and surface area A(S) for evaporation depth (1 km² × 1 m = 1 MCM).
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1 border-y border-indigo-100 dark:border-indigo-900/40">
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-indigo-100 dark:border-indigo-900">
                      <div className="text-[9px] text-slate-400 uppercase">Min Stage</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {havCurve[0]?.elevationM.toFixed(1)} m
                      </div>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-indigo-100 dark:border-indigo-900">
                      <div className="text-[9px] text-slate-400 uppercase">Crest Stage</div>
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {havCurve[havCurve.length - 1]?.elevationM.toFixed(1)} m
                      </div>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-indigo-100 dark:border-indigo-900">
                      <div className="text-[9px] text-slate-400 uppercase">Max Area</div>
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {havCurve[havCurve.length - 1]?.areaKm2.toFixed(1)} km²
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div>
                      <label className="text-[10px] text-slate-500 font-mono block">Tailwater El. [m]</label>
                      <input
                        type="number"
                        step="1"
                        value={tailwaterElevationM}
                        onChange={(e) => setTailwaterElevationM(parseFloat(e.target.value) || 310)}
                        className="w-24 text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsHavModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Edit H-A-V Curve / CSV</span>
                    </button>
                  </div>
                </div>

                {/* 4. Hydraulic Release Limits (m3/s and automatic MCM/period conversion) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Hydraulic Release &amp; Spillway Capacities
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                      Combined Downstream Architecture
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                        Outlet Limit [m³/s]
                      </label>
                      <input
                        type="number"
                        step="5"
                        min="5"
                        max="500"
                        value={resOptInputs.maxReleaseM3s}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, maxReleaseM3s: parseFloat(e.target.value) || 60 })}
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        ≈ {(resOptInputs.maxReleaseM3s * (resOptInputs.timeStep === 'monthly' ? 2.6298 : 0.6048)).toFixed(1)} MCM/{resOptInputs.timeStep === 'monthly' ? 'mo' : 'wk'}
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                        Spillway Cap. [m³/s]
                      </label>
                      <input
                        type="number"
                        step="50"
                        min="50"
                        max="5000"
                        value={resOptInputs.spillwayCapacityM3s}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, spillwayCapacityM3s: parseFloat(e.target.value) || 450 })}
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        ≈ {(resOptInputs.spillwayCapacityM3s * (resOptInputs.timeStep === 'monthly' ? 2.6298 : 0.6048)).toFixed(0)} MCM/{resOptInputs.timeStep === 'monthly' ? 'mo' : 'wk'}
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                        Turbine Flow [m³/s]
                      </label>
                      <input
                        type="number"
                        step="5"
                        min="5"
                        max="500"
                        value={resOptInputs.maxTurbineReleaseM3s}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, maxTurbineReleaseM3s: parseFloat(e.target.value) || 45 })}
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        ≈ {(resOptInputs.maxTurbineReleaseM3s * (resOptInputs.timeStep === 'monthly' ? 2.6298 : 0.6048)).toFixed(1)} MCM/{resOptInputs.timeStep === 'monthly' ? 'mo' : 'wk'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    ℹ️ Hydropower release and non-power outlet releases are combined to meet all downstream demands (Drinking, Irrigation, Industry, and Environment).
                  </div>
                </div>

                {/* 5. Hydropower Generation Parameters (Dynamic Calculated Head) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Hydropower Generation (Dynamic Head)
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-semibold">
                      H_net = Z(S) - Z_tw - h_loss
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Head Loss (h_loss) [m]
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={resOptInputs.headLossM}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, headLossM: parseFloat(e.target.value) || 2.5 })}
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        placeholder="Penstock friction"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Tailwater El. (Z_tw) [m]
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={tailwaterElevationM}
                        onChange={(e) => setTailwaterElevationM(parseFloat(e.target.value) || 195)}
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        placeholder="Downstream tailwater"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Turbine Efficiency (η)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.5"
                        max="0.95"
                        value={resOptInputs.turbineEfficiency}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, turbineEfficiency: parseFloat(e.target.value) || 0.86 })}
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <div>
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                        Energy Target [GWh/period]
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="500"
                        value={resOptInputs.energyDemandGwhPerPeriod}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, energyDemandGwhPerPeriod: parseFloat(e.target.value) || 12 })}
                        className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Hydropower Weight</span>
                        <span className="text-teal-600 font-mono font-bold">w: {resOptInputs.weightHydropower}</span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        max="1000"
                        value={resOptInputs.weightHydropower}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, weightHydropower: parseFloat(e.target.value) || 3.5 })}
                        className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
                    <div className="font-mono text-teal-700 dark:text-teal-300 font-semibold">
                      ⚡ Power(t) = η × 9810 × Q_hydro(t) × (WaterLevel(t) - Tailwater - h_loss)
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Net Head = max(0, Z(S) - {tailwaterElevationM}m - {resOptInputs.headLossM}m). Energy (GWh) = (9.81 × η × H_net / 3600) × V_hydro.
                    </div>
                  </div>
                </div>

                {/* 6. Demands & Allocation Importance Weights (Including Storage Target Weight) */}
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                      Demands &amp; Conservation Importance Weights
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                      Storage Weight Active
                    </span>
                  </div>

                  {/* Dedicated Storage Target Conservation Weight Card */}
                  <div className="p-2.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-purple-900 dark:text-purple-200">
                        🛡️ Reservoir Storage Target Weight (w_storage)
                      </span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700">
                        Weight: {resOptInputs.weightStorage}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
                      Higher storage weight penalizes storage target deficits so the optimizer curtails low-priority releases and preserves reservoir storage without compromising pool carryover.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={resOptInputs.weightStorage}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, weightStorage: parseFloat(e.target.value) || 0 })}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        step="1"
                        value={resOptInputs.weightStorage}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, weightStorage: parseFloat(e.target.value) || 0 })}
                        className="w-16 text-xs font-mono px-1.5 py-0.5 text-center rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[9px] text-slate-500 font-mono uppercase">Presets:</span>
                      {[
                        { label: 'Low (2)', val: 2 },
                        { label: 'Standard (10)', val: 10 },
                        { label: 'High (50)', val: 50 },
                        { label: 'Critical Target (100)', val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setResOptInputs({ ...resOptInputs, weightStorage: preset.val })}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            resOptInputs.weightStorage === preset.val
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mass Balance & Release Equations Display */}
                  <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[10px] font-mono space-y-1 text-slate-600 dark:text-slate-400">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      🌊 S(t+1) = S(t) + Inflow(t) - Release(t) - HydroRelease(t) - Evaporation(t) - Spillage(t)
                    </div>
                    <div>
                      🎯 Release(t) + HydroRelease(t) ≥ Drinking(t) + Irrigation(t) + Industry(t) + Environmental(t)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Drinking Water</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-mono text-[9px]">w:</span>
                          <input
                            type="number"
                            min="0.1"
                            max="1000"
                            step="0.5"
                            value={resOptInputs.weightDrinking}
                            onChange={(e) => setResOptInputs({ ...resOptInputs, weightDrinking: parseFloat(e.target.value) || 5 })}
                            className="w-12 text-[10px] font-mono font-bold text-center px-1 py-0.5 rounded border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                            title="Drinking water priority weight"
                          />
                        </div>
                      </div>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={resOptInputs.drinkingDemandMcm}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, drinkingDemandMcm: parseFloat(e.target.value) || 15 })}
                        className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        placeholder="MCM/period"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Irrigation Agriculture</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-mono text-[9px]">w:</span>
                          <input
                            type="number"
                            min="0.1"
                            max="1000"
                            step="0.5"
                            value={resOptInputs.weightIrrigation}
                            onChange={(e) => setResOptInputs({ ...resOptInputs, weightIrrigation: parseFloat(e.target.value) || 3 })}
                            className="w-12 text-[10px] font-mono font-bold text-center px-1 py-0.5 rounded border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                            title="Irrigation priority weight"
                          />
                        </div>
                      </div>
                      <input
                        type="number"
                        step="2"
                        min="0"
                        value={resOptInputs.irrigationDemandMcm}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, irrigationDemandMcm: parseFloat(e.target.value) || 35 })}
                        className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        placeholder="MCM/period"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Industry Demand</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-mono text-[9px]">w:</span>
                          <input
                            type="number"
                            min="0.1"
                            max="1000"
                            step="0.5"
                            value={resOptInputs.weightIndustry}
                            onChange={(e) => setResOptInputs({ ...resOptInputs, weightIndustry: parseFloat(e.target.value) || 2.5 })}
                            className="w-12 text-[10px] font-mono font-bold text-center px-1 py-0.5 rounded border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                            title="Industry priority weight"
                          />
                        </div>
                      </div>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={resOptInputs.industryDemandMcm}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, industryDemandMcm: parseFloat(e.target.value) || 8 })}
                        className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        placeholder="MCM/period"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Environmental Flow</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-mono text-[9px]">w:</span>
                          <input
                            type="number"
                            min="0.1"
                            max="1000"
                            step="0.5"
                            value={resOptInputs.weightEnvironmental}
                            onChange={(e) => setResOptInputs({ ...resOptInputs, weightEnvironmental: parseFloat(e.target.value) || 4 })}
                            className="w-12 text-[10px] font-mono font-bold text-center px-1 py-0.5 rounded border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                            title="Environmental flow priority weight"
                          />
                        </div>
                      </div>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={resOptInputs.environmentalFlowMcm}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, environmentalFlowMcm: parseFloat(e.target.value) || 5 })}
                        className="w-full text-xs font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        placeholder="MCM/period"
                      />
                    </div>
                  </div>

                  {/* Hashimoto Performance Objectives (Reliability, Vulnerability, Resiliency) */}
                  <div className="p-2.5 rounded-lg bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        Hashimoto Multi-Criteria Objectives
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold">
                        Normalized [0, 1]
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
                      Optimizes system reliability (α), prevents extreme deficit spikes (vulnerability ν), and accelerates drought recovery (resiliency γ) alongside normalized demands and storage.
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-0.5 text-xs">
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Reliability (w_α)</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          value={resOptInputs.weightReliability}
                          onChange={(e) => setResOptInputs({ ...resOptInputs, weightReliability: parseFloat(e.target.value) || 0 })}
                          className="w-full text-xs font-mono font-bold text-center px-1.5 py-1 rounded border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300"
                          title="Penalizes system unreliability (1 - alpha)"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Vulnerability (w_ν)</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          value={resOptInputs.weightVulnerability}
                          onChange={(e) => setResOptInputs({ ...resOptInputs, weightVulnerability: parseFloat(e.target.value) || 0 })}
                          className="w-full text-xs font-mono font-bold text-center px-1.5 py-1 rounded border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300"
                          title="Penalizes deficit severity during droughts (nu)"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Resiliency (w_γ)</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          value={resOptInputs.weightResiliency}
                          onChange={(e) => setResOptInputs({ ...resOptInputs, weightResiliency: parseFloat(e.target.value) || 0 })}
                          className="w-full text-xs font-mono font-bold text-center px-1.5 py-1 rounded border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300"
                          title="Penalizes slow drought recovery (1 - gamma)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Rule Curve Options (User Inquiry & Optimal Derivation) */}
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                  <label className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                    📐 Reservoir Rule Curve (Storage Target Strategy)
                  </label>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">
                    Would you like to apply rule curves to guide seasonal storage trajectories or ask the app to determine the optimal rule curve?
                  </p>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ruleCurveMode"
                        value="derive_optimal"
                        checked={resOptInputs.ruleCurveMode === 'derive_optimal'}
                        onChange={() => setResOptInputs({ ...resOptInputs, ruleCurveMode: 'derive_optimal' })}
                        className="text-teal-600"
                      />
                      <span className="font-semibold text-teal-700 dark:text-teal-300">
                        ⚡ Determine Reservoir Optimal Rule Curve (Calculated by App)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ruleCurveMode"
                        value="apply_target"
                        checked={resOptInputs.ruleCurveMode === 'apply_target'}
                        onChange={() => setResOptInputs({ ...resOptInputs, ruleCurveMode: 'apply_target' })}
                        className="text-teal-600"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Apply Fixed Storage Target Rule Curve (% Active Capacity)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ruleCurveMode"
                        value="none"
                        checked={resOptInputs.ruleCurveMode === 'none'}
                        onChange={() => setResOptInputs({ ...resOptInputs, ruleCurveMode: 'none' })}
                        className="text-teal-600"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        No Rule Curve (Pure Opportunistic Optimization)
                      </span>
                    </label>
                  </div>

                  {resOptInputs.ruleCurveMode === 'apply_target' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span>Target Storage Level:</span>
                        <span className="font-bold text-teal-600">{resOptInputs.userTargetStoragePct}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="95"
                        value={resOptInputs.userTargetStoragePct}
                        onChange={(e) => setResOptInputs({ ...resOptInputs, userTargetStoragePct: parseInt(e.target.value) || 80 })}
                        className="w-full accent-teal-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pro Engineering Advanced Parameters Accordion (Accessible to all / highlighted for Pro) */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowProOptions(!showProOptions)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer py-1"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ Pro Engineering Advanced Parameters</span>
                </div>
                {showProOptions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showProOptions && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-amber-600 font-bold">Pro Precision Mode</span>
                    <span className="text-slate-400">P.E. Calibration Active</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Arrhenius Temperature Kinetic Theta (θ)</label>
                    <input
                      type="number"
                      step="0.005"
                      defaultValue="1.047"
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hydraulic Dispersion Number (d = D / u·L)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="0.05"
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Safety Peaking Multiplier Factor (PF)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="1.25"
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Calibrated under ISO 14001 / EPA Water Quality Technical Support Guidance.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visuals, Outputs, & Step Derivations (7 cols on large) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Primary Result Banner */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block">
                {result.primaryLabel}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {result.primaryValue}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">
                  {result.primaryUnit}
                </span>
              </div>
              {result.statusLabel && (
                <div className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                  Status: <span className="font-semibold text-sky-600 dark:text-sky-400">{result.statusLabel}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenReport(result, currentInputsObject)}
              className="text-xs font-mono text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Export Report →
            </button>
          </div>

          {/* Interactive Dynamic Visualizer Display */}
          {calculator.id === 'carlson-tsi' && (
            <CarlsonGauge
              tsi={parseFloat(String(result.primaryValue))}
              trophicClass={result.statusLabel || 'Eutrophic'}
            />
          )}

          {calculator.id === 'streeter-phelps-sag' && 'curvePoints' in result && (
            <StreeterPhelpsSagCurve
              curvePoints={(result as any).curvePoints}
              minDO={parseFloat(String(result.primaryValue))}
              tc={parseFloat(String(result.secondaryOutputs[0]?.value || 0))}
              DOsat={streeterInputs.DOsat}
              criticalDistKm={parseFloat(String(result.secondaryOutputs[1]?.value || 0))}
            />
          )}

          {calculator.id === 'sequent-peak-reservoir' && 'cumInflow' in result && (
            <RipplMassCurve
              cumInflow={(result as any).cumInflow}
              cumDemand={(result as any).cumDemand}
              deficits={(result as any).deficits}
              labels={(result as any).labels}
              maxDeficitIndex={(result as any).maxDeficitIndex}
              maxDeficitValue={parseFloat(String(result.primaryValue))}
              unitLabel={result.primaryUnit}
            />
          )}

          {calculator.id === 'activated-sludge' && (
            <div className="space-y-3">
              {/* Diagram Tab Switcher */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveDiagramTab('process')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeDiagramTab === 'process'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Treatment Plant Process Diagram &amp; Unit Sizing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiagramTab('schematic')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeDiagramTab === 'schematic'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Aeration Basin &amp; Solids Mass Balance
                </button>
              </div>

              {activeDiagramTab === 'process' ? (
                <ActivatedSludgeProcessDiagram
                  specs={{
                    volume: parseFloat(String(result.primaryValue).replace(/,/g, '')),
                    hrt: parseFloat(String(result.secondaryOutputs[0]?.value || 6)),
                    srt: sludgeInputs.srt,
                    fm: parseFloat(String(result.secondaryOutputs[1]?.value || 0.25)),
                    mlss: sludgeInputs.mlss,
                    o2Demand: parseFloat(String(result.secondaryOutputs[2]?.value || 0).replace(/,/g, '')),
                    rasFlow: parseFloat(String(result.secondaryOutputs[4]?.value || 400)),
                    flowRate: sludgeInputs.flowQ,
                  }}
                />
              ) : (
                <ActivatedSludgeSchematic
                  flowQ={sludgeInputs.flowQ}
                  bodIn={sludgeInputs.bodIn}
                  bodOut={sludgeInputs.bodOut}
                  mlss={sludgeInputs.mlss}
                  volumeM3={parseFloat(String(result.primaryValue).replace(/,/g, ''))}
                  hrtHours={parseFloat(String(result.secondaryOutputs[0]?.value || 6))}
                  srtDays={sludgeInputs.srt}
                  fmRatio={parseFloat(String(result.secondaryOutputs[1]?.value || 0.25))}
                  roKgDay={parseFloat(String(result.secondaryOutputs[2]?.value || 0).replace(/,/g, ''))}
                  rasRatioPct={parseFloat(String(result.secondaryOutputs[4]?.value || 40))}
                  qwM3Day={parseFloat(String(result.secondaryOutputs[3]?.value || 100))}
                />
              )}
            </div>
          )}

          {calculator.id === 'pumped-storage-hydro' && (
            <PumpedStorageVisualizer
              headM={pumpedInputs.headM}
              flowGenM3s={pumpedInputs.flowGenM3s}
              powerMw={parseFloat(String(result.primaryValue))}
              energyMwh={parseFloat(String(result.secondaryOutputs[0]?.value || 0))}
              rtePct={parseFloat(String(result.secondaryOutputs[3]?.value || 78))}
            />
          )}

          {calculator.id === 'penman-monteith-et0' && (
            <div className="space-y-4">
              {/* FAO-56 Energy Balance & Soil Moisture Physics Diagram */}
              <PenmanMonteithProcessDiagram
                specs={{
                  et0: parseFloat(String(result.primaryValue)) || 4.25,
                  temp: penmanInputs.tempMean,
                  humidity: penmanInputs.relHumidity,
                  windSpeed: penmanInputs.windSpeed,
                  solarRad: penmanInputs.solarRad,
                  cropName: 'Reference Grass / Agricultural Crops',
                  kc: 1.15,
                  rootDepth: 0.8,
                }}
              />

              {'seasonalMonthlyET0' in result && (
                <PenmanMonteithChart
                  seasonalData={(result as any).seasonalMonthlyET0}
                  dailyEt0={parseFloat(String(result.primaryValue))}
                />
              )}

              {/* Major Crop Water Demand Table based on FAO-56 Kc */}
              {'cropDemands' in result && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                      Crop Water Consumption Table (FAO-56 K_c Benchmark)
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">ET_c = K_c × ET_0</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-2">Crop Variety</th>
                          <th className="p-2 text-center">K_c (Mid)</th>
                          <th className="p-2 text-right">Daily ET_c (mm/d)</th>
                          <th className="p-2 text-right">Monthly Water (m³/ha)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                        {(result as any).cropDemands.map((c: any) => (
                          <tr key={c.cropName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{c.cropName}</td>
                            <td className="p-2 text-center text-slate-500">{c.kcMid.toFixed(2)}</td>
                            <td className="p-2 text-right font-bold text-sky-600 dark:text-sky-400">{c.etcMmDay}</td>
                            <td className="p-2 text-right text-slate-900 dark:text-white">{c.monthlyWaterM3Ha.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Treatment Train Advisor Output Viewer */}
          {calculator.id === 'ai-treatment-train' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Treatment Train Design Assessment
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Metcalf &amp; Eddy / EPA SWTR
                  </span>
                </div>
              </div>

              {advisorReport ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[550px] overflow-y-auto text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap font-mono">
                    {advisorReport}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Report ready for download in PDF, Word (.doc) and PNG formats.
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadWordReport(calculator, result, currentInputsObject)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Full Word (.doc)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Synthesize Treatment Train
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                      Configure your raw water parameters on the left and click "Generate AI Treatment Train Report" to produce an exhaustive multi-barrier design report.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAdvisorReport}
                    disabled={isAdvisorLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Generate Complete Engineering Report</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Waste Stabilization Ponds Visual Card */}
          {calculator.id === 'ponds-treatment' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                  Waste Stabilization Pond Train Sequence
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Anaerobic → Facultative → Maturation</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/40">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">1. Anaerobic Cell</div>
                  <div className="text-sm font-bold text-white mt-1">Depth: 3.5 m</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">BOD Removal: 50–70%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-teal-500/40">
                  <div className="text-[10px] text-teal-400 font-bold uppercase">2. Facultative Cell</div>
                  <div className="text-sm font-bold text-white mt-1">Depth: 1.5 m</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Algae-Bacterial Symbiosis</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-sky-500/40">
                  <div className="text-[10px] text-sky-400 font-bold uppercase">3. Maturation Series</div>
                  <div className="text-sm font-bold text-white mt-1">Depth: 1.2 m</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">UV Sun Pathogen Die-Off</div>
                </div>
              </div>
            </div>
          )}

          {/* Reverse Osmosis Desalination Visual Card */}
          {calculator.id === 'desalination-ro' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono">
                  Reverse Osmosis Pressure &amp; Energy Recovery Balance
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Isobaric ERD (95% Efficiency)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-lg border border-sky-500/40">
                  <div className="text-[10px] text-sky-400 font-bold uppercase">Feed Solution</div>
                  <div className="text-sm font-bold text-white mt-1">{desalInputs.feedTds.toLocaleString()} mg/L</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Flow: {desalInputs.feedFlow} m³/h</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-teal-500/40">
                  <div className="text-[10px] text-teal-400 font-bold uppercase">Permeate Pure</div>
                  <div className="text-sm font-bold text-white mt-1">&lt; 150 mg/L TDS</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Recovery: {desalInputs.recovery}%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/40">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Brine Reject</div>
                  <div className="text-sm font-bold text-white mt-1">Energy Recycled</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">PX High-Pressure Transfer</div>
                </div>
              </div>
            </div>
          )}

          {calculator.id === 'crop-water-requirement' && 'waterDemandSchedule' in result && (
            <CropWaterChart
              schedule={(result as any).waterDemandSchedule}
              cropName={cropInputs.cropName}
              grossTotal={parseFloat(String(result.primaryValue))}
            />
          )}

          {calculator.id === 'manning-open-channel' && (
            <OpenChannelCrossSection
              channelType={manningInputs.channelType}
              bottomWidth={manningInputs.bottomWidth}
              waterDepth={manningInputs.waterDepth}
              sideSlopeZ={manningInputs.sideSlopeZ}
              froudeNumber={parseFloat(String(result.secondaryOutputs[1]?.value || 0.5))}
              flowVelocity={parseFloat(String(result.secondaryOutputs[0]?.value || 1.2))}
              pipeDiameter={manningInputs.pipeDiameter}
            />
          )}

          {calculator.id === 'reservoir-optimization' && result.diagramData && (
            <ReservoirOptimizationVisualizer data={result.diagramData as any} />
          )}

          {/* Secondary Calculated Outputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.secondaryOutputs.map((out, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="text-[11px] text-slate-500 truncate">{out.label}</div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {out.value} <span className="text-xs font-normal text-slate-400">{out.unit}</span>
                </div>
                {out.description && (
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{out.description}</div>
                )}
              </div>
            ))}
          </div>

          {/* "Show Your Work" Math Substitution and Derivation Steps */}
          <ShowYourWork
            steps={result.steps}
            reference={result.reference}
            isOpen={showDerivation}
            onToggle={() => setShowDerivation(!showDerivation)}
            showText={t.showYourWork}
            hideText={t.hideYourWork}
            stepWord={t.step}
            formulaWord={t.formula}
            substWord={t.substitution}
            resultWord={t.result}
          />
        </div>
      </div>

      {/* Reservoir Optimization Monthly Time Series Modal (Inflows, Demands, Evaporation CSV / Table) */}
      <ReservoirTimeSeriesModal
        isOpen={isTimeSeriesModalOpen}
        onClose={() => setIsTimeSeriesModalOpen(false)}
        rows={monthlyTimeSeriesRows}
        onUpdateRows={(newRows) => setMonthlyTimeSeriesRows(newRows)}
        onResetToBaseline={handleResetTimeSeriesBaseline}
        years={resOptInputs.years}
      />

      {/* Reservoir Height-Area-Volume (H-A-V) Stage-Storage Curve Modal */}
      <ReservoirHavCurveModal
        isOpen={isHavModalOpen}
        onClose={() => setIsHavModalOpen(false)}
        curve={havCurve}
        onUpdateCurve={(newCurve) => setHavCurve(newCurve)}
        onResetToDefault={() => setHavCurve(generateDefaultHavCurve(resOptInputs.maxCapacityMcm))}
        maxCapacityMcm={resOptInputs.maxCapacityMcm}
      />
    </div>
  );
};
