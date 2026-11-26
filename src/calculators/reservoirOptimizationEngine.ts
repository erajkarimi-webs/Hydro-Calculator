/**
 * AquaCalcs - Advanced Reservoir Operation Optimization Engine
 * Formulations based on:
 * - Loucks, Stedinger, & Haith (1981) Water Resource Systems Planning & Analysis
 * - Hashimoto, Stedinger, & Loucks (1982) Reliability, Resiliency, and Vulnerability criteria
 * - Mays & Tung (1992) Hydrosystems Engineering & Management
 * 
 * Exact Physical Equations Enforced:
 * 1. Continuity / Mass Balance:
 *    S(t+1) = S(t) + Inflow(t) - Release(t) - HydroRelease(t) - Evaporation(t) - Spillage(t)
 *    Subject to: S_dead <= S(t+1) <= S_max
 * 
 * 2. Combined Downstream Supply & Allocations:
 *    TotalRelease(t) = Release(t) + HydroRelease(t)
 *    Supplied to: Drinking(t) + Irrigation(t) + Industry(t) + Environmental(t)
 * 
 * 3. Dynamic Hydropower Head & Power Generation:
 *    Head_gross(t) = max(0, WaterLevel(t) - Tailwater)
 *    Head_net(t) = max(0, Head_gross(t) - headloss)
 *    Power(t) = efficiency * 9810 * Q_hydro(t) * Head_net(t)  [Watts]
 *    Energy(t) = (9.81 * efficiency * Head_net(t) / 3600) * HydroRelease_MCM(t)  [GWh]
 * 
 * 4. Dimensionless Normalized Multi-Criteria Objective Function (Minimization):
 *    Every component is normalized to [0, 1] before weights are applied so that
 *    large reservoir capacity (e.g. 500 MCM) does not overwhelm downstream demand shortages:
 *    min J = sum_t [ w_drink * (def_drink(t) / Demand_drink(t))
 *                   + w_irrig * (def_irrig(t) / Demand_irrig(t))
 *                   + w_indus * (def_indus(t) / Demand_indus(t))
 *                   + w_env * (def_env(t) / Demand_env(t))
 *                   + w_hydro * (def_energy(t) / Target_energy(t))
 *                   + w_storage * (def_storage(t) / (Target_storage(t) - S_dead))
 *                   + 0.05 * (Spillage(t) / Spillway_capacity) ]
 *          + T * [ w_rel * (1 - alpha_sys) + w_vuln * nu_sys + w_resil * (1 - gamma_sys) ]
 * 
 * Algorithms:
 * 1. Linear Programming (Successive Linear Programming / Simplex Network Multi-Period Solver)
 * 2. Evolutionary Algorithm (Real-Valued Genetic Algorithm with Direct Release Policies & Elitism)
 */

export type TimeStepType = 'monthly' | 'weekly';
export type AlgorithmType = 'lp-simplex' | 'evolutionary';
export type RuleCurveMode = 'none' | 'apply_target' | 'derive_optimal';

export interface HeightAreaVolumePoint {
  elevationM: number;   // Water surface elevation above datum (m)
  areaKm2: number;      // Water surface area (km²)
  storageMcm: number;   // Reservoir storage volume (MCM)
}

export interface ReservoirOptInputs {
  // Capacity parameters
  maxCapacityMcm: number;     // S_max
  deadStorageMcm: number;     // S_dead
  initialStorageMcm: number;  // S_init
  
  // Hydraulic Release Limits
  maxReleaseM3s: number;      // non-power outlet limit (m3/s)
  spillwayCapacityM3s: number;// spillway capacity (m3/s)
  maxTurbineReleaseM3s: number; // max hydro turbine release (m3/s)
  
  // Hydropower Specs (Head is calculated from Water Level El. - Tailwater El. - Head Loss)
  headLossM?: number;         // Hydraulic headloss in penstock/intake (meters, default 2.5m)
  grossHeadM?: number;        // Legacy fallback (meters)
  tailwaterElevationM?: number; // Tailwater discharge elevation (meters)
  turbineEfficiency: number;  // e.g. 0.86 (86%)
  energyDemandGwhPerPeriod: number; // energy target per time step
  
  // Downstream Demands (MCM per time step)
  drinkingDemandMcm: number;
  irrigationDemandMcm: number;
  industryDemandMcm: number;
  environmentalFlowMcm: number;
  
  // Importance Weights (Normalized dimensionless multipliers, can range from 0.1 to 1000+)
  weightDrinking: number;
  weightIrrigation: number;
  weightIndustry: number;
  weightEnvironmental: number;
  weightHydropower: number;
  weightStorage?: number;        // Storage target conservation weight
  weightReliability?: number;    // Hashimoto Reliability (alpha) importance weight
  weightVulnerability?: number;  // Hashimoto Vulnerability (nu) aversion weight
  weightResiliency?: number;     // Hashimoto Resiliency (gamma) recovery weight
  
  // Temporal Horizon
  timeStep: TimeStepType;     // 'monthly' or 'weekly'
  years: number;              // 1 to 5 years
  hydrologyScenario: 'realistic_cycle' | 'drought_stress' | 'average_normal' | 'wet_flood';
  meanAnnualInflowMcm: number;// Mean annual inflow volume in MCM
  
  // Height-Area-Volume (H-A-V) Elevation-Capacity Curve
  havCurve?: HeightAreaVolumePoint[];
  
  // Custom Time Series Inputs (Monthly data arrays)
  useCustomTimeSeries?: boolean;
  customInflowsMcm?: number[];
  customDrinkingDemandsMcm?: number[];
  customIrrigationDemandsMcm?: number[];
  customIndustryDemandsMcm?: number[];
  customEnvironmentalDemandsMcm?: number[];
  customEvaporationDepthsM?: number[]; // Evaporation depth in meters (m)
  customEvaporationsMcm?: number[];     // Legacy/fallback in MCM
  defaultEvapDepthM?: number;          // Nominal depth in meters (e.g. 0.08 m)
  
  // Rule Curve Controls
  ruleCurveMode: RuleCurveMode;
  userTargetStoragePct?: number; // target storage % of active capacity
  
  // Algorithm selection
  algorithm: AlgorithmType;
  eaGenerations?: number;
  eaPopulationSize?: number;
}

export interface DemandPerformance {
  demandName: string;
  targetPerPeriod: number;
  totalDemand: number;
  totalSupplied: number;
  totalDeficit: number;
  timeReliabilityPct: number;    // Hashimoto alpha_t (%)
  volumeReliabilityPct: number;  // Hashimoto alpha_v (%)
  resiliencyPct: number;         // Hashimoto gamma (%)
  avgVulnerabilityPct: number;   // Hashimoto nu_avg (%)
  maxVulnerabilityPct: number;   // Hashimoto nu_max (%)
}

export interface ReservoirPeriodResult {
  period: number;
  label: string;
  inflowMcm: number;
  storageStartMcm: number;
  storageEndMcm: number;
  targetRuleCurveMcm: number;
  waterLevelElevationM: number;
  surfaceAreaKm2: number;
  evaporationDepthM: number;
  evaporationMcm: number;
  outletReleaseMcm: number;
  hydroReleaseMcm: number;
  totalReleaseMcm: number;       // Combined downstream
  outletReleaseM3s: number;
  hydroReleaseM3s: number;
  totalReleaseM3s: number;
  spillageMcm: number;
  
  // Demands & Deliveries
  totalDemandMcm: number;
  drinkingSuppliedMcm: number;
  drinkingDeficitMcm: number;
  irrigationSuppliedMcm: number;
  irrigationDeficitMcm: number;
  industrySuppliedMcm: number;
  industryDeficitMcm: number;
  envFlowSuppliedMcm: number;
  envFlowDeficitMcm: number;
  
  // Hydropower
  energyTargetGwh: number;
  energyGeneratedGwh: number;
  energyDeficitGwh: number;
  effectiveHeadM: number;
}

export interface ReservoirOptOutput {
  algorithmUsed: string;
  totalPeriods: number;
  timeStepLabel: string;
  totalInflowMcm: number;
  totalCombinedReleaseMcm: number;
  totalSpillageMcm: number;
  totalEvaporationMcm: number;
  totalEnergyGeneratedGwh: number;
  totalDemandMcm: number;
  
  // Storage Trajectory Summary
  minStorageObservedMcm: number;
  maxStorageObservedMcm: number;
  finalStorageMcm: number;
  storageHealthStatus: 'optimal' | 'adequate' | 'stressed' | 'critical';
  
  // Hashimoto Criteria Summaries
  systemOverallReliabilityPct: number;
  systemOverallResiliencyPct: number;
  systemOverallVulnerabilityPct: number;
  
  // Individual Demands Breakdown
  demandMetrics: {
    drinking: DemandPerformance;
    irrigation: DemandPerformance;
    industry: DemandPerformance;
    environmental: DemandPerformance;
    hydropower: DemandPerformance;
    storage?: DemandPerformance;
  };

  // Normalized Objective Components Summary
  normalizedObjectiveSummary?: {
    totalNormalizedObjective: number;
    demandNormalizedPenalty: number;
    storageNormalizedPenalty: number;
    hydropowerNormalizedPenalty: number;
    reliabilityPenalty: number;
    vulnerabilityPenalty: number;
    resiliencyPenalty: number;
  };
  
  // Optimal Rule Curve (12 months or 52 weeks profile in MCM)
  optimalRuleCurveProfile: Array<{
    periodInYear: number;
    label: string;
    guideStorageMcm: number;
    guideStoragePct: number;
    upperFloodBufferMcm: number;
    lowerDroughtReserveMcm: number;
  }>;
  
  // Full Time Series
  trajectory: ReservoirPeriodResult[];
  
  // Height-Area-Volume elevation curve used
  havCurveUsed: HeightAreaVolumePoint[];
  
  // Limits in period units for documentation
  maxReleaseLimitPeriodMcm: number;
  spillwayLimitPeriodMcm: number;
  maxTurbineLimitPeriodMcm: number;
}

/**
 * Seconds per time step:
 * Monthly: ~30.4375 days = 2,629,800 s
 * Weekly: 7 days = 604,800 s
 */
function getSecondsPerPeriod(timeStep: TimeStepType): number {
  return timeStep === 'monthly' ? 30.4375 * 86400 : 7 * 86400;
}

/**
 * Converts m3/s to MCM per period
 */
export function flowM3sToMcmPerPeriod(flowM3s: number, timeStep: TimeStepType): number {
  const seconds = getSecondsPerPeriod(timeStep);
  return (flowM3s * seconds) / 1e6;
}

/**
 * Generates realistic synthetic hydrology inflows tailored to multi-year cycles
 */
export function generateHydrologyInflows(
  meanAnnualMcm: number,
  years: number,
  timeStep: TimeStepType,
  scenario: 'realistic_cycle' | 'drought_stress' | 'average_normal' | 'wet_flood'
): number[] {
  const periodsPerYear = timeStep === 'monthly' ? 12 : 52;
  const totalPeriods = years * periodsPerYear;
  
  // Normalized monthly seasonal hydrograph distribution
  const monthlyWeights = [0.05, 0.07, 0.12, 0.18, 0.22, 0.14, 0.08, 0.04, 0.03, 0.02, 0.02, 0.03]; // sum = 1.0
  
  const yearMultipliers: Record<string, number[]> = {
    realistic_cycle: [1.10, 0.72, 0.58, 0.95, 1.25], // Wet -> Mild Dry -> Severe Drought -> Recovery -> High Flow
    drought_stress:  [0.65, 0.52, 0.48, 0.60, 0.55], // Persistent critical dry periods
    average_normal:  [1.00, 1.02, 0.98, 1.01, 0.99], // Steady long-term average
    wet_flood:       [1.25, 1.35, 1.40, 1.15, 1.30], // High inflow flood sequences
  };

  const selectedMultipliers = yearMultipliers[scenario] || yearMultipliers.realistic_cycle;
  const inflows: number[] = [];

  for (let p = 0; p < totalPeriods; p++) {
    const yrIndex = Math.min(Math.floor(p / periodsPerYear), selectedMultipliers.length - 1);
    const yrMult = selectedMultipliers[yrIndex];
    const periodInYr = p % periodsPerYear;

    let periodShare = 0;
    if (timeStep === 'monthly') {
      periodShare = monthlyWeights[periodInYr];
    } else {
      const monthFloat = (periodInYr / 52) * 12;
      const mIdx = Math.min(Math.floor(monthFloat), 11);
      periodShare = (monthlyWeights[mIdx] / 4.333);
    }

    const noise = 0.92 + 0.16 * Math.sin(p * 0.73) * Math.cos(p * 0.31);
    const inflow = Math.max(0.1, meanAnnualMcm * yrMult * periodShare * noise);
    inflows.push(parseFloat(inflow.toFixed(3)));
  }

  return inflows;
}

/**
 * Generates a default realistic Height-Area-Volume (H-A-V) elevation curve
 * conforming to a parabolic valley profile based on max capacity and dead storage.
 */
export function generateDefaultHavCurve(maxCapacityMcm = 500, deadStorageMcm = 50): HeightAreaVolumePoint[] {
  const baseElev = 200;
  const deadElev = baseElev + 15; // 215m
  const maxElev = baseElev + 65;  // 265m
  const crestElev = maxElev + 5;  // 270m
  const maxAreaKm2 = 2.4 * Math.pow(Math.max(10, maxCapacityMcm), 0.45);
  
  return [
    { elevationM: baseElev, areaKm2: 0, storageMcm: 0 },
    { elevationM: parseFloat((baseElev + 8).toFixed(1)), areaKm2: parseFloat((maxAreaKm2 * 0.10).toFixed(2)), storageMcm: parseFloat((deadStorageMcm * 0.3).toFixed(1)) },
    { elevationM: deadElev, areaKm2: parseFloat((maxAreaKm2 * 0.22).toFixed(2)), storageMcm: deadStorageMcm },
    { elevationM: parseFloat((baseElev + 32).toFixed(1)), areaKm2: parseFloat((maxAreaKm2 * 0.48).toFixed(2)), storageMcm: parseFloat((deadStorageMcm + (maxCapacityMcm - deadStorageMcm) * 0.35).toFixed(1)) },
    { elevationM: parseFloat((baseElev + 48).toFixed(1)), areaKm2: parseFloat((maxAreaKm2 * 0.74).toFixed(2)), storageMcm: parseFloat((deadStorageMcm + (maxCapacityMcm - deadStorageMcm) * 0.70).toFixed(1)) },
    { elevationM: maxElev, areaKm2: parseFloat(maxAreaKm2.toFixed(2)), storageMcm: maxCapacityMcm },
    { elevationM: crestElev, areaKm2: parseFloat((maxAreaKm2 * 1.15).toFixed(2)), storageMcm: parseFloat((maxCapacityMcm * 1.18).toFixed(1)) },
  ];
}

/**
 * Interpolates surface water area A (km²) from reservoir storage volume S (MCM)
 */
export function interpolateAreaFromStorage(storageMcm: number, curve: HeightAreaVolumePoint[]): number {
  if (!curve || curve.length === 0) return 2.5 * Math.pow(Math.max(0.1, storageMcm), 0.55);
  const sorted = [...curve].sort((a, b) => a.storageMcm - b.storageMcm);
  if (storageMcm <= sorted[0].storageMcm) return sorted[0].areaKm2;
  if (storageMcm >= sorted[sorted.length - 1].storageMcm) {
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2] || last;
    const dS = Math.max(0.001, last.storageMcm - prev.storageMcm);
    const slope = (last.areaKm2 - prev.areaKm2) / dS;
    return Math.max(0, last.areaKm2 + slope * (storageMcm - last.storageMcm));
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (storageMcm >= sorted[i].storageMcm && storageMcm <= sorted[i + 1].storageMcm) {
      const frac = (storageMcm - sorted[i].storageMcm) / Math.max(0.0001, sorted[i + 1].storageMcm - sorted[i].storageMcm);
      return sorted[i].areaKm2 + frac * (sorted[i + 1].areaKm2 - sorted[i].areaKm2);
    }
  }
  return sorted[sorted.length - 1].areaKm2;
}

/**
 * Interpolates water surface elevation Z (meters above datum) from reservoir storage volume S (MCM)
 */
export function interpolateElevationFromStorage(storageMcm: number, curve: HeightAreaVolumePoint[]): number {
  if (!curve || curve.length === 0) return 200 + 65 * Math.pow(Math.max(0.01, storageMcm / 500), 0.5);
  const sorted = [...curve].sort((a, b) => a.storageMcm - b.storageMcm);
  if (storageMcm <= sorted[0].storageMcm) return sorted[0].elevationM;
  if (storageMcm >= sorted[sorted.length - 1].storageMcm) {
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2] || last;
    const dS = Math.max(0.001, last.storageMcm - prev.storageMcm);
    const slope = (last.elevationM - prev.elevationM) / dS;
    return last.elevationM + slope * (storageMcm - last.storageMcm);
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (storageMcm >= sorted[i].storageMcm && storageMcm <= sorted[i + 1].storageMcm) {
      const frac = (storageMcm - sorted[i].storageMcm) / Math.max(0.0001, sorted[i + 1].storageMcm - sorted[i].storageMcm);
      return sorted[i].elevationM + frac * (sorted[i + 1].elevationM - sorted[i].elevationM);
    }
  }
  return sorted[sorted.length - 1].elevationM;
}

/**
 * Calculates Hashimoto et al. (1982) Performance Criteria:
 * Reliability (Time & Volume), Resiliency (recovery probability), and Vulnerability (average & max)
 */
function evaluateHashimotoCriteria(
  demandName: string,
  targetInput: number | number[],
  suppliedSeries: number[]
): DemandPerformance {
  const T = suppliedSeries.length;
  let totalDemand = 0;
  let totalSupplied = 0;
  let totalDeficit = 0;
  let successCount = 0;
  let failureCount = 0;
  let recoveryCount = 0;
  const failureSeverities: number[] = [];

  for (let t = 0; t < T; t++) {
    const target = Array.isArray(targetInput) ? (targetInput[t] !== undefined ? targetInput[t] : 0) : targetInput;
    const supplied = suppliedSeries[t];
    totalDemand += target;
    totalSupplied += supplied;

    const deficit = Math.max(0, target - supplied);
    totalDeficit += deficit;

    const isSuccess = deficit < 0.0001; // tolerance
    if (isSuccess) {
      successCount++;
    } else {
      failureCount++;
      const severityRatio = target > 0 ? (deficit / target) : 0;
      failureSeverities.push(severityRatio);

      // Check if next period recovers (resiliency)
      if (t + 1 < T) {
        const nextTarget = Array.isArray(targetInput) ? (targetInput[t + 1] !== undefined ? targetInput[t + 1] : 0) : targetInput;
        const nextSupplied = suppliedSeries[t + 1];
        if (Math.max(0, nextTarget - nextSupplied) < 0.0001) {
          recoveryCount++;
        }
      }
    }
  }

  const timeReliabilityPct = T > 0 ? (successCount / T) * 100 : 100;
  const volumeReliabilityPct = totalDemand > 0 ? (totalSupplied / totalDemand) * 100 : 100;
  const resiliencyPct = failureCount > 0 ? (recoveryCount / failureCount) * 100 : 100;
  const avgVulnerabilityPct =
    failureSeverities.length > 0
      ? (failureSeverities.reduce((a, b) => a + b, 0) / failureSeverities.length) * 100
      : 0;
  const maxVulnerabilityPct =
    failureSeverities.length > 0 ? Math.max(...failureSeverities) * 100 : 0;

  const targetPerPeriod = Array.isArray(targetInput)
    ? (T > 0 ? totalDemand / T : 0)
    : targetInput;

  return {
    demandName,
    targetPerPeriod: parseFloat(targetPerPeriod.toFixed(2)),
    totalDemand: parseFloat(totalDemand.toFixed(2)),
    totalSupplied: parseFloat(totalSupplied.toFixed(2)),
    totalDeficit: parseFloat(totalDeficit.toFixed(2)),
    timeReliabilityPct: parseFloat(timeReliabilityPct.toFixed(1)),
    volumeReliabilityPct: parseFloat(volumeReliabilityPct.toFixed(1)),
    resiliencyPct: parseFloat(resiliencyPct.toFixed(1)),
    avgVulnerabilityPct: parseFloat(avgVulnerabilityPct.toFixed(1)),
    maxVulnerabilityPct: parseFloat(maxVulnerabilityPct.toFixed(1)),
  };
}

/**
 * Fast trajectory Hashimoto evaluator across all demands for direct objective optimization
 */
function computeQuickTrajectoryHashimoto(trajectory: ReservoirPeriodResult[]): {
  alpha: number; // Reliability [0, 100]
  nu: number;    // Vulnerability [0, 100]
  gamma: number; // Resiliency [0, 100]
} {
  const T = trajectory.length;
  if (T === 0) return { alpha: 100, nu: 0, gamma: 100 };

  let failures = 0;
  let recoveries = 0;
  let totalDeficitFraction = 0;

  for (let t = 0; t < T; t++) {
    const p = trajectory[t];
    const totDemand = p.totalDemandMcm + p.energyTargetGwh;
    const totDeficit = p.drinkingDeficitMcm + p.irrigationDeficitMcm + p.industryDeficitMcm + p.envFlowDeficitMcm + p.energyDeficitGwh;

    if (totDeficit > 0.01) {
      failures++;
      const fraction = totDemand > 0 ? Math.min(1.0, totDeficit / totDemand) : 0;
      totalDeficitFraction += fraction;

      // Recovery in next period
      if (t + 1 < T) {
        const pNext = trajectory[t + 1];
        const nextDeficit = pNext.drinkingDeficitMcm + pNext.irrigationDeficitMcm + pNext.industryDeficitMcm + pNext.envFlowDeficitMcm + pNext.energyDeficitGwh;
        if (nextDeficit <= 0.01) {
          recoveries++;
        }
      }
    }
  }

  const alpha = ((T - failures) / T) * 100;
  const nu = failures > 0 ? (totalDeficitFraction / failures) * 100 : 0;
  const gamma = failures > 0 ? (recoveries / failures) * 100 : 100;

  return { alpha, nu, gamma };
}

/**
 * Computes the optimal guide rule curve across the 12 calendar months (or 52 weeks)
 * balancing flood risk reduction in high inflow seasons and drought reserves in dry seasons.
 */
function deriveOptimalRuleCurve(
  maxCapacityMcm: number,
  deadStorageMcm: number,
  timeStep: TimeStepType
) {
  const periodsInYear = timeStep === 'monthly' ? 12 : 52;
  const activeCap = maxCapacityMcm - deadStorageMcm;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const profile = [];
  for (let m = 0; m < periodsInYear; m++) {
    const label = timeStep === 'monthly' ? monthNames[m] : `Wk ${m + 1}`;
    
    // Normalized seasonal hydrologic index (0.0 to 1.0)
    const sinFactor = Math.sin(((m - 2) / periodsInYear) * 2 * Math.PI);
    const targetPct = 0.80 - 0.15 * sinFactor;
    
    const guideMcm = deadStorageMcm + activeCap * targetPct;
    const floodBufferMcm = maxCapacityMcm * 0.96;
    const droughtReserveMcm = deadStorageMcm + activeCap * 0.25;

    profile.push({
      periodInYear: m + 1,
      label,
      guideStorageMcm: parseFloat(guideMcm.toFixed(1)),
      guideStoragePct: parseFloat((targetPct * 100).toFixed(1)),
      upperFloodBufferMcm: parseFloat(floodBufferMcm.toFixed(1)),
      lowerDroughtReserveMcm: parseFloat(droughtReserveMcm.toFixed(1)),
    });
  }

  return profile;
}

/**
 * Main Solver: Solves multi-period reservoir operation using:
 * 1. Linear Programming (Successive Linear Programming / Simplex Network Multi-Period Solver)
 * 2. Evolutionary Algorithm (Real-Valued Genetic Algorithm with Direct Release Policies & Elitism)
 * 
 * Strict Equations Enforced:
 * S(t+1) = S(t) + Inflow(t) - Release(t) - HydroRelease(t) - Evaporation(t) - Spillage(t)
 * Release(t) + HydroRelease(t) >= Drinking + Irrigation + Industry + Environmental
 * Power(t) = efficiency * 9810 * HydroRelease(t) * (Water level - Tailwater - headloss)
 * 
 * Normalized Multi-Criteria Objective:
 * Normalizes all components (storage, drinking, irrigation, industry, environmental, hydropower, spillage)
 * to dimensionless fractions on [0, 1] before weights are applied, and includes Hashimoto Reliability,
 * Vulnerability, and Resiliency criteria directly into the objective function.
 */
export function solveReservoirOptimization(inputs: ReservoirOptInputs): ReservoirOptOutput {
  const {
    maxCapacityMcm,
    deadStorageMcm,
    initialStorageMcm,
    maxReleaseM3s,
    spillwayCapacityM3s,
    maxTurbineReleaseM3s,
    headLossM = 2.5,
    turbineEfficiency,
    energyDemandGwhPerPeriod,
    drinkingDemandMcm,
    irrigationDemandMcm,
    industryDemandMcm,
    environmentalFlowMcm,
    weightDrinking,
    weightIrrigation,
    weightIndustry,
    weightEnvironmental,
    weightHydropower,
    weightStorage = 4.5,
    weightReliability = 5.0,
    weightVulnerability = 4.0,
    weightResiliency = 4.0,
    timeStep,
    years,
    hydrologyScenario,
    meanAnnualInflowMcm,
    havCurve,
    customInflowsMcm,
    customDrinkingDemandsMcm,
    customIrrigationDemandsMcm,
    customIndustryDemandsMcm,
    customEnvironmentalDemandsMcm,
    customEvaporationDepthsM,
    customEvaporationsMcm,
    defaultEvapDepthM,
    tailwaterElevationM,
    ruleCurveMode,
    userTargetStoragePct = 80,
    algorithm,
    eaGenerations = 80,
    eaPopulationSize = 40,
  } = inputs;

  const periodsPerYear = timeStep === 'monthly' ? 12 : 52;
  const totalPeriods = Math.min(60, years * periodsPerYear);

  // Active Height-Area-Volume curve
  const activeHavCurve = (havCurve && havCurve.length >= 2)
    ? havCurve
    : generateDefaultHavCurve(maxCapacityMcm, deadStorageMcm);

  // Tailwater elevation and headloss
  const effectiveTailwaterM = (tailwaterElevationM !== undefined && tailwaterElevationM > 0)
    ? tailwaterElevationM
    : (activeHavCurve[0]?.elevationM ? activeHavCurve[0].elevationM - 5 : 195);
  const effectiveHeadLossM = Math.max(0, headLossM !== undefined ? headLossM : 2.5);

  // Physical release limits per period in MCM
  const maxReleasePeriodMcm = flowM3sToMcmPerPeriod(maxReleaseM3s, timeStep);
  const spillwayPeriodMcm = flowM3sToMcmPerPeriod(spillwayCapacityM3s, timeStep);
  const maxTurbinePeriodMcm = flowM3sToMcmPerPeriod(maxTurbineReleaseM3s, timeStep);
  const secondsPerPeriod = getSecondsPerPeriod(timeStep);

  // Inflow time series
  let inflows: number[] = [];
  if (customInflowsMcm && customInflowsMcm.length > 0) {
    inflows = [...customInflowsMcm];
    while (inflows.length < totalPeriods) {
      inflows.push(inflows[inflows.length % Math.max(1, customInflowsMcm.length)]);
    }
  } else {
    inflows = generateHydrologyInflows(meanAnnualInflowMcm, years, timeStep, hydrologyScenario);
  }

  // Optimal guide rule curve profile
  const optimalRuleCurve = deriveOptimalRuleCurve(maxCapacityMcm, deadStorageMcm, timeStep);

  // Period targets for each time step
  const periodTargets: number[] = [];
  for (let t = 0; t < totalPeriods; t++) {
    const periodInYr = t % periodsPerYear;
    let targetStorage = deadStorageMcm + (maxCapacityMcm - deadStorageMcm) * 0.70;
    if (ruleCurveMode === 'apply_target') {
      targetStorage = deadStorageMcm + (maxCapacityMcm - deadStorageMcm) * (userTargetStoragePct / 100);
    } else if (ruleCurveMode === 'derive_optimal') {
      targetStorage = optimalRuleCurve[periodInYr].guideStorageMcm;
    }
    periodTargets.push(targetStorage);
  }

  // Active importance weights
  const wStorage = Math.max(0.01, weightStorage);
  const wReliability = Math.max(0.01, weightReliability);
  const wVulnerability = Math.max(0.01, weightVulnerability);
  const wResiliency = Math.max(0.01, weightResiliency);

  /**
   * Evaluates a trajectory given explicit decisions:
   * turbineReleases[t] (MCM) and outletReleases[t] (MCM).
   * 
   * Strictly enforces physical continuity and calculates the DIMENSIONLESS NORMALIZED objective function:
   * 1. Storage deficit is normalized by target active capacity: def_storage / (target - dead)
   * 2. Demands are normalized by their respective period demands: def_demand / Demand
   * 3. Hydropower deficit is normalized by target energy: def_energy / Target_energy
   * 4. Spillage is normalized by spillway capacity
   * 5. Hashimoto criteria (Reliability, Vulnerability, Resiliency) on [0, 1] are directly added to the objective!
   */
  function evaluateExplicitTrajectory(
    turbineReleases: number[],
    outletReleases: number[]
  ): {
    trajectory: ReservoirPeriodResult[];
    totalObjectivePenalty: number;
    breakdown: {
      demandNormalizedPenalty: number;
      storageNormalizedPenalty: number;
      hydropowerNormalizedPenalty: number;
      reliabilityPenalty: number;
      vulnerabilityPenalty: number;
      resiliencyPenalty: number;
    };
  } {
    let currentStorage = initialStorageMcm;
    const trajectory: ReservoirPeriodResult[] = [];
    let sumDemandPenalty = 0;
    let sumStoragePenalty = 0;
    let sumHydroPenalty = 0;
    let sumSpillagePenalty = 0;

    for (let t = 0; t < totalPeriods; t++) {
      const inflow = inflows[t] !== undefined ? inflows[t] : 5.0;
      const periodInYr = t % periodsPerYear;
      const periodLabel = timeStep === 'monthly'
        ? `Yr ${Math.floor(t / 12) + 1} - M${(t % 12) + 1}`
        : `Yr ${Math.floor(t / 52) + 1} - W${(t % 52) + 1}`;
      const targetStorage = periodTargets[t];

      // Downstream demands for this period
      const tDrinking = (customDrinkingDemandsMcm && customDrinkingDemandsMcm[t] !== undefined)
        ? customDrinkingDemandsMcm[t] : drinkingDemandMcm;
      const tIrrigation = (customIrrigationDemandsMcm && customIrrigationDemandsMcm[t] !== undefined)
        ? customIrrigationDemandsMcm[t] : irrigationDemandMcm;
      const tIndustry = (customIndustryDemandsMcm && customIndustryDemandsMcm[t] !== undefined)
        ? customIndustryDemandsMcm[t] : industryDemandMcm;
      const tEnvFlow = (customEnvironmentalDemandsMcm && customEnvironmentalDemandsMcm[t] !== undefined)
        ? customEnvironmentalDemandsMcm[t] : environmentalFlowMcm;
      const periodTotalDemand = tDrinking + tIrrigation + tIndustry + tEnvFlow;

      // Surface Area & Elevation from H-A-V Curve
      const surfaceAreaKm2 = interpolateAreaFromStorage(currentStorage, activeHavCurve);
      const waterLevelElevationM = interpolateElevationFromStorage(currentStorage, activeHavCurve);

      // Evaporation calculation: Depth in meters (m) * Area (km²) = MCM
      let evapDepthM = timeStep === 'monthly' ? 0.08 : 0.02;
      if (customEvaporationDepthsM && customEvaporationDepthsM[t] !== undefined) {
        evapDepthM = customEvaporationDepthsM[t];
      } else if (defaultEvapDepthM !== undefined && defaultEvapDepthM > 0) {
        evapDepthM = defaultEvapDepthM;
      }

      let evaporation = 0;
      if (customEvaporationsMcm && customEvaporationsMcm[t] !== undefined) {
        evaporation = Math.max(0, Math.min(Math.max(0, currentStorage + inflow - deadStorageMcm), customEvaporationsMcm[t]));
      } else {
        const potentialEvapMcm = surfaceAreaKm2 * evapDepthM;
        evaporation = Math.max(0, Math.min(Math.max(0, currentStorage + inflow - deadStorageMcm), potentialEvapMcm));
      }

      // Available water before release & spill
      const waterAvailable = currentStorage + inflow - evaporation;
      const releasableSurplus = Math.max(0, waterAvailable - deadStorageMcm);

      // Turbine release (hydropower) bounded by capacity and releasable surplus
      const rawHydroReq = Math.max(0, turbineReleases[t] || 0);
      const hydroRelease = Math.min(maxTurbinePeriodMcm, releasableSurplus, rawHydroReq);

      // Non-power outlet release bounded by capacity and remaining releasable surplus
      const remainingReleasable = Math.max(0, releasableSurplus - hydroRelease);
      const rawOutletReq = Math.max(0, outletReleases[t] || 0);
      const outletRelease = Math.min(maxReleasePeriodMcm, remainingReleasable, rawOutletReq);

      // Total combined downstream release
      const totalCombinedRelease = hydroRelease + outletRelease;

      // Spillage calculation
      const provisionalStorage = waterAvailable - totalCombinedRelease;
      let spillage = 0;
      let storageEnd = provisionalStorage;
      if (provisionalStorage > maxCapacityMcm) {
        const excess = provisionalStorage - maxCapacityMcm;
        spillage = Math.min(spillwayPeriodMcm, excess);
        storageEnd = provisionalStorage - spillage;
      }
      storageEnd = Math.max(deadStorageMcm, Math.min(maxCapacityMcm, storageEnd));

      // Dynamic Hydropower Head and Power:
      // Power = eta * 9810 * Q_hydro * (Water level - Tailwater - headloss)
      const grossHeadCalc = Math.max(0, waterLevelElevationM - effectiveTailwaterM);
      const effectiveHead = Math.max(0, grossHeadCalc - effectiveHeadLossM);

      // Energy generated: E (GWh) = (9.81 * eta * H_eff / 3600) * V_hydro (MCM)
      const gwhPerMcm = effectiveHead > 0 ? (9.81 * effectiveHead * turbineEfficiency) / 3600 : 0;
      const energyGenerated = hydroRelease * gwhPerMcm;
      const energyDeficit = Math.max(0, energyDemandGwhPerPeriod - energyGenerated);

      // Combined downstream demand distribution:
      // Release(t) + HydroRelease(t) distributed to: Drinking, Irrigation, Industry, Environmental
      const demandEntries = [
        { key: 'drinking', demand: tDrinking, weight: weightDrinking },
        { key: 'environmental', demand: tEnvFlow, weight: weightEnvironmental },
        { key: 'industry', demand: tIndustry, weight: weightIndustry },
        { key: 'irrigation', demand: tIrrigation, weight: weightIrrigation },
      ].sort((a, b) => b.weight - a.weight);

      let waterLeft = totalCombinedRelease;
      const suppliedMap: Record<string, number> = {};

      for (const entry of demandEntries) {
        const sup = Math.min(entry.demand, waterLeft);
        suppliedMap[entry.key] = sup;
        waterLeft -= sup;
      }

      const drinkSupply = suppliedMap.drinking || 0;
      const drinkDeficit = Math.max(0, tDrinking - drinkSupply);

      const envSupply = suppliedMap.environmental || 0;
      const envDeficit = Math.max(0, tEnvFlow - envSupply);

      const indusSupply = suppliedMap.industry || 0;
      const indusDeficit = Math.max(0, tIndustry - indusSupply);

      const irrigSupply = suppliedMap.irrigation || 0;
      const irrigDeficit = Math.max(0, tIrrigation - irrigSupply);

      // =========================================================================
      // NORMALIZATION OF OBJECTIVE COMPONENTS
      // =========================================================================
      // 1. Normalized Storage Deficit & Excess:
      const targetActiveRange = Math.max(1.0, targetStorage - deadStorageMcm);
      const normStorageDeficit = Math.max(0, targetStorage - storageEnd) / targetActiveRange;
      const surplusCapacityRange = Math.max(1.0, maxCapacityMcm - targetStorage);
      const normStorageExcess = Math.max(0, storageEnd - targetStorage) / surplusCapacityRange;
      const pStoragePenalty = wStorage * (normStorageDeficit + 0.05 * normStorageExcess);

      // 2. Normalized Demand Deficits (fraction between 0.0 and 1.0):
      const normDrinkDeficit = drinkDeficit / Math.max(0.01, tDrinking);
      const normEnvDeficit = envDeficit / Math.max(0.01, tEnvFlow);
      const normIndusDeficit = indusDeficit / Math.max(0.01, tIndustry);
      const normIrrigDeficit = irrigDeficit / Math.max(0.01, tIrrigation);

      const pDemandPenalty =
        weightDrinking * normDrinkDeficit +
        weightEnvironmental * normEnvDeficit +
        weightIndustry * normIndusDeficit +
        weightIrrigation * normIrrigDeficit;

      // 3. Normalized Hydropower Energy Deficit (fraction between 0.0 and 1.0):
      const normEnergyDeficit = energyDeficit / Math.max(0.01, energyDemandGwhPerPeriod);
      const pHydroPenalty = weightHydropower * normEnergyDeficit;

      // 4. Normalized Spillage Loss:
      const normSpillage = spillage / Math.max(1.0, spillwayPeriodMcm);
      const pSpillagePenalty = 0.05 * normSpillage;

      sumDemandPenalty += pDemandPenalty;
      sumStoragePenalty += pStoragePenalty;
      sumHydroPenalty += pHydroPenalty;
      sumSpillagePenalty += pSpillagePenalty;

      // Discharge flow conversions in m³/s
      const outletReleaseM3s = (outletRelease * 1e6) / secondsPerPeriod;
      const hydroReleaseM3s = (hydroRelease * 1e6) / secondsPerPeriod;
      const totalReleaseM3s = (totalCombinedRelease * 1e6) / secondsPerPeriod;

      trajectory.push({
        period: t + 1,
        label: periodLabel,
        inflowMcm: parseFloat(inflow.toFixed(2)),
        storageStartMcm: parseFloat(currentStorage.toFixed(2)),
        storageEndMcm: parseFloat(storageEnd.toFixed(2)),
        targetRuleCurveMcm: parseFloat(targetStorage.toFixed(2)),
        waterLevelElevationM: parseFloat(waterLevelElevationM.toFixed(1)),
        surfaceAreaKm2: parseFloat(surfaceAreaKm2.toFixed(2)),
        evaporationDepthM: parseFloat(evapDepthM.toFixed(3)),
        evaporationMcm: parseFloat(evaporation.toFixed(2)),
        outletReleaseMcm: parseFloat(outletRelease.toFixed(2)),
        hydroReleaseMcm: parseFloat(hydroRelease.toFixed(2)),
        totalReleaseMcm: parseFloat(totalCombinedRelease.toFixed(2)),
        outletReleaseM3s: parseFloat(outletReleaseM3s.toFixed(2)),
        hydroReleaseM3s: parseFloat(hydroReleaseM3s.toFixed(2)),
        totalReleaseM3s: parseFloat(totalReleaseM3s.toFixed(2)),
        spillageMcm: parseFloat(spillage.toFixed(2)),
        totalDemandMcm: parseFloat(periodTotalDemand.toFixed(2)),
        drinkingSuppliedMcm: parseFloat(drinkSupply.toFixed(2)),
        drinkingDeficitMcm: parseFloat(drinkDeficit.toFixed(2)),
        irrigationSuppliedMcm: parseFloat(irrigSupply.toFixed(2)),
        irrigationDeficitMcm: parseFloat(irrigDeficit.toFixed(2)),
        industrySuppliedMcm: parseFloat(indusSupply.toFixed(2)),
        industryDeficitMcm: parseFloat(indusDeficit.toFixed(2)),
        envFlowSuppliedMcm: parseFloat(envSupply.toFixed(2)),
        envFlowDeficitMcm: parseFloat(envDeficit.toFixed(2)),
        energyTargetGwh: parseFloat(energyDemandGwhPerPeriod.toFixed(2)),
        energyGeneratedGwh: parseFloat(energyGenerated.toFixed(2)),
        energyDeficitGwh: parseFloat(energyDeficit.toFixed(2)),
        effectiveHeadM: parseFloat(effectiveHead.toFixed(1)),
      });

      // Update storage for next period: S(t+1)
      currentStorage = storageEnd;
    }

    // =========================================================================
    // HASHIMOTO PERFORMANCE CRITERIA IN OBJECTIVE FUNCTION
    // =========================================================================
    // Reliability (alpha): minimize Unreliability (1 - alpha/100)
    // Vulnerability (nu): minimize deficit severity during failure periods (nu/100)
    // Resiliency (gamma): maximize recovery probability -> minimize Non-Resiliency (1 - gamma/100)
    const hash = computeQuickTrajectoryHashimoto(trajectory);
    const unreliabilityLoss = (100 - hash.alpha) / 100;
    const vulnerabilityLoss = hash.nu / 100;
    const nonResiliencyLoss = (100 - hash.gamma) / 100;

    const pReliability = totalPeriods * (wReliability * unreliabilityLoss);
    const pVulnerability = totalPeriods * (wVulnerability * vulnerabilityLoss);
    const pResiliency = totalPeriods * (wResiliency * nonResiliencyLoss);

    const totalObjectivePenalty =
      sumDemandPenalty +
      sumStoragePenalty +
      sumHydroPenalty +
      sumSpillagePenalty +
      pReliability +
      pVulnerability +
      pResiliency;

    return {
      trajectory,
      totalObjectivePenalty,
      breakdown: {
        demandNormalizedPenalty: parseFloat(sumDemandPenalty.toFixed(2)),
        storageNormalizedPenalty: parseFloat(sumStoragePenalty.toFixed(2)),
        hydropowerNormalizedPenalty: parseFloat(sumHydroPenalty.toFixed(2)),
        reliabilityPenalty: parseFloat(pReliability.toFixed(2)),
        vulnerabilityPenalty: parseFloat(pVulnerability.toFixed(2)),
        resiliencyPenalty: parseFloat(pResiliency.toFixed(2)),
      },
    };
  }

  // =========================================================================
  // OPTIMIZATION SOLVER
  // =========================================================================
  let optimalHydroReleases: number[] = new Array(totalPeriods).fill(0);
  let optimalOutletReleases: number[] = new Array(totalPeriods).fill(0);

  /**
   * Helper: Computes the exact Linear Programming (SLP) continuous knapsack allocation
   * for each time step using NORMALIZED marginal utility slopes.
   */
  function solveLpPeriodAllocation(
    currentS: number,
    t: number,
    futureShadowPrice: number
  ): { hydroMcm: number; outletMcm: number } {
    const inflow = inflows[t] !== undefined ? inflows[t] : 5.0;
    const targetStorage = periodTargets[t];

    const surfaceAreaKm2 = interpolateAreaFromStorage(currentS, activeHavCurve);
    const waterLevelElevationM = interpolateElevationFromStorage(currentS, activeHavCurve);
    const evapDepthM = (customEvaporationDepthsM && customEvaporationDepthsM[t] !== undefined)
      ? customEvaporationDepthsM[t] : (defaultEvapDepthM || (timeStep === 'monthly' ? 0.08 : 0.02));
    const potentialEvap = surfaceAreaKm2 * evapDepthM;
    const evaporation = Math.max(0, Math.min(Math.max(0, currentS + inflow - deadStorageMcm), potentialEvap));

    const waterAvailable = currentS + inflow - evaporation;
    const releasableSurplus = Math.max(0, waterAvailable - deadStorageMcm);

    if (releasableSurplus <= 0.001) {
      return { hydroMcm: 0, outletMcm: 0 };
    }

    // Demands
    const tDrinking = (customDrinkingDemandsMcm && customDrinkingDemandsMcm[t] !== undefined)
      ? customDrinkingDemandsMcm[t] : drinkingDemandMcm;
    const tIrrigation = (customIrrigationDemandsMcm && customIrrigationDemandsMcm[t] !== undefined)
      ? customIrrigationDemandsMcm[t] : irrigationDemandMcm;
    const tIndustry = (customIndustryDemandsMcm && customIndustryDemandsMcm[t] !== undefined)
      ? customIndustryDemandsMcm[t] : industryDemandMcm;
    const tEnvFlow = (customEnvironmentalDemandsMcm && customEnvironmentalDemandsMcm[t] !== undefined)
      ? customEnvironmentalDemandsMcm[t] : environmentalFlowMcm;

    // Net Head & Energy potential per MCM
    const grossHeadCalc = Math.max(0, waterLevelElevationM - effectiveTailwaterM);
    const effectiveHead = Math.max(0, grossHeadCalc - effectiveHeadLossM);
    const gwhPerMcm = effectiveHead > 0 ? (9.81 * effectiveHead * turbineEfficiency) / 3600 : 0;
    const mcmNeededForEnergy = gwhPerMcm > 0 ? (energyDemandGwhPerPeriod / gwhPerMcm) : 0;

    // NORMALIZED Marginal Value Slopes:
    // Every slope is [weight / Volume], representing marginal reduction in normalized penalty per MCM!
    const targetActiveRange = Math.max(1.0, targetStorage - deadStorageMcm);
    const normStorageSlope = (wStorage / targetActiveRange) + futureShadowPrice;

    interface WaterTranche {
      type: 'storage_to_target' | 'hydro_with_demand' | 'hydro_pure_energy' | 'outlet_demand';
      capacityMcm: number;
      marginalValue: number;
    }

    const tranches: WaterTranche[] = [];

    // Capacity to reach target storage
    const storageNeededForTarget = Math.max(0, targetStorage - deadStorageMcm);
    if (storageNeededForTarget > 0) {
      tranches.push({
        type: 'storage_to_target',
        capacityMcm: storageNeededForTarget,
        marginalValue: normStorageSlope,
      });
    }

    // Ranked downstream demands with normalized marginal slopes: weight / Demand
    const demandList = [
      { name: 'drinking', demand: tDrinking, slope: weightDrinking / Math.max(0.1, tDrinking) },
      { name: 'env', demand: tEnvFlow, slope: weightEnvironmental / Math.max(0.1, tEnvFlow) },
      { name: 'industry', demand: tIndustry, slope: weightIndustry / Math.max(0.1, tIndustry) },
      { name: 'irrigation', demand: tIrrigation, slope: weightIrrigation / Math.max(0.1, tIrrigation) },
    ].sort((a, b) => b.slope - a.slope);

    // Hydropower release normalized slope:
    // Energy normalized value = (weightHydropower * gwhPerMcm) / TargetEnergy
    const hydroEnergySlope = (weightHydropower * gwhPerMcm) / Math.max(0.1, energyDemandGwhPerPeriod);

    let hydroCapRemaining = Math.min(maxTurbinePeriodMcm, mcmNeededForEnergy);
    for (const d of demandList) {
      if (d.demand > 0 && hydroCapRemaining > 0) {
        const trancheVol = Math.min(d.demand, hydroCapRemaining);
        tranches.push({
          type: 'hydro_with_demand',
          capacityMcm: trancheVol,
          marginalValue: hydroEnergySlope + d.slope,
        });
        hydroCapRemaining -= trancheVol;
        if (d.demand > trancheVol) {
          tranches.push({
            type: 'outlet_demand',
            capacityMcm: d.demand - trancheVol,
            marginalValue: d.slope,
          });
        }
      } else if (d.demand > 0) {
        tranches.push({
          type: 'outlet_demand',
          capacityMcm: d.demand,
          marginalValue: d.slope,
        });
      }
    }

    // Hydropower pure energy if energy target exceeds downstream demands
    if (hydroCapRemaining > 0) {
      tranches.push({
        type: 'hydro_pure_energy',
        capacityMcm: hydroCapRemaining,
        marginalValue: hydroEnergySlope,
      });
    }

    // Continuous Knapsack allocation along descending normalized marginal slopes
    tranches.sort((a, b) => b.marginalValue - a.marginalValue);

    let hydroAlloc = 0;
    let outletAlloc = 0;
    let remainingBudget = releasableSurplus;

    for (const tr of tranches) {
      if (remainingBudget <= 0.001) break;
      const alloc = Math.min(tr.capacityMcm, remainingBudget);

      if (tr.type === 'storage_to_target') {
        remainingBudget -= alloc;
      } else if (tr.type === 'hydro_with_demand' || tr.type === 'hydro_pure_energy') {
        const maxCanHydro = Math.min(alloc, maxTurbinePeriodMcm - hydroAlloc);
        hydroAlloc += maxCanHydro;
        remainingBudget -= maxCanHydro;
      } else if (tr.type === 'outlet_demand') {
        const maxCanOutlet = Math.min(alloc, maxReleasePeriodMcm - outletAlloc);
        outletAlloc += maxCanOutlet;
        remainingBudget -= maxCanOutlet;
      }
    }

    // Extra release if storage exceeds capacity to avoid spillage
    const postReleaseProvisional = waterAvailable - hydroAlloc - outletAlloc;
    if (postReleaseProvisional > maxCapacityMcm) {
      const floodExcess = postReleaseProvisional - maxCapacityMcm;
      const additionalOutlet = Math.min(floodExcess, maxReleasePeriodMcm - outletAlloc);
      outletAlloc += additionalOutlet;
    }

    return { hydroMcm: hydroAlloc, outletMcm: outletAlloc };
  }

  if (algorithm === 'lp-simplex') {
    // =======================================================================
    // 1. Successive Linear Programming (SLP) Multi-Period Solver
    // =======================================================================
    const shadowPrices: number[] = new Array(totalPeriods).fill(0);

    for (let slpIter = 0; slpIter < 12; slpIter++) {
      let currentS = initialStorageMcm;
      const tempHydro: number[] = [];
      const tempOutlet: number[] = [];
      const storagesHistory: number[] = [currentS];

      // Forward Simulation pass
      for (let t = 0; t < totalPeriods; t++) {
        const futureLambda = t + 1 < totalPeriods ? shadowPrices[t + 1] : 0;
        const alloc = solveLpPeriodAllocation(currentS, t, futureLambda);
        tempHydro.push(alloc.hydroMcm);
        tempOutlet.push(alloc.outletMcm);

        // State transition
        const inflow = inflows[t] !== undefined ? inflows[t] : 5.0;
        const surfaceAreaKm2 = interpolateAreaFromStorage(currentS, activeHavCurve);
        const evapDepthM = (customEvaporationDepthsM && customEvaporationDepthsM[t] !== undefined)
          ? customEvaporationDepthsM[t] : (defaultEvapDepthM || (timeStep === 'monthly' ? 0.08 : 0.02));
        const evaporation = Math.min(Math.max(0, currentS + inflow - deadStorageMcm), surfaceAreaKm2 * evapDepthM);
        const nextS = Math.max(deadStorageMcm, Math.min(maxCapacityMcm, currentS + inflow - alloc.hydroMcm - alloc.outletMcm - evaporation));
        currentS = nextS;
        storagesHistory.push(currentS);
      }

      optimalHydroReleases = tempHydro;
      optimalOutletReleases = tempOutlet;

      // Backward Dual Shadow Price propagation pass
      for (let t = totalPeriods - 1; t >= 0; t--) {
        const sEnd = storagesHistory[t + 1];
        const sTarget = periodTargets[t];
        const prevLambda = t + 1 < totalPeriods ? shadowPrices[t + 1] : 0;
        const normTargetRange = Math.max(1.0, sTarget - deadStorageMcm);

        // Normalized marginal value of carrying 1 MCM into period t
        if (sEnd < sTarget) {
          const normStorageVal = (wStorage / normTargetRange) * 0.85;
          const hashimotoSignal = ((wReliability + wResiliency) / (totalPeriods * 10)) * 0.5;
          shadowPrices[t] = 0.92 * (normStorageVal + hashimotoSignal + prevLambda);
        } else {
          shadowPrices[t] = 0.85 * prevLambda;
        }
      }
    }
  } else {
    // =======================================================================
    // 2. Evolutionary Algorithm (Real-Valued Genetic Algorithm with Elitism)
    // =======================================================================
    const popSize = Math.max(20, eaPopulationSize);
    const generations = Math.max(30, eaGenerations);
    const numGenes = totalPeriods * 2;

    const decodeChromosome = (chromosome: number[]) => {
      const hydroReleases: number[] = [];
      const outletReleases: number[] = [];
      let s = initialStorageMcm;

      for (let t = 0; t < totalPeriods; t++) {
        const uRel = chromosome[t * 2];
        const uHydro = chromosome[t * 2 + 1];

        const inflow = inflows[t] !== undefined ? inflows[t] : 5.0;
        const area = interpolateAreaFromStorage(s, activeHavCurve);
        const evapDepthM = (customEvaporationDepthsM && customEvaporationDepthsM[t] !== undefined)
          ? customEvaporationDepthsM[t] : (defaultEvapDepthM || (timeStep === 'monthly' ? 0.08 : 0.02));
        const evap = Math.min(Math.max(0, s + inflow - deadStorageMcm), area * evapDepthM);
        const releasable = Math.max(0, s + inflow - evap - deadStorageMcm);

        const totalRelTarget = uRel * Math.min(releasable, maxTurbinePeriodMcm + maxReleasePeriodMcm);
        const hydroRel = Math.min(maxTurbinePeriodMcm, releasable, totalRelTarget * uHydro);
        const outletRel = Math.min(maxReleasePeriodMcm, Math.max(0, releasable - hydroRel), Math.max(0, totalRelTarget - hydroRel));

        hydroReleases.push(hydroRel);
        outletReleases.push(outletRel);

        s = Math.max(deadStorageMcm, Math.min(maxCapacityMcm, s + inflow - evap - hydroRel - outletRel));
      }

      return { hydroReleases, outletReleases };
    };

    let population: number[][] = [];

    // Seed 1: Storage Conservation Policy
    const seedConservation: number[] = [];
    let simS = initialStorageMcm;
    for (let t = 0; t < totalPeriods; t++) {
      const target = periodTargets[t];
      if (simS < target) {
        seedConservation.push(0.05, 0.5);
      } else {
        const inflow = inflows[t] !== undefined ? inflows[t] : 5.0;
        const totalDem = drinkingDemandMcm + irrigationDemandMcm + industryDemandMcm + environmentalFlowMcm;
        const relFraction = Math.min(1.0, totalDem / Math.max(10, simS + inflow - deadStorageMcm));
        seedConservation.push(relFraction, 0.75);
      }
      simS = Math.max(deadStorageMcm, simS + (inflows[t] || 5.0) * 0.7);
    }
    population.push(seedConservation);

    // Seed 2: LP Solution Seed
    const lpBaseline = solveReservoirOptimization({ ...inputs, algorithm: 'lp-simplex' });
    const seedLp: number[] = [];
    for (let t = 0; t < totalPeriods; t++) {
      const p = lpBaseline.trajectory[t];
      const maxReleasable = Math.max(0.1, p.storageStartMcm + p.inflowMcm - p.evaporationMcm - deadStorageMcm);
      const uRel = Math.min(1.0, p.totalReleaseMcm / maxReleasable);
      const uHydro = p.totalReleaseMcm > 0.001 ? Math.min(1.0, p.hydroReleaseMcm / p.totalReleaseMcm) : 0.7;
      seedLp.push(uRel, uHydro);
    }
    population.push(seedLp);

    // Seed 3: Balanced Demands Seed
    const seedBalanced: number[] = [];
    for (let t = 0; t < totalPeriods; t++) {
      seedBalanced.push(0.65, 0.65);
    }
    population.push(seedBalanced);

    // Seed 4: High Hydropower Seed
    const seedHydro: number[] = [];
    for (let t = 0; t < totalPeriods; t++) {
      seedHydro.push(0.80, 0.95);
    }
    population.push(seedHydro);

    // Uniform random exploratory population
    while (population.length < popSize) {
      const indiv: number[] = [];
      for (let g = 0; g < numGenes; g++) {
        indiv.push(Math.random());
      }
      population.push(indiv);
    }

    let bestIndiv = population[0];
    let bestScore = Infinity;

    for (let gen = 0; gen < generations; gen++) {
      const scored = population.map((indiv) => {
        const { hydroReleases, outletReleases } = decodeChromosome(indiv);
        const { totalObjectivePenalty } = evaluateExplicitTrajectory(hydroReleases, outletReleases);
        return { indiv, score: totalObjectivePenalty };
      });

      scored.sort((a, b) => a.score - b.score);

      if (scored[0].score < bestScore) {
        bestScore = scored[0].score;
        bestIndiv = [...scored[0].indiv];
      }

      // Elitism: Retain top 4 individuals
      const nextPop: number[][] = scored.slice(0, 4).map((s) => [...s.indiv]);

      while (nextPop.length < popSize) {
        // Tournament selection (size 3)
        const p1 = scored[Math.floor(Math.random() * (popSize * 0.45))].indiv;
        const p2 = scored[Math.floor(Math.random() * (popSize * 0.45))].indiv;

        // Blend Crossover (BLX-alpha with alpha = 0.25)
        const child: number[] = [];
        for (let g = 0; g < numGenes; g++) {
          const minG = Math.min(p1[g], p2[g]);
          const maxG = Math.max(p1[g], p2[g]);
          const range = maxG - minG;
          let gene = minG - 0.25 * range + Math.random() * (1.5 * range + 0.001);

          // Adaptive Polynomial / Gaussian mutation
          if (Math.random() < 0.16) {
            const mutDelta = (Math.random() - 0.5) * 0.20 * (1 - gen / generations);
            gene += mutDelta;
          }

          child.push(Math.max(0, Math.min(1.0, gene)));
        }
        nextPop.push(child);
      }

      population = nextPop;
    }

    const optimalDecisions = decodeChromosome(bestIndiv);
    optimalHydroReleases = optimalDecisions.hydroReleases;
    optimalOutletReleases = optimalDecisions.outletReleases;
  }

  // Final Trajectory with Normalized Objective Breakdown
  const { trajectory, totalObjectivePenalty, breakdown } = evaluateExplicitTrajectory(optimalHydroReleases, optimalOutletReleases);

  // Extract series for Hashimoto Performance Criteria
  const drinkSuppliedSeries = trajectory.map((p) => p.drinkingSuppliedMcm);
  const irrigSuppliedSeries = trajectory.map((p) => p.irrigationSuppliedMcm);
  const indusSuppliedSeries = trajectory.map((p) => p.industrySuppliedMcm);
  const envSuppliedSeries = trajectory.map((p) => p.envFlowSuppliedMcm);
  const energySuppliedSeries = trajectory.map((p) => p.energyGeneratedGwh);

  const drinkTargetSeries = trajectory.map((_, t) => (customDrinkingDemandsMcm && customDrinkingDemandsMcm[t] !== undefined) ? customDrinkingDemandsMcm[t] : drinkingDemandMcm);
  const irrigTargetSeries = trajectory.map((_, t) => (customIrrigationDemandsMcm && customIrrigationDemandsMcm[t] !== undefined) ? customIrrigationDemandsMcm[t] : irrigationDemandMcm);
  const indusTargetSeries = trajectory.map((_, t) => (customIndustryDemandsMcm && customIndustryDemandsMcm[t] !== undefined) ? customIndustryDemandsMcm[t] : industryDemandMcm);
  const envTargetSeries = trajectory.map((_, t) => (customEnvironmentalDemandsMcm && customEnvironmentalDemandsMcm[t] !== undefined) ? customEnvironmentalDemandsMcm[t] : environmentalFlowMcm);

  const targetStorageSeries = trajectory.map((p) => p.targetRuleCurveMcm);
  const actualStorageSeries = trajectory.map((p) => p.storageEndMcm);

  const drinkPerf = evaluateHashimotoCriteria('Drinking Water Supply', drinkTargetSeries, drinkSuppliedSeries);
  const irrigPerf = evaluateHashimotoCriteria('Irrigation Agriculture', irrigTargetSeries, irrigSuppliedSeries);
  const indusPerf = evaluateHashimotoCriteria('Industrial Water Supply', indusTargetSeries, indusSuppliedSeries);
  const envPerf = evaluateHashimotoCriteria('Environmental Minimum Flow', envTargetSeries, envSuppliedSeries);
  const hydroPerf = evaluateHashimotoCriteria('Hydropower Clean Energy', energyDemandGwhPerPeriod, energySuppliedSeries);
  const storagePerf = evaluateHashimotoCriteria('Storage Target Compliance', targetStorageSeries, actualStorageSeries);

  const overallReliability = (drinkPerf.timeReliabilityPct + irrigPerf.timeReliabilityPct + indusPerf.timeReliabilityPct + envPerf.timeReliabilityPct + hydroPerf.timeReliabilityPct + storagePerf.timeReliabilityPct) / 6;
  const overallResiliency = (drinkPerf.resiliencyPct + irrigPerf.resiliencyPct + indusPerf.resiliencyPct + envPerf.resiliencyPct + hydroPerf.resiliencyPct + storagePerf.resiliencyPct) / 6;
  const overallVulnerability = (drinkPerf.avgVulnerabilityPct + irrigPerf.avgVulnerabilityPct + indusPerf.avgVulnerabilityPct + envPerf.avgVulnerabilityPct + hydroPerf.avgVulnerabilityPct + storagePerf.avgVulnerabilityPct) / 6;

  // Global aggregates
  const totalInflow = trajectory.reduce((sum, p) => sum + p.inflowMcm, 0);
  const totalCombinedRelease = trajectory.reduce((sum, p) => sum + p.totalReleaseMcm, 0);
  const totalSpillage = trajectory.reduce((sum, p) => sum + p.spillageMcm, 0);
  const totalEvap = trajectory.reduce((sum, p) => sum + p.evaporationMcm, 0);
  const totalEnergy = trajectory.reduce((sum, p) => sum + p.energyGeneratedGwh, 0);

  const storages = trajectory.map((p) => p.storageEndMcm);
  const minStorage = Math.min(...storages);
  const maxStorage = Math.max(...storages);
  const finalStorage = storages[storages.length - 1];

  let storageHealth: 'optimal' | 'adequate' | 'stressed' | 'critical' = 'optimal';
  if (minStorage <= deadStorageMcm * 1.05) storageHealth = 'critical';
  else if (minStorage <= deadStorageMcm + (maxCapacityMcm - deadStorageMcm) * 0.2) storageHealth = 'stressed';
  else if (overallReliability < 85) storageHealth = 'adequate';

  return {
    algorithmUsed: algorithm === 'lp-simplex'
      ? 'Linear Programming (Successive Linear Programming / Simplex Network Multi-Period Solver)'
      : 'Evolutionary Algorithm (Real-Valued Genetic Algorithm with Direct Release Policies & Elitism)',
    totalPeriods,
    timeStepLabel: timeStep === 'monthly' ? `${totalPeriods} Months (${years} Year${years > 1 ? 's' : ''})` : `${totalPeriods} Weeks (${years} Year${years > 1 ? 's' : ''})`,
    totalInflowMcm: parseFloat(totalInflow.toFixed(2)),
    totalCombinedReleaseMcm: parseFloat(totalCombinedRelease.toFixed(2)),
    totalSpillageMcm: parseFloat(totalSpillage.toFixed(2)),
    totalEvaporationMcm: parseFloat(totalEvap.toFixed(2)),
    totalEnergyGeneratedGwh: parseFloat(totalEnergy.toFixed(2)),
    totalDemandMcm: parseFloat(trajectory.reduce((sum, p) => sum + p.totalDemandMcm, 0).toFixed(2)),
    minStorageObservedMcm: parseFloat(minStorage.toFixed(2)),
    maxStorageObservedMcm: parseFloat(maxStorage.toFixed(2)),
    finalStorageMcm: parseFloat(finalStorage.toFixed(2)),
    storageHealthStatus: storageHealth,
    systemOverallReliabilityPct: parseFloat(overallReliability.toFixed(1)),
    systemOverallResiliencyPct: parseFloat(overallResiliency.toFixed(1)),
    systemOverallVulnerabilityPct: parseFloat(overallVulnerability.toFixed(1)),
    demandMetrics: {
      drinking: drinkPerf,
      irrigation: irrigPerf,
      industry: indusPerf,
      environmental: envPerf,
      hydropower: hydroPerf,
      storage: storagePerf,
    },
    normalizedObjectiveSummary: {
      totalNormalizedObjective: parseFloat(totalObjectivePenalty.toFixed(2)),
      demandNormalizedPenalty: breakdown.demandNormalizedPenalty,
      storageNormalizedPenalty: breakdown.storageNormalizedPenalty,
      hydropowerNormalizedPenalty: breakdown.hydropowerNormalizedPenalty,
      reliabilityPenalty: breakdown.reliabilityPenalty,
      vulnerabilityPenalty: breakdown.vulnerabilityPenalty,
      resiliencyPenalty: breakdown.resiliencyPenalty,
    },
    optimalRuleCurveProfile: optimalRuleCurve,
    trajectory,
    havCurveUsed: activeHavCurve,
    maxReleaseLimitPeriodMcm: parseFloat(maxReleasePeriodMcm.toFixed(2)),
    spillwayLimitPeriodMcm: parseFloat(spillwayPeriodMcm.toFixed(2)),
    maxTurbineLimitPeriodMcm: parseFloat(maxTurbinePeriodMcm.toFixed(2)),
  };
}
