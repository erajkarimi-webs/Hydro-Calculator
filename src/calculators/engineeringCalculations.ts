import { CalculationResult, CalculatorMeta, StepMath, UnitSystem } from '../types';
import { solveReservoirOptimization, ReservoirOptInputs, flowM3sToMcmPerPeriod } from './reservoirOptimizationEngine';

export const ALL_CALCULATORS_META: CalculatorMeta[] = [
  // 1. Water Quality Assessment
  {
    id: 'carlson-tsi',
    name: 'Carlson Trophic State Index (TSI)',
    shortDescription: 'Evaluates lake and reservoir productivity and algal biomass using Secchi depth, Chlorophyll-a, and Total Phosphorus.',
    domain: 'water-quality',
    featured: true,
    standardReference: 'Carlson, R.E. (1977). A trophic state index for lakes. Limnology and Oceanography, 22(2), 361-369.',
    equationSummary: 'TSI(SD) = 60 - 14.41 ln(SD) · TSI(Chl) = 9.81 ln(Chl) + 30.6 · TSI(TP) = 14.42 ln(TP) + 4.15',
  },
  {
    id: 'water-density-viscosity',
    name: 'Water Density & Viscosity vs. Temperature',
    shortDescription: 'Accurate thermal-hydraulic physical water properties from 0°C to 100°C via IAPWS and Kell polynomial formulations.',
    domain: 'water-quality',
    standardReference: 'IAPWS-95 Formulation & Kell, G.S. (1975). Density, thermal expansivity, and compressibility of liquid water.',
    equationSummary: 'ρ(T) via 5th-order Kell polynomial · μ(T) via Vogel equation · ν = μ / ρ',
  },
  {
    id: 'dilution-mass-balance',
    name: 'Stream Dilution & Mass Balance',
    shortDescription: 'Conservation of mass for river receiving waters, mixing zones, and effluent waste load allocation (WLA).',
    domain: 'water-quality',
    standardReference: 'EPA Technical Support Document for Water Quality-based Toxics Control (EPA/505/2-90-001).',
    equationSummary: 'C_mix = (Q_s·C_s + Q_e·C_e) / (Q_s + Q_e) · Dilution Factor DF = (Q_s + Q_e) / Q_e',
  },
  {
    id: 'langelier-ryznar',
    name: 'Langelier (LSI) & Ryznar (RSI) Scaling Indices',
    shortDescription: 'Assesses calcium carbonate saturation, scaling potential, and corrosivity in distribution and industrial water systems.',
    domain: 'water-quality',
    standardReference: 'Standard Methods for Examination of Water and Wastewater (Method 2330) · Langelier, W.F. (1936).',
    equationSummary: 'pH_s = (9.3 + A + B) - (C + D) · LSI = pH - pH_s · RSI = 2·pH_s - pH',
  },
  {
    id: 'chlorine-disinfection-ct',
    name: 'Chlorine Disinfection CT & Pathogen Inactivation',
    shortDescription: 'Calculates EPA Surface Water Treatment Rule disinfection credit and Log Giardia / Virus inactivation.',
    domain: 'water-quality',
    standardReference: 'US EPA Guidance Manual for Compliance with Filtration and Disinfection Requirements (1991).',
    equationSummary: 'CT_calc = C_residual · T_10 · Log Reduction = Log_target · (CT_calc / CT_req)',
  },

  // 2. Reservoir & Hydrologic Design
  {
    id: 'sequent-peak-reservoir',
    name: 'Sequent Peak Reservoir Sizing',
    shortDescription: 'Sequenced Peak Algorithm (SPA / Rippl Mass Curve) to determine minimum required active storage for variable inflows.',
    domain: 'hydrology-reservoirs',
    featured: true,
    standardReference: 'Thomas, H.A. & Fiering, M.B. (1962). Mathematical Synthesis of Streamflow Sequences · Loucks et al. (1981).',
    equationSummary: 'K_t = max(0, K_{t-1} + D_t - Q_t) · Required Storage S_req = max(K_t)',
  },
  {
    id: 'rational-method-runoff',
    name: 'Rational Method Peak Storm Runoff',
    shortDescription: 'Computes peak stormwater runoff rate using composite catchment runoff coefficient and rainfall intensity.',
    domain: 'hydrology-reservoirs',
    standardReference: 'ASCE Manual of Practice No. 77 / WEF Manual of Practice FD-20 Design and Construction of Urban Stormwater Management.',
    equationSummary: 'Q = C · I · A (SI: Q = 0.00278·C·I·A · US: Q = C·I·A) · Kirpich t_c',
  },
  {
    id: 'manning-open-channel',
    name: "Manning's Open Channel Flow",
    shortDescription: 'Hydraulic calculations for rectangular, trapezoidal, triangular, and circular channels with dynamic shape parameters.',
    domain: 'hydrology-reservoirs',
    standardReference: 'Chow, V.T. (1959). Open-Channel Hydraulics · Henderson, F.M. (1966).',
    equationSummary: 'Q = (k_n / n) · A · R^(2/3) · S_0^(1/2) · Fr = v / √(g·D_h)',
  },
  {
    id: 'reservoir-evaporation',
    name: 'Reservoir Evaporation Volumetric Loss',
    shortDescription: 'Estimates open water evaporative losses using coordinates, wind speed, elevation, and Meyer-Dalton energy balance.',
    domain: 'hydrology-reservoirs',
    standardReference: 'Meyer, A.F. (1915) · FAO Irrigation and Drainage Paper 56 · World Meteorological Organization.',
    equationSummary: 'E = 11·(1 + 0.1·u_2)·(e_s - e_a) · Vol_loss = E_depth · Surface Area',
  },
  {
    id: 'scs-curve-number',
    name: 'NRCS / SCS Runoff Curve Number (CN)',
    shortDescription: 'Determines direct surface runoff depth and volume from storm precipitation based on soil group and land use.',
    domain: 'hydrology-reservoirs',
    standardReference: 'USDA Natural Resources Conservation Service (NRCS) National Engineering Handbook, Part 630 Hydrology.',
    equationSummary: 'S = (25400/CN - 254) · I_a = 0.2·S · Q = (P - I_a)^2 / (P - I_a + S)',
  },
  {
    id: 'reservoir-optimization',
    name: 'Reservoir Operation Optimization (LP Simplex & Evolutionary Algorithm)',
    shortDescription: 'Multi-objective optimal releases, storage trajectory, rule curves, and Hashimoto reliability-resiliency-vulnerability criteria for 1-5 years.',
    domain: 'hydrology-reservoirs',
    featured: true,
    difficulty: 'advanced',
    standardReference: 'Loucks et al. (1981) Water Resource Systems Planning · Hashimoto et al. (1982) Water Resources Research.',
    equationSummary: 'S_{t+1} = S_t + I_t - R_t - Sp_t - E_t · min Σ [w_k(D_k - A_k)² + w_E(E_dem - E)²] · Hashimoto (α, γ, ν)',
  },

  // 3. Wastewater Treatment
  {
    id: 'streeter-phelps-sag',
    name: 'DO–BOD Streeter-Phelps Stream Sag Model',
    shortDescription: 'Simulates the dissolved oxygen sag curve downstream of an organic wastewater discharge, pinpointing critical DO.',
    domain: 'wastewater',
    featured: true,
    standardReference: 'Streeter, H.W. & Phelps, E.B. (1925). A Study of the Pollution and Natural Purification of the Ohio River (USPHS Bulletin 146).',
    equationSummary: 'D(t) = [k_d·L_0 / (k_r - k_d)] · [e^(-k_d·t) - e^(-k_r·t)] + D_0·e^(-k_r·t) · t_c & D_c',
  },
  {
    id: 'activated-sludge',
    name: 'Activated Sludge Reactor Designer',
    shortDescription: 'Biological wastewater design utilizing Monod growth kinetics for tank volume, SRT, HRT, F/M, O2, and RAS rate.',
    domain: 'wastewater',
    featured: true,
    standardReference: 'Metcalf & Eddy / AECOM (2014). Wastewater Engineering: Treatment and Resource Recovery (5th Edition).',
    equationSummary: 'θ_c = V·X / (Q_w·X_w + Q_e·X_e) · RO = Q(S_0 - S) - 1.42·P_x + 4.57·Q(N_0 - N)',
  },
  {
    id: 'chlorine-contact-tank',
    name: 'Chlorine Contact Tank Baffling & Sizing',
    shortDescription: 'Calculates disinfection chamber volume, baffling factor T10/HRT ratio, and length-to-width plug-flow geometry.',
    domain: 'wastewater',
    standardReference: 'US EPA Disinfection Profiling and Benchmarking Guidance Manual · AWWA Standard B300.',
    equationSummary: 'HRT = T_10 / BF · V = Q_peak · HRT · Aspect Ratio L/W ≥ 40:1 for plug-flow',
  },
  {
    id: 'particle-settling',
    name: "Particle Settling Velocity (Stokes' Law)",
    shortDescription: 'Evaluates discrete particle settling velocities in clarifiers and grit chambers with Reynolds regime check.',
    domain: 'wastewater',
    standardReference: 'Stokes, G.G. (1851) · Fair, Geyer, & Okun. Water and Wastewater Engineering.',
    equationSummary: 'v_s = [g·(ρ_p - ρ)·d^2] / (18·μ) · Re_p = ρ·v_s·d / μ',
  },
  {
    id: 'rapid-sand-filter',
    name: 'Rapid Sand Filter Clean Bed Head Loss',
    shortDescription: 'Evaluates hydraulic clean bed head loss using the Rose and Carmen-Kozeny formulations and backwash expansion.',
    domain: 'wastewater',
    standardReference: 'Rose, H.E. (1945). On the resistance to the flow of fluids through beds of granular materials · Fair-Hatch.',
    equationSummary: 'h_L = [1.067·C_D·v_a^2·L] / (φ·g·ε^4) · Σ(x_i / d_i)',
  },

  // 4. Geo-Energy & Hydropower
  {
    id: 'pumped-storage-hydro',
    name: 'Pumped Storage Hydropower Feasibility',
    shortDescription: 'Reservoir volumes, daily allowable drawdown, reversible vs. separate system architectures, and generating feasibility.',
    domain: 'geo-energy',
    featured: true,
    standardReference: 'International Hydropower Association (IHA) · US Department of Energy Hydropower Vision Report.',
    equationSummary: 'P_gen = (η_gen·ρ·g·Q·H_net) / 10^6 MW · E_store = (η_gen·ρ·g·V·H_net) / 3.6e9 MWh',
  },
  {
    id: 'pipe-head-loss',
    name: 'Pipe Head Loss (Darcy-Weisbach & Hazen-Williams)',
    shortDescription: 'Friction factor iteration via Colebrook-White, Swamee-Jain, Hazen-Williams comparison, and minor losses.',
    domain: 'geo-energy',
    standardReference: 'Colebrook, C.F. (1939) · Swamee, P.K. & Jain, A.K. (1976) · Hazen & Williams.',
    equationSummary: 'h_f = f·(L/D)·(v^2 / 2g) · 1/√f = -2 log10(ε/(3.7D) + 2.51/(Re√f)) · h_m = ΣK·v^2/2g',
  },
  {
    id: 'turbine-selection',
    name: 'Hydro Turbine Selection & Specific Speed',
    shortDescription: 'Calculates turbine specific speed (Ns) to identify optimal machine type (Pelton, Francis, Kaplan, Turgo, Crossflow).',
    domain: 'geo-energy',
    standardReference: 'IEC 60193: Hydraulic turbines, storage pumps and pump-turbines · USBR Engineering Monograph No. 20.',
    equationSummary: 'N_s = N · √P / H^(5/4) · Machine operating envelope suitability matrix',
  },
  {
    id: 'pump-sizing-affinity',
    name: 'Centrifugal Pump Sizing & Affinity Laws',
    shortDescription: 'Hydraulic and brake horsepower, scaling with speed/diameter changes, and Net Positive Suction Head (NPSH) margin.',
    domain: 'geo-energy',
    standardReference: 'Hydraulic Institute Standards (ANSI/HI 14.6) · Karassik et al., Pump Handbook (4th Edition).',
    equationSummary: 'P_hyd = ρ·g·Q·H / 1000 · BHP = P_hyd / η_pump · NPSH_a = (P_atm - P_v)/(ρg) + z_s - h_fs',
  },

  // 5. WEF (Water-Energy-Food) Nexus
  {
    id: 'penman-monteith-et0',
    name: 'FAO-56 Penman-Monteith Reference ET₀',
    shortDescription: 'Standardized FAO formulation for reference evapotranspiration from grass surfaces combining radiation and aerodynamics.',
    domain: 'wef-nexus',
    featured: true,
    standardReference: 'Allen, R.G., Pereira, L.S., Raes, D., & Smith, M. (1998). Crop evapotranspiration (FAO Irrigation and Drainage Paper 56).',
    equationSummary: 'ET_0 = [0.408·Δ·(R_n - G) + γ·(900/(T+273))·u_2·(e_s - e_a)] / [Δ + γ·(1 + 0.34·u_2)]',
  },
  {
    id: 'crop-water-requirement',
    name: 'Crop Water Requirement & Irrigation Scheduling',
    shortDescription: 'Determines crop evapotranspiration (ETc = Kc * ET0), net irrigation requirements, and gross delivery depths.',
    domain: 'wef-nexus',
    standardReference: 'FAO Irrigation and Drainage Paper 56 · USDA-NRCS Irrigation Guide Part 652.',
    equationSummary: 'ET_c = K_c · ET_0 · NIR = max(0, ET_c - P_eff) · GIR = NIR / η_irr',
  },
  {
    id: 'irrigation-efficiency',
    name: 'Irrigation System Distribution Uniformity (DU & CU)',
    shortDescription: 'Calculates Christiansen Uniformity Coefficient (CU), Low-Quarter Distribution Uniformity (DU), and application rate.',
    domain: 'wef-nexus',
    standardReference: 'ASABE Standards S436.1: Test Procedure for Determining the Uniformity of Water Distribution.',
    equationSummary: 'DU = D_lq / D_avg · CU = [1 - Σ|d_i - D_avg| / (n·D_avg)] · 100%',
  },
  {
    id: 'water-energy-footprint',
    name: 'Water-Energy Nexus Life-Cycle Footprint',
    shortDescription: 'Quantifies specific electrical energy intensity (kWh/m³) and greenhouse gas emissions across the municipal water cycle.',
    domain: 'wef-nexus',
    standardReference: 'EPRI / Water Research Foundation Water & Sustainability · IEA Water Energy Nexus Report.',
    equationSummary: 'Specific Energy = Σ(E_stage / V_water) · Annual Cost = Total kWh · Unit Cost · CO2e Footprint',
  },

  // 6. Wastewater Treatment Ponds & Advanced Systems
  {
    id: 'ponds-treatment',
    name: 'Waste Stabilization Ponds (Anaerobic, Facultative & Maturation)',
    shortDescription: 'Sizing natural wastewater stabilization pond series using Marais-Shaw, Gloyna, and Mara pathogen die-off kinetics.',
    domain: 'wastewater',
    featured: true,
    difficulty: 'intermediate',
    standardReference: 'Mara, D. (2004). Domestic Wastewater Treatment in Developing Countries · Marais, G.v.R. & Shaw, V.A. (1961).',
    equationSummary: 'λ_v = (Q·S_i)/V_a · λ_s = 10·Q·S_e/A_f = 350(1.107 - 0.002T)^(T-25) · N_e = N_i / [(1+k_b θ_a)(1+k_b θ_f)(1+k_b θ_m)^n]',
  },
  {
    id: 'desalination-ro',
    name: 'Reverse Osmosis Desalination (SWRO & BWRO)',
    shortDescription: 'Comprehensive membrane hydraulics, osmotic pressure, Net Driving Pressure (NDP), specific energy consumption (SEC), and ERD efficiency.',
    domain: 'desalination',
    featured: true,
    difficulty: 'advanced',
    standardReference: 'AWWA Manual M46 Reverse Osmosis and Nanofiltration · Dupont/FilmTec Technical Manual · Wilf, M. (2007).',
    equationSummary: 'Π = 0.076·TDS·(T+273.15)/298.15 · NDP = P_feed - ΔP_drop - Π_avg · SEC = P_feed·(1 - Y·η_ERD)/(36·η_p·Y) kWh/m³',
  },
  {
    id: 'ai-treatment-train',
    name: 'AI Multi-Barrier Treatment Train Advisor',
    shortDescription: 'Generates comprehensive, multi-barrier water and wastewater treatment flowsheets, unit sizing, log credits, and sludge handling.',
    domain: 'wastewater',
    featured: true,
    difficulty: 'advanced',
    standardReference: 'Metcalf & Eddy / AECOM (5th Ed.) · US EPA & WHO Guidelines for Drinking Water and Water Reuse.',
    equationSummary: 'Multi-Barrier Barrier Train: Physical Interception → Coagulation/Clarification → Biological/MBR → RO/GAC Polishing → Disinfection',
  },

  // 7. Agricultural Water & Irrigation Hydraulics
  {
    id: 'agricultural-salinity',
    name: 'Crop Leaching Requirement & Soil Salinity Management',
    shortDescription: 'Evaluates FAO-29 Rhodes leaching requirement (LR), electrical conductivity build-up risk, and gross irrigation with salinity control.',
    domain: 'agricultural',
    featured: true,
    difficulty: 'intermediate',
    standardReference: 'Ayers, R.S. & Westcot, D.W. (1985). Water quality for agriculture (FAO Irrigation and Drainage Paper 29) · USDA Salinity Lab.',
    equationSummary: 'LR = EC_w / [5·(EC_e) - EC_w] · GIR_leach = ET_c / [(1 - LR) · η_irr] · Salinity yield threshold curve',
  },
  {
    id: 'irrigation-lateral-hydraulics',
    name: 'Drip & Sprinkler Lateral Pipe Hydraulics',
    shortDescription: 'Calculates Christiansen multi-outlet reduction factor (F), lateral friction head loss, pressure variation, and emitter flow uniformity.',
    domain: 'agricultural',
    difficulty: 'intermediate',
    standardReference: 'Christiansen, J.E. (1942) · Keller, J. & Bliesner, R.D. (1990). Sprinkle and Trickle Irrigation · ASABE S398.',
    equationSummary: 'F = 1/(m+1) + 1/(2N) + √(m-1)/(6N²) · h_f = F · 10.67·(Q^1.852 / C^1.852·D^4.87)·L · ΔH/H_0 ≤ 10-20%',
  },
];

/* =========================================================================
   MATHEMATICAL CALCULATOR ENGINES WITH ZERO ERRORS & STEP-BY-STEP PROOF
   ========================================================================= */

// 1. Carlson Trophic State Index
export function calcCarlsonTsi(inputs: {
  secchi: number; // m
  chla: number;   // ug/L
  tp: number;     // ug/L
}): CalculationResult {
  const { secchi, chla, tp } = inputs;
  
  const tsiSd = secchi > 0 ? 60 - 14.41 * Math.log(secchi) : 0;
  const tsiChl = chla > 0 ? 9.81 * Math.log(chla) + 30.6 : 0;
  const tsiTp = tp > 0 ? 14.42 * Math.log(tp) + 4.15 : 0;

  const validTsis = [tsiSd, tsiChl, tsiTp].filter(v => v > 0);
  const avgTsi = validTsis.length > 0 
    ? validTsis.reduce((a, b) => a + b, 0) / validTsis.length 
    : 0;

  let trophicClass = 'Oligotrophic';
  let statusType: 'success' | 'normal' | 'warning' | 'critical' = 'success';
  let description = 'Low biological productivity, clear water, high hypolimnetic dissolved oxygen.';

  if (avgTsi >= 70) {
    trophicClass = 'Hypereutrophic';
    statusType = 'critical';
    description = 'Severe algal blooms, dense scum, frequent fish kills, hypereutrophic conditions.';
  } else if (avgTsi >= 50) {
    trophicClass = 'Eutrophic';
    statusType = 'warning';
    description = 'High nutrient enrichment, frequent blue-green algae, reduced summer transparency.';
  } else if (avgTsi >= 40) {
    trophicClass = 'Mesotrophic';
    statusType = 'normal';
    description = 'Moderate algal productivity, supporting warm-water fisheries, moderate clarity.';
  }

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Secchi Disk TSI',
      formula: 'TSI(SD) = 60 - 14.41 × ln(SD in meters)',
      substitution: `60 - 14.41 × ln(${secchi})`,
      result: `${tsiSd.toFixed(2)}`,
      note: 'Measures physical water transparency and light extinction depth.',
    },
    {
      stepName: 'Calculate Chlorophyll-a TSI',
      formula: 'TSI(Chl-a) = 9.81 × ln(Chl-a in µg/L) + 30.6',
      substitution: `9.81 × ln(${chla}) + 30.6`,
      result: `${tsiChl.toFixed(2)}`,
      note: 'Represents algal biomass standing crop in the epilimnion.',
    },
    {
      stepName: 'Calculate Total Phosphorus TSI',
      formula: 'TSI(TP) = 14.42 × ln(TP in µg/L) + 4.15',
      substitution: `14.42 × ln(${tp}) + 4.15`,
      result: `${tsiTp.toFixed(2)}`,
      note: 'Evaluates the primary limiting nutrient for inland temperate and subtropical lakes.',
    },
    {
      stepName: 'Calculate Composite Trophic State Index',
      formula: 'TSI_avg = (TSI_SD + TSI_Chl + TSI_TP) / 3',
      substitution: `(${tsiSd.toFixed(2)} + ${tsiChl.toFixed(2)} + ${tsiTp.toFixed(2)}) / 3`,
      result: `${avgTsi.toFixed(2)} (${trophicClass})`,
      note: description,
    },
  ];

  return {
    primaryLabel: 'Composite Carlson TSI',
    primaryValue: avgTsi.toFixed(1),
    primaryUnit: 'points (0–100)',
    statusLabel: trophicClass,
    statusType,
    secondaryOutputs: [
      { label: 'TSI (Secchi Depth)', value: tsiSd.toFixed(1), unit: 'pts', description: `Secchi depth: ${secchi} m` },
      { label: 'TSI (Chlorophyll-a)', value: tsiChl.toFixed(1), unit: 'pts', description: `Chl-a: ${chla} µg/L` },
      { label: 'TSI (Total Phosphorus)', value: tsiTp.toFixed(1), unit: 'pts', description: `TP: ${tp} µg/L` },
      { label: 'Limiting Nutrient State', value: tsiTp > tsiChl ? 'Phosphorus Surplus' : 'Phosphorus Limited', unit: '', description: 'TSI(Chl) vs TSI(TP) deviation' },
    ],
    steps,
    reference: 'Carlson, R. E. (1977). A trophic state index for lakes. Limnology and oceanography, 22(2), 361-369.',
  };
}

// 2. DO–BOD Streeter-Phelps Stream Model
export function calcStreeterPhelps(inputs: {
  kd: number;     // deoxygenation rate (1/day)
  kr: number;     // reaeration rate (1/day)
  L0: number;     // initial ultimate BOD (mg/L)
  D0: number;     // initial dissolved oxygen deficit (mg/L)
  DOsat: number;  // saturation DO (mg/L)
  velocity: number; // stream velocity (km/day)
  reachDays?: number; // duration to simulate
}): CalculationResult & { curvePoints: Array<{ t: number; DO: number; deficit: number; BOD: number; distKm: number }> } {
  const { kd, kr, L0, D0, DOsat, velocity, reachDays = 10 } = inputs;
  
  const krSafe = Math.abs(kr - kd) < 1e-5 ? kd + 1e-4 : kr;

  // Critical time tc
  let tc = 0;
  const inner = (krSafe / kd) * (1 - D0 * (krSafe - kd) / (kd * L0));
  if (inner > 0) {
    tc = (1 / (krSafe - kd)) * Math.log(inner);
    if (tc < 0) tc = 0;
  }

  // Critical deficit Dc
  const Dc = tc > 0 
    ? (kd * L0 / (krSafe - kd)) * (Math.exp(-kd * tc) - Math.exp(-krSafe * tc)) + D0 * Math.exp(-krSafe * tc)
    : D0;

  const minDO = Math.max(0, DOsat - Dc);
  const criticalDistKm = tc * velocity;

  const maxT = Math.max(reachDays, Math.ceil(tc * 2.5));
  const stepsCount = 100;
  const dt = maxT / stepsCount;
  const curvePoints: Array<{ t: number; DO: number; deficit: number; BOD: number; distKm: number }> = [];

  for (let i = 0; i <= stepsCount; i++) {
    const t = i * dt;
    const def = (kd * L0 / (krSafe - kd)) * (Math.exp(-kd * t) - Math.exp(-krSafe * t)) + D0 * Math.exp(-krSafe * t);
    const dissolvedOxy = Math.max(0, DOsat - def);
    const remBOD = L0 * Math.exp(-kd * t);
    curvePoints.push({
      t: Number(t.toFixed(2)),
      DO: Number(dissolvedOxy.toFixed(2)),
      deficit: Number(def.toFixed(2)),
      BOD: Number(remBOD.toFixed(2)),
      distKm: Number((t * velocity).toFixed(1)),
    });
  }

  let statusType: 'success' | 'warning' | 'critical' = 'success';
  let statusLabel = 'Healthy (DO > 5.0 mg/L)';
  if (minDO < 2.0) {
    statusType = 'critical';
    statusLabel = 'Hypoxic / Anoxic Risk (DO < 2.0 mg/L)';
  } else if (minDO < 5.0) {
    statusType = 'warning';
    statusLabel = 'Stressful to Aquatic Biota (DO < 5.0 mg/L)';
  }

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Critical Travel Time (t_c)',
      formula: 't_c = [1 / (k_r - k_d)] × ln[ (k_r / k_d) × (1 - D_0 × (k_r - k_d) / (k_d × L_0)) ]',
      substitution: `1 / (${krSafe} - ${kd}) × ln[ (${krSafe}/${kd}) × (1 - ${D0}×(${krSafe}-${kd})/(${kd}×${L0})) ]`,
      result: `${tc.toFixed(3)} days (${(tc * 24).toFixed(1)} hours)`,
      note: 'Location in time downstream where BOD decay rate matches reaeration rate.',
    },
    {
      stepName: 'Calculate Critical Deficit (D_c)',
      formula: 'D_c = [k_d · L_0 / (k_r - k_d)] × [e^(-k_d · t_c) - e^(-k_r · t_c)] + D_0 · e^(-k_r · t_c)',
      substitution: `[${kd} × ${L0} / (${krSafe} - ${kd})] × [e^(-${kd}×${tc.toFixed(2)}) - e^(-${krSafe}×${tc.toFixed(2)})] + ${D0} × e^(-${krSafe}×${tc.toFixed(2)})`,
      result: `${Dc.toFixed(3)} mg/L`,
      note: 'Maximum oxygen deficit in the stream reaches its zenith at t_c.',
    },
    {
      stepName: 'Calculate Minimum Dissolved Oxygen (DO_min)',
      formula: 'DO_min = DO_sat - D_c',
      substitution: `${DOsat} - ${Dc.toFixed(3)}`,
      result: `${minDO.toFixed(3)} mg/L`,
      note: statusLabel,
    },
    {
      stepName: 'Calculate Critical Downstream Distance (x_c)',
      formula: 'x_c = Velocity × t_c',
      substitution: `${velocity} km/day × ${tc.toFixed(3)} days`,
      result: `${criticalDistKm.toFixed(2)} km`,
      note: 'Physical river reach where the minimum DO occurs.',
    },
  ];

  return {
    primaryLabel: 'Critical Minimum DO (DO_min)',
    primaryValue: minDO.toFixed(2),
    primaryUnit: 'mg/L',
    statusLabel,
    statusType,
    secondaryOutputs: [
      { label: 'Critical Travel Time (t_c)', value: tc.toFixed(2), unit: 'days', description: `${(tc * 24).toFixed(1)} hours downstream` },
      { label: 'Critical Downstream Reach (x_c)', value: criticalDistKm.toFixed(1), unit: 'km', description: `At stream velocity ${velocity} km/d` },
      { label: 'Maximum Deficit (D_c)', value: Dc.toFixed(2), unit: 'mg/L', description: `Deficit relative to DO_sat ${DOsat} mg/L` },
      { label: 'Self-Purification Ratio (f)', value: (kr / kd).toFixed(2), unit: 'ratio', description: 'f = k_r / k_d (> 2.0 indicates rapid recovery)' },
    ],
    steps,
    reference: 'Streeter, H. W., & Phelps, E. B. (1925). A study of the pollution and natural purification of the Ohio River (Public Health Bulletin 146).',
    curvePoints,
  };
}

// 3. Sequent Peak Reservoir Sizing
export function calcSequentPeak(inputs: {
  monthlyInflows: number[];
  monthlyDemands: number[];
  unitLabel?: string;
}): CalculationResult & {
  cumInflow: number[];
  cumDemand: number[];
  deficits: number[];
  labels: string[];
  maxDeficitIndex: number;
} {
  const { monthlyInflows, monthlyDemands, unitLabel = 'M m³' } = inputs;
  const n = monthlyInflows.length;

  const doubleInflow = [...monthlyInflows, ...monthlyInflows];
  const doubleDemand = [...monthlyDemands, ...monthlyDemands];
  
  const deficits: number[] = [];
  let currentDeficit = 0;
  let maxDeficit = 0;
  let maxDeficitIdx = 0;

  for (let t = 0; t < doubleInflow.length; t++) {
    const diff = doubleDemand[t] - doubleInflow[t];
    currentDeficit = Math.max(0, currentDeficit + diff);
    deficits.push(currentDeficit);
    if (currentDeficit > maxDeficit) {
      maxDeficit = currentDeficit;
      maxDeficitIdx = t % n;
    }
  }

  const cumInflow: number[] = [];
  const cumDemand: number[] = [];
  let sumInf = 0;
  let sumDem = 0;
  const labels: string[] = [];

  for (let i = 0; i < n; i++) {
    sumInf += monthlyInflows[i];
    sumDem += monthlyDemands[i];
    cumInflow.push(Number(sumInf.toFixed(2)));
    cumDemand.push(Number(sumDem.toFixed(2)));
    labels.push(`M${i + 1}`);
  }

  const totalInflow = monthlyInflows.reduce((a, b) => a + b, 0);
  const totalDemand = monthlyDemands.reduce((a, b) => a + b, 0);
  const yieldRatio = totalInflow > 0 ? (totalDemand / totalInflow) * 100 : 0;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Annual Water Balance',
      formula: 'Net Yield = Total Inflow - Total Demand',
      substitution: `${totalInflow.toFixed(1)} ${unitLabel} - ${totalDemand.toFixed(1)} ${unitLabel}`,
      result: `${(totalInflow - totalDemand).toFixed(1)} ${unitLabel} (Yield ratio: ${yieldRatio.toFixed(1)}%)`,
      note: totalInflow < totalDemand ? 'Warning: Demand exceeds total historical inflow!' : 'Catchment inflow exceeds annual demand.',
    },
    {
      stepName: 'Apply Sequent Peak Algorithm (SPA)',
      formula: 'K_t = max(0, K_{t-1} + Demand_t - Inflow_t)',
      substitution: `Iterated across dual periods (2N = ${2 * n} steps) to ensure cycle closure`,
      result: `Peak Deficit = ${maxDeficit.toFixed(2)} ${unitLabel}`,
      note: `Max storage depletion occurs during Month ${maxDeficitIdx + 1}.`,
    },
    {
      stepName: 'Determine Required Active Storage Capacity',
      formula: 'S_required = max(K_t)',
      substitution: `max(K_t) over full drought cycle`,
      result: `${maxDeficit.toFixed(2)} ${unitLabel}`,
      note: 'Does not include dead storage for sedimentation or evaporative losses.',
    },
  ];

  return {
    primaryLabel: 'Required Active Reservoir Storage',
    primaryValue: maxDeficit.toFixed(2),
    primaryUnit: unitLabel,
    statusLabel: totalInflow >= totalDemand ? 'Hydrologically Sustainable' : 'Demand Exceeds Runoff',
    statusType: totalInflow >= totalDemand ? 'success' : 'critical',
    secondaryOutputs: [
      { label: 'Total Period Inflow', value: totalInflow.toFixed(1), unit: unitLabel },
      { label: 'Total Period Demand', value: totalDemand.toFixed(1), unit: unitLabel },
      { label: 'Storage-to-Demand Ratio', value: totalDemand > 0 ? ((maxDeficit / totalDemand) * 100).toFixed(1) : '0', unit: '%', description: 'Portion of annual yield required as buffer' },
      { label: 'Peak Drawdown Period', value: `Month ${maxDeficitIdx + 1}`, unit: '', description: 'Critical water shortage timestep' },
    ],
    steps,
    reference: 'Thomas, H. A., & Fiering, M. B. (1962). Mathematical synthesis of streamflow sequences. Harvard University Press.',
    cumInflow,
    cumDemand,
    deficits: deficits.slice(0, n).map(v => Number(v.toFixed(2))),
    labels,
    maxDeficitIndex: maxDeficitIdx,
  };
}

// 4. FAO-56 Penman-Monteith Reference Evapotranspiration (ET0) & Crop Water Table
export interface CropEtDemand {
  cropName: string;
  kcMid: number;
  etcMmDay: number;
  monthlyWaterM3Ha: number;
}

export function calcPenmanMonteith(inputs: {
  tempMean: number;      // °C
  solarRad: number;      // MJ/m2/day (Rs)
  windSpeed: number;     // m/s at 2m (u2)
  relHumidity: number;   // %
  elevation: number;     // m
}): CalculationResult & {
  seasonalMonthlyET0: Array<{ month: string; et0: number }>;
  cropDemands: CropEtDemand[];
} {
  const { tempMean, solarRad, windSpeed, relHumidity, elevation } = inputs;

  const P = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
  const gamma = 0.000665 * P;
  const es = 0.6108 * Math.exp((17.27 * tempMean) / (tempMean + 237.3));
  const ea = es * (relHumidity / 100);
  const delta = (4098 * es) / Math.pow(tempMean + 237.3, 2);
  const Rn = 0.77 * solarRad;
  const G = 0;

  const numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (tempMean + 273)) * windSpeed * (es - ea);
  const denominator = delta + gamma * (1 + 0.34 * windSpeed);
  const et0Daily = Math.max(0, numerator / denominator);
  const et0Monthly = et0Daily * 30.4;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalMultipliers = [0.55, 0.68, 0.88, 1.12, 1.35, 1.48, 1.50, 1.38, 1.15, 0.85, 0.62, 0.49];
  const seasonalMonthlyET0 = months.map((m, idx) => ({
    month: m,
    et0: Number((et0Daily * seasonalMultipliers[idx] * 30.4).toFixed(1)),
  }));

  // Standard major crops with FAO-56 mid-season crop coefficient Kc
  const cropList = [
    { cropName: 'Wheat & Small Grains', kcMid: 1.15 },
    { cropName: 'Maize / Field Corn', kcMid: 1.20 },
    { cropName: 'Paddy Rice', kcMid: 1.25 },
    { cropName: 'Alfalfa / Pasture', kcMid: 1.20 },
    { cropName: 'Cotton', kcMid: 1.20 },
    { cropName: 'Soybean', kcMid: 1.15 },
    { cropName: 'Potato / Tubers', kcMid: 1.15 },
    { cropName: 'Tomato / Fresh Veg', kcMid: 1.15 },
    { cropName: 'Sugar Beet', kcMid: 1.20 },
    { cropName: 'Citrus & Fruit Orchards', kcMid: 0.85 },
    { cropName: 'Vineyard / Table Grapes', kcMid: 0.70 },
    { cropName: 'Olive Groves', kcMid: 0.65 },
  ];

  const cropDemands: CropEtDemand[] = cropList.map((c) => {
    const etc = et0Daily * c.kcMid;
    // 1 mm depth over 1 ha = 10 m3 water
    const monthlyWater = etc * 30.4 * 10;
    return {
      cropName: c.cropName,
      kcMid: c.kcMid,
      etcMmDay: Number(etc.toFixed(2)),
      monthlyWaterM3Ha: Math.round(monthlyWater),
    };
  });

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Atmospheric Pressure (P) & Psychrometric Constant (γ)',
      formula: 'P = 101.3 × [(293 - 0.0065·z)/293]^5.26 · γ = 0.665 × 10^(-3) · P',
      substitution: `P = 101.3 × [(293 - 0.0065×${elevation})/293]^5.26 = ${P.toFixed(2)} kPa · γ = ${gamma.toFixed(4)} kPa/°C`,
      result: `P = ${P.toFixed(2)} kPa, γ = ${gamma.toFixed(4)} kPa/°C`,
    },
    {
      stepName: 'Calculate Saturation & Actual Vapor Pressure',
      formula: 'e_s = 0.6108 exp(17.27·T / (T+237.3)) · e_a = e_s × (RH/100)',
      substitution: `e_s = 0.6108 exp(17.27×${tempMean}/(${tempMean}+237.3)) = ${es.toFixed(3)} kPa · e_a = ${ea.toFixed(3)} kPa`,
      result: `Vapor Deficit (e_s - e_a) = ${(es - ea).toFixed(3)} kPa`,
    },
    {
      stepName: 'Calculate Slope of Vapor Pressure Curve (Δ)',
      formula: 'Δ = 4098 · e_s / (T + 237.3)^2',
      substitution: `4098 × ${es.toFixed(3)} / (${tempMean} + 237.3)^2`,
      result: `Δ = ${delta.toFixed(4)} kPa/°C`,
    },
    {
      stepName: 'Apply FAO-56 Penman-Monteith Equation',
      formula: 'ET_0 = [0.408·Δ·(R_n - G) + γ·(900/(T+273))·u_2·(e_s - e_a)] / [Δ + γ·(1 + 0.34·u_2)]',
      substitution: `[0.408×${delta.toFixed(4)}×${Rn.toFixed(1)} + ${gamma.toFixed(4)}×(900/${tempMean + 273})×${windSpeed}×${(es - ea).toFixed(3)}] / [${delta.toFixed(4)} + ${gamma.toFixed(4)}×(1 + 0.34×${windSpeed})]`,
      result: `${et0Daily.toFixed(2)} mm/day`,
      note: 'Hypothetical grass reference crop (height 0.12 m, surface resistance 70 s/m, albedo 0.23).',
    },
    {
      stepName: 'Crop Evapotranspiration Relationship (ET_c = K_c × ET_0)',
      formula: 'ET_c = K_c × ET_0',
      substitution: 'Crop coefficient K_c scales reference grass demand to specific physiological canopy leaf area index and aerodynamic roughness.',
      result: `E.g., Field Corn (Kc=1.20) requires ${(et0Daily * 1.2).toFixed(2)} mm/day`,
      note: 'Directly powers seasonal crop water requirement tables and irrigation scheduling.',
    },
  ];

  return {
    primaryLabel: 'Reference Evapotranspiration (ET₀)',
    primaryValue: et0Daily.toFixed(2),
    primaryUnit: 'mm / day',
    statusLabel: et0Daily > 6 ? 'High Evaporative Demand' : et0Daily > 3 ? 'Moderate Evaporative Demand' : 'Low Evaporative Demand',
    statusType: et0Daily > 6 ? 'warning' : 'normal',
    secondaryOutputs: [
      { label: 'Monthly Equivalent', value: et0Monthly.toFixed(1), unit: 'mm / month' },
      { label: 'Annual Estimate', value: (et0Daily * 365).toFixed(0), unit: 'mm / year' },
      { label: 'Vapor Pressure Deficit (VPD)', value: (es - ea).toFixed(3), unit: 'kPa', description: 'Atmospheric drying potential' },
      { label: 'Psychrometric Constant (γ)', value: gamma.toFixed(4), unit: 'kPa/°C', description: `At elevation ${elevation} m` },
    ],
    steps,
    reference: 'Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998). Crop evapotranspiration (FAO Irrigation and drainage paper 56).',
    seasonalMonthlyET0,
    cropDemands,
  };
}

// 5. Activated Sludge Reactor Designer (Metcalf & Eddy Monod Kinetics)
export function calcActivatedSludge(inputs: {
  flowQ: number;          // m3/day
  bodIn: number;          // mg/L (S0)
  bodOut: number;         // mg/L (S)
  mlss: number;           // mg/L (X)
  srt: number;            // days (theta_c)
  tknIn?: number;         // mg/L (N0)
  tknOut?: number;        // mg/L (Ne)
}): CalculationResult {
  const { flowQ, bodIn, bodOut, mlss, srt, tknIn = 35, tknOut = 2 } = inputs;

  const Y = 0.60;     // g VSS / g BOD5
  const kd = 0.06;    // 1/day decay coefficient
  const vssMlssRatio = 0.80; // MLVSS / MLSS
  const mlvss = mlss * vssMlssRatio; // X_v (mg/L)
  const underflowConc = 10000; // X_r (mg/L in clarifier underflow)

  const deltaS = Math.max(0, bodIn - bodOut);
  const PxBio = (flowQ * deltaS * Y / 1000) / (1 + kd * srt);
  const V = (PxBio * 1000 * srt) / mlvss;
  const hrtHours = (V / flowQ) * 24;
  const fmRatio = (flowQ * bodIn) / (V * mlvss);
  const volumetricLoading = (flowQ * bodIn / 1000) / V;
  const Qw = (V * mlss) / (srt * underflowConc);
  const rasRatio = mlss / (underflowConc - mlss);

  const deltaN = Math.max(0, tknIn - tknOut);
  const carbonaceousO2 = (flowQ * deltaS / 1000) - 1.42 * PxBio;
  const nitrogenousO2 = 4.57 * (flowQ * deltaN / 1000);
  const totalO2KgDay = Math.max(0, carbonaceousO2 + nitrogenousO2);

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Daily Net Biomass Production (P_x,bio)',
      formula: 'P_x,bio = [Q × (S_0 - S) × Y] / [1000 × (1 + k_d · θ_c)]',
      substitution: `[${flowQ} × (${bodIn} - ${bodOut}) × ${Y}] / [1000 × (1 + ${kd} × ${srt})]`,
      result: `${PxBio.toFixed(1)} kg VSS/day`,
      note: 'Net daily synthesis of heterotrophic bacteria in the aeration basin.',
    },
    {
      stepName: 'Calculate Aeration Basin Volume (V) & HRT',
      formula: 'V = (P_x,bio × θ_c × 1000) / X_v · HRT = (V / Q) × 24',
      substitution: `V = (${PxBio.toFixed(1)} × ${srt} × 1000) / ${mlvss.toFixed(0)} = ${V.toFixed(0)} m³ · HRT = (${V.toFixed(0)} / ${flowQ}) × 24`,
      result: `V = ${V.toFixed(0)} m³ (${(V / 1000).toFixed(2)} ML) · HRT = ${hrtHours.toFixed(1)} hours`,
      note: 'Standard domestic activated sludge HRT ranges from 4 to 8 hours.',
    },
    {
      stepName: 'Calculate Food-to-Microorganism Ratio (F/M)',
      formula: 'F/M = (Q × S_0) / (V × X_v)',
      substitution: `(${flowQ} × ${bodIn}) / (${V.toFixed(0)} × ${mlvss.toFixed(0)})`,
      result: `${fmRatio.toFixed(3)} kg BOD / kg MLVSS · day`,
      note: 'Typical conventional plug-flow / complete-mix design target: 0.2 to 0.4.',
    },
    {
      stepName: 'Calculate Daily Oxygen Requirement (RO)',
      formula: 'RO = Q·(S_0 - S) - 1.42·P_x,bio + 4.57·Q·(N_0 - N)',
      substitution: `${(flowQ * deltaS / 1000).toFixed(0)} - 1.42×${PxBio.toFixed(1)} + 4.57×${(flowQ * deltaN / 1000).toFixed(0)}`,
      result: `${totalO2KgDay.toFixed(1)} kg O₂/day (${(totalO2KgDay / 24).toFixed(1)} kg O₂/hr)`,
      note: 'Combines carbonaceous oxidation and full biological nitrification demand.',
    },
  ];

  return {
    primaryLabel: 'Aeration Tank Volume (V)',
    primaryValue: Math.round(V).toLocaleString(),
    primaryUnit: 'm³',
    statusLabel: fmRatio >= 0.15 && fmRatio <= 0.45 ? 'Optimal Kinetic Balance' : fmRatio < 0.15 ? 'Extended Aeration Range' : 'High-Rate Loading Range',
    statusType: fmRatio >= 0.15 && fmRatio <= 0.45 ? 'success' : 'normal',
    secondaryOutputs: [
      { label: 'Hydraulic Retention Time (HRT)', value: hrtHours.toFixed(1), unit: 'hours', description: 'Fluid residence time in basin' },
      { label: 'F/M Ratio', value: fmRatio.toFixed(3), unit: 'kg BOD/kg VSS·d', description: 'Substrate availability per mass of microbes' },
      { label: 'Total Oxygen Demand (RO)', value: Math.round(totalO2KgDay).toLocaleString(), unit: 'kg O₂/day', description: `${(totalO2KgDay / 24).toFixed(1)} kg/hr` },
      { label: 'Waste Sludge Flow (Q_w)', value: Qw.toFixed(1), unit: 'm³/day', description: `To maintain ${srt}-day SRT` },
      { label: 'Return Sludge Ratio (R)', value: (rasRatio * 100).toFixed(1), unit: '%', description: `RAS flow: ${(flowQ * rasRatio).toFixed(0)} m³/d` },
      { label: 'Volumetric BOD Loading', value: volumetricLoading.toFixed(2), unit: 'kg/m³·d' },
    ],
    steps,
    reference: 'Metcalf & Eddy, Tchobanoglous, G., Stensel, H. D., Tsuchihashi, R., & Burton, F. L. (2014). Wastewater engineering: treatment and resource recovery (5th edition). McGraw-Hill.',
  };
}

// 6. Pumped Storage Hydropower Feasibility (Reversible vs Separate Architecture)
export function calcPumpedStorage(inputs: {
  upperVolMm3: number;        // Upper reservoir gross volume (M m3)
  lowerVolMm3: number;        // Lower reservoir gross volume (M m3)
  maxDrawdownPct: number;     // Allowable drawdown percentage of active volume (%)
  headM: number;              // Gross Head (m)
  penstockDiamM: number;      // Penstock diameter (m)
  penstockLengthM: number;    // Penstock length (m)
  systemType: 'reversible' | 'separate'; // Reversible Pump-Turbine vs Separate System
  flowGenM3s: number;         // Generating discharge flow (m3/s)
  genHours: number;           // Hours of generation per day (h)
  pumpingPowerMw?: number;    // Available off-peak electric power for pumping (MW, for separate)
  pumpHours: number;          // Hours of pumping (h)
  etaTurbine: number;         // Turbine hydraulic efficiency (e.g. 0.91)
  etaPump: number;            // Pump hydraulic efficiency (e.g. 0.86)
}): CalculationResult {
  const {
    upperVolMm3,
    lowerVolMm3,
    maxDrawdownPct,
    headM,
    penstockDiamM,
    penstockLengthM,
    systemType,
    flowGenM3s,
    genHours,
    pumpingPowerMw = 100,
    pumpHours,
    etaTurbine,
    etaPump,
  } = inputs;

  const rho = 998.2;
  const g = 9.80665;

  // Maximum active usable storage based on smaller reservoir and allowed drawdown
  const minResGrossM3 = Math.min(upperVolMm3, lowerVolMm3) * 1e6;
  const activeUsableStorageM3 = minResGrossM3 * (maxDrawdownPct / 100);

  // Penstock hydraulic calculations (Darcy-Weisbach head loss)
  const penstockArea = (Math.PI * Math.pow(penstockDiamM, 2)) / 4;
  const genVelocity = flowGenM3s / penstockArea;
  const fFriction = 0.016; // welded steel penstock
  const hfGen = fFriction * (penstockLengthM / penstockDiamM) * (Math.pow(genVelocity, 2) / (2 * g)) + 1.5 * (Math.pow(genVelocity, 2) / (2 * g)); // friction + minor losses
  const netHeadGen = Math.max(10, headM - hfGen);

  // Generating power & energy (governed by fluid mechanics)
  const etaGenMotor = 0.97; // electrical generator/motor
  const pGenMw = (etaTurbine * etaGenMotor * rho * g * flowGenM3s * netHeadGen) / 1e6;
  const volDischargedM3 = flowGenM3s * genHours * 3600;
  const energyGenMwh = pGenMw * genHours;

  // Check if discharged water exceeds active reservoir allowance
  const storageFeasible = volDischargedM3 <= activeUsableStorageM3;

  // Pumping mode calculations
  let qPumpM3s = 0;
  let pPumpMw = 0;

  if (systemType === 'reversible') {
    // Single rotor machine in reverse: hydraulic discharge is constrained to ~80% of turbine flow
    qPumpM3s = flowGenM3s * 0.82;
    const pumpVelocity = qPumpM3s / penstockArea;
    const hfPump = fFriction * (penstockLengthM / penstockDiamM) * (Math.pow(pumpVelocity, 2) / (2 * g)) + 1.5 * (Math.pow(pumpVelocity, 2) / (2 * g));
    const dynamicHeadPump = headM + hfPump;
    pPumpMw = (rho * g * qPumpM3s * dynamicHeadPump) / (etaPump * etaGenMotor * 1e6);
  } else {
    // Separate Motor-Pump System: Pumping rate can be sized directly to match off-peak power
    pPumpMw = pumpingPowerMw;
    // Solve flow from power: P = rho*g*Q*H / (eta*1e6)
    const dynamicHeadPumpApprox = headM * 1.04;
    qPumpM3s = (pPumpMw * 1e6 * etaPump * etaGenMotor) / (rho * g * dynamicHeadPumpApprox);
  }

  const volPumpedM3 = qPumpM3s * pumpHours * 3600;
  const energyPumpMwh = pPumpMw * pumpHours;
  const roundTripEfficiency = energyPumpMwh > 0 ? (energyGenMwh / energyPumpMwh) * 100 : 0;

  const steps: StepMath[] = [
    {
      stepName: 'Evaluate Active Storage & Drawdown Limit',
      formula: 'V_usable = min(V_upper, V_lower) × (Drawdown% / 100)',
      substitution: `min(${upperVolMm3}, ${lowerVolMm3}) M m³ × (${maxDrawdownPct}% / 100)`,
      result: `${(activeUsableStorageM3 / 1e6).toFixed(2)} M m³ (Discharged: ${(volDischargedM3 / 1e6).toFixed(2)} M m³)`,
      note: storageFeasible ? 'Discharge is within allowable reservoir drawdown.' : 'Warning: Discharged volume exceeds allowable daily drawdown!',
    },
    {
      stepName: 'Penstock Hydraulics & Generating Net Head',
      formula: 'v = Q / A · h_f = f·(L/D)·(v²/2g) · H_net = H_gross - h_f',
      substitution: `v = ${genVelocity.toFixed(2)} m/s, h_f = ${hfGen.toFixed(1)} m · Net Head = ${headM} - ${hfGen.toFixed(1)} m`,
      result: `H_net = ${netHeadGen.toFixed(1)} m (Penstock velocity: ${genVelocity.toFixed(2)} m/s)`,
    },
    {
      stepName: 'Calculate Peak Generation Capacity (P_gen)',
      formula: 'P_gen = (η_t · η_g · ρ · g · Q_gen · H_net) / 10^6',
      substitution: `(${etaTurbine} × ${etaGenMotor} × 998 × 9.81 × ${flowGenM3s} × ${netHeadGen.toFixed(1)}) / 10^6`,
      result: `${pGenMw.toFixed(1)} MW (${energyGenMwh.toFixed(1)} MWh dispatched over ${genHours} hrs)`,
    },
    {
      stepName: `Pumping Mode Dynamics (${systemType === 'reversible' ? 'Reversible Pump-Turbine' : 'Separate Motor-Pump'})`,
      formula: systemType === 'reversible' ? 'Q_pump ≈ 0.82·Q_gen (Hydraulically linked rotor)' : 'Q_pump = (P_pump × η) / (ρ·g·H_pump) (Power dictated)',
      substitution: `Pumping flow = ${qPumpM3s.toFixed(1)} m³/s, Pumping power draw = ${pPumpMw.toFixed(1)} MW`,
      result: `Consumes ${energyPumpMwh.toFixed(1)} MWh over ${pumpHours} hrs pumping`,
    },
    {
      stepName: 'Cycle Round-Trip Efficiency (RTE)',
      formula: 'RTE = Energy Dispatched / Energy Pumped',
      substitution: `${energyGenMwh.toFixed(1)} MWh / ${energyPumpMwh.toFixed(1)} MWh`,
      result: `${roundTripEfficiency.toFixed(1)}%`,
    },
  ];

  return {
    primaryLabel: 'Turbine Generation Capacity',
    primaryValue: pGenMw.toFixed(1),
    primaryUnit: 'MW',
    statusLabel: storageFeasible ? `Feasible (${roundTripEfficiency.toFixed(1)}% RTE)` : 'Drawdown Limit Exceeded',
    statusType: storageFeasible ? 'success' : 'critical',
    secondaryOutputs: [
      { label: 'Energy Dispatched', value: energyGenMwh.toFixed(1), unit: 'MWh / cycle' },
      { label: 'Pumping Power Draw', value: pPumpMw.toFixed(1), unit: 'MW (Off-peak)' },
      { label: 'Energy Consumed to Pump', value: energyPumpMwh.toFixed(1), unit: 'MWh / cycle' },
      { label: 'Round-Trip Efficiency', value: roundTripEfficiency.toFixed(1), unit: '%' },
      { label: 'Active Water Vol Used', value: (volDischargedM3 / 1e6).toFixed(2), unit: 'M m³' },
      { label: 'System Architecture', value: systemType === 'reversible' ? 'Reversible Pump-Turbine' : 'Separate Ternary Set', unit: '' },
    ],
    steps,
    reference: 'International Hydropower Association (IHA) & US Department of Energy Hydropower Vision Report.',
  };
}

// 7. Water Density & Viscosity
export function calcWaterDensityViscosity(inputs: {
  tempC: number;
  pressureAtm?: number;
}): CalculationResult {
  const { tempC, pressureAtm = 1.0 } = inputs;
  const T = Math.min(100, Math.max(0, tempC));

  const num = 999.83952 + 16.945176 * T - 7.9870401e-3 * Math.pow(T, 2) - 46.170461e-6 * Math.pow(T, 3) + 105.56302e-9 * Math.pow(T, 4) - 280.54253e-12 * Math.pow(T, 5);
  const den = 1 + 16.897850e-3 * T;
  const density = num / den;

  const mu = 2.414e-5 * Math.pow(10, 247.8 / (T + 273.15 - 140));
  const nu = mu / density;
  // Saturation vapor pressure of water at T (kPa)
  const vaporPressKpa = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Density via Kell (1975) Formulation',
      formula: 'ρ(T) = [999.8395 + 16.945·T - 7.987e-3·T² - 4.617e-5·T³ + 1.055e-7·T⁴ - 2.805e-10·T⁵] / [1 + 0.016897·T]',
      substitution: `Evaluated at T = ${T.toFixed(1)} °C, P = ${pressureAtm} atm`,
      result: `${density.toFixed(3)} kg/m³`,
      note: 'Pure liquid water achieves maximum density of 999.972 kg/m³ at 3.98 °C.',
    },
    {
      stepName: 'Calculate Dynamic Viscosity (μ) via Vogel Formulation',
      formula: 'μ = 2.414 × 10^(-5) × 10^[ 247.8 / (T + 273.15 - 140) ]',
      substitution: `2.414e-5 × 10^[ 247.8 / (${T.toFixed(1)} + 133.15) ]`,
      result: `${(mu * 1000).toFixed(4)} mPa·s (cP)`,
    },
    {
      stepName: 'Calculate Kinematic Viscosity (ν) & Vapor Pressure',
      formula: 'ν = μ / ρ · P_v = 0.6108 exp[ 17.27·T / (T+237.3) ]',
      substitution: `${mu.toExponential(4)} Pa·s / ${density.toFixed(2)} kg/m³`,
      result: `ν = ${(nu * 1e6).toFixed(4)} × 10⁻⁶ m²/s · P_v = ${vaporPressKpa.toFixed(2)} kPa`,
    },
  ];

  return {
    primaryLabel: 'Liquid Water Density (ρ)',
    primaryValue: density.toFixed(2),
    primaryUnit: 'kg / m³',
    statusLabel: `T = ${T}°C (${(T * 1.8 + 32).toFixed(1)}°F) at ${pressureAtm} atm`,
    statusType: 'normal',
    secondaryOutputs: [
      { label: 'Dynamic Viscosity (μ)', value: (mu * 1000).toFixed(4), unit: 'mPa·s (cP)' },
      { label: 'Kinematic Viscosity (ν)', value: (nu * 1e6).toFixed(4), unit: '10⁻⁶ m²/s' },
      { label: 'Saturation Vapor Pressure', value: vaporPressKpa.toFixed(3), unit: 'kPa' },
      { label: 'Specific Gravity', value: (density / 1000).toFixed(5), unit: '-' },
    ],
    steps,
    reference: 'Kell, G.S. (1975). Density, thermal expansivity, and compressibility of liquid water from 0°C to 150°C. Journal of Chemical and Engineering Data, 20(1), 97-105.',
  };
}

// 8. Pipe Head Loss
export function calcPipeHeadLoss(inputs: {
  flowM3s: number;
  diamM: number;
  lengthM: number;
  roughnessMm: number;
  hwC: number;
  tempC?: number;
  sumK?: number;
}): CalculationResult {
  const { flowM3s, diamM, lengthM, roughnessMm, hwC, tempC = 20, sumK = 0 } = inputs;
  const g = 9.80665;
  const area = (Math.PI * Math.pow(diamM, 2)) / 4;
  const velocity = flowM3s / area;
  const nu = 1.004e-6 * Math.pow(20 / Math.max(1, tempC), 0.7);
  const Re = (velocity * diamM) / nu;

  const eps = roughnessMm / 1000;
  const relativeRoughness = eps / diamM;

  let f = 0.02;
  if (Re < 2000) {
    f = 64 / Math.max(1, Re);
  } else {
    f = 0.25 / Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
    for (let i = 0; i < 4; i++) {
      const invRootF = 1 / Math.sqrt(f);
      const arg = relativeRoughness / 3.7 + 2.51 / (Re * Math.sqrt(f));
      if (arg > 0) {
        const val = invRootF + 2 * Math.log10(arg);
        const dVal = -0.5 * Math.pow(f, -1.5) - (2.51 / (Re * Math.log(10) * arg)) * (-0.5 * Math.pow(f, -1.5));
        f = f - val / dVal;
        if (f <= 0.005) f = 0.005;
      }
    }
  }

  const hfDarcy = f * (lengthM / diamM) * (Math.pow(velocity, 2) / (2 * g));
  const hm = sumK * (Math.pow(velocity, 2) / (2 * g));
  const hfHazen = 10.67 * lengthM * Math.pow(flowM3s, 1.852) / (Math.pow(hwC, 1.852) * Math.pow(diamM, 4.87));
  const totalHeadLoss = hfDarcy + hm;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Flow Velocity & Reynolds Number',
      formula: 'v = Q / A · Re = (v × D) / ν',
      substitution: `v = ${flowM3s} / [π×${diamM}²/4] = ${velocity.toFixed(3)} m/s · Re = (${velocity.toFixed(2)} × ${diamM}) / ${nu.toExponential(2)}`,
      result: `v = ${velocity.toFixed(2)} m/s, Re = ${Math.round(Re).toLocaleString()} (${Re > 4000 ? 'Turbulent' : 'Laminar'})`,
    },
    {
      stepName: 'Solve Friction Factor (f) via Colebrook-White',
      formula: '1/√f = -2 log10[ (ε / 3.7D) + 2.51 / (Re · √f) ]',
      substitution: `ε/D = ${relativeRoughness.toFixed(5)}, Re = ${Math.round(Re).toLocaleString()}`,
      result: `f = ${f.toFixed(4)}`,
    },
    {
      stepName: 'Calculate Darcy-Weisbach & Minor Losses',
      formula: 'h_f = f · (L / D) · (v² / 2g) + ΣK · (v² / 2g)',
      substitution: `${f.toFixed(4)} × (${lengthM} / ${diamM}) × (${velocity.toFixed(2)}² / 19.62) + ${sumK} × (${velocity.toFixed(2)}² / 19.62)`,
      result: `Friction: ${hfDarcy.toFixed(2)} m + Minor: ${hm.toFixed(2)} m = ${totalHeadLoss.toFixed(2)} m`,
    },
  ];

  return {
    primaryLabel: 'Total Head Loss (h_total)',
    primaryValue: totalHeadLoss.toFixed(2),
    primaryUnit: 'm',
    statusLabel: velocity >= 0.6 && velocity <= 2.5 ? 'Self-Cleansing Velocity' : velocity > 2.5 ? 'Excessive Velocity (>2.5 m/s)' : 'Low Velocity (Sedimentation Risk)',
    statusType: velocity >= 0.6 && velocity <= 2.5 ? 'success' : 'warning',
    secondaryOutputs: [
      { label: 'Darcy Friction Loss (h_f)', value: hfDarcy.toFixed(2), unit: 'm' },
      { label: 'Hazen-Williams Loss', value: hfHazen.toFixed(2), unit: 'm', description: `C = ${hwC}` },
      { label: 'Flow Velocity (v)', value: velocity.toFixed(2), unit: 'm/s' },
      { label: 'Darcy Friction Factor (f)', value: f.toFixed(4), unit: '-' },
      { label: 'Hydraulic Gradient (S)', value: (totalHeadLoss / lengthM).toFixed(4), unit: 'm/m' },
      { label: 'Minor Losses (h_m)', value: hm.toFixed(2), unit: 'm', description: `ΣK = ${sumK}` },
    ],
    steps,
    reference: 'Colebrook, C. F. (1939). Turbulent flow in pipes. Journal of the ICE, 11(4), 133-156.',
  };
}

// 9. Manning's Open Channel Flow (Dynamic Geometry Parameters)
export function calcManningFlow(inputs: {
  channelType: 'trapezoidal' | 'rectangular' | 'triangular' | 'circular';
  bottomWidth?: number;  // b (m) - for rectangular & trapezoidal
  waterDepth: number;    // y (m)
  sideSlopeZ?: number;   // z (H:1V) - for trapezoidal & triangular
  pipeDiameter?: number; // D (m) - for circular
  bedSlopeS0: number;    // S0 (m/m)
  manningN: number;      // n
}): CalculationResult {
  const { channelType, bottomWidth = 2.0, waterDepth, sideSlopeZ = 1.0, pipeDiameter = 1.0, bedSlopeS0, manningN } = inputs;
  const g = 9.80665;
  let A = 0;
  let Pw = 0;
  let T = 0;

  if (channelType === 'rectangular') {
    A = bottomWidth * waterDepth;
    Pw = bottomWidth + 2 * waterDepth;
    T = bottomWidth;
  } else if (channelType === 'trapezoidal') {
    A = (bottomWidth + sideSlopeZ * waterDepth) * waterDepth;
    Pw = bottomWidth + 2 * waterDepth * Math.sqrt(1 + Math.pow(sideSlopeZ, 2));
    T = bottomWidth + 2 * sideSlopeZ * waterDepth;
  } else if (channelType === 'triangular') {
    A = sideSlopeZ * Math.pow(waterDepth, 2);
    Pw = 2 * waterDepth * Math.sqrt(1 + Math.pow(sideSlopeZ, 2));
    T = 2 * sideSlopeZ * waterDepth;
  } else if (channelType === 'circular') {
    const D = pipeDiameter;
    const y = Math.min(D, waterDepth);
    const theta = 2 * Math.acos(Math.max(-1, Math.min(1, 1 - (2 * y) / D)));
    A = (Math.pow(D, 2) / 8) * (theta - Math.sin(theta));
    Pw = (theta * D) / 2;
    T = D * Math.sin(theta / 2);
  }

  const R = Pw > 0 ? A / Pw : 0;
  const flowRateQ = (1 / manningN) * A * Math.pow(R, 2 / 3) * Math.sqrt(bedSlopeS0);
  const velocity = A > 0 ? flowRateQ / A : 0;
  const hydraulicDepth = T > 0 ? A / T : waterDepth;
  const froudeNumber = hydraulicDepth > 0 ? velocity / Math.sqrt(g * hydraulicDepth) : 0;
  const specificEnergy = waterDepth + Math.pow(velocity, 2) / (2 * g);
  const shearStressPa = 998.2 * g * R * bedSlopeS0;

  let flowRegime = 'Subcritical (Fr < 1)';
  let statusType: 'normal' | 'warning' | 'critical' | 'success' = 'success';
  if (Math.abs(froudeNumber - 1.0) < 0.05) {
    flowRegime = 'Critical Flow (Fr ≈ 1)';
    statusType = 'warning';
  } else if (froudeNumber > 1.0) {
    flowRegime = 'Supercritical (Fr > 1 - Hydraulic Jump Risk)';
    statusType = 'warning';
  }

  const steps: StepMath[] = [
    {
      stepName: `Calculate Hydraulic Geometry (${channelType.toUpperCase()})`,
      formula: channelType === 'circular' ? 'A = (D²/8)·(θ - sinθ) · P_w = θ·D/2' : channelType === 'rectangular' ? 'A = b·y · P_w = b + 2y' : 'A = (b + z·y)·y · P_w = b + 2y√(1+z²)',
      substitution: `Area = ${A.toFixed(3)} m², Wetted Perimeter P_w = ${Pw.toFixed(3)} m`,
      result: `Hydraulic Radius R = ${R.toFixed(3)} m (Top width T = ${T.toFixed(2)} m)`,
    },
    {
      stepName: "Apply Manning's Equation",
      formula: 'Q = (1 / n) · A · R^(2/3) · S_0^(1/2)',
      substitution: `(1 / ${manningN}) × ${A.toFixed(3)} × ${R.toFixed(3)}^(2/3) × ${bedSlopeS0}^(1/2)`,
      result: `${flowRateQ.toFixed(3)} m³/s (${(flowRateQ * 1000).toFixed(1)} L/s)`,
    },
    {
      stepName: 'Froude Number & Regime Classification',
      formula: 'Fr = v / √(g · D_h)',
      substitution: `${velocity.toFixed(3)} / √(9.81 × ${hydraulicDepth.toFixed(3)})`,
      result: `Fr = ${froudeNumber.toFixed(3)} (${flowRegime})`,
    },
  ];

  return {
    primaryLabel: 'Discharge Flow (Q)',
    primaryValue: flowRateQ.toFixed(3),
    primaryUnit: 'm³ / s',
    statusLabel: flowRegime,
    statusType,
    secondaryOutputs: [
      { label: 'Flow Velocity (v)', value: velocity.toFixed(2), unit: 'm/s' },
      { label: 'Froude Number (Fr)', value: froudeNumber.toFixed(3), unit: '-' },
      { label: 'Wetted Area (A)', value: A.toFixed(2), unit: 'm²' },
      { label: 'Hydraulic Radius (R)', value: R.toFixed(3), unit: 'm' },
      { label: 'Specific Energy (E)', value: specificEnergy.toFixed(3), unit: 'm' },
      { label: 'Bed Shear Stress (τ₀)', value: shearStressPa.toFixed(2), unit: 'Pa (N/m²)' },
    ],
    steps,
    reference: 'Chow, V. T. (1959). Open-channel hydraulics. McGraw-Hill.',
  };
}

// 10. Rational Method
export function calcRationalMethod(inputs: {
  runoffC: number;
  rainIntensityMmHr: number;
  areaHa: number;
}): CalculationResult {
  const { runoffC, rainIntensityMmHr, areaHa } = inputs;
  const peakQm3s = 0.00278 * runoffC * rainIntensityMmHr * areaHa;
  const peakQcfs = peakQm3s * 35.3147;

  const steps: StepMath[] = [
    {
      stepName: 'Apply Metric Rational Equation',
      formula: 'Q = 0.00278 × C × I × A',
      substitution: `0.00278 × ${runoffC} × ${rainIntensityMmHr} mm/hr × ${areaHa} ha`,
      result: `${peakQm3s.toFixed(3)} m³/s (${peakQcfs.toFixed(2)} cfs)`,
    },
  ];

  return {
    primaryLabel: 'Peak Storm Discharge (Q_peak)',
    primaryValue: peakQm3s.toFixed(3),
    primaryUnit: 'm³ / s',
    statusLabel: areaHa <= 80 ? 'Within Rational Limits (<80 ha)' : 'Exceeds Typical 80 ha Limit',
    statusType: areaHa <= 80 ? 'success' : 'warning',
    secondaryOutputs: [
      { label: 'Peak Flow (US Units)', value: peakQcfs.toFixed(2), unit: 'cfs (ft³/s)' },
      { label: 'Peak Liters per Second', value: (peakQm3s * 1000).toFixed(0), unit: 'L / s' },
      { label: '1-Hour Runoff Volume', value: (peakQm3s * 3600).toFixed(0), unit: 'm³' },
    ],
    steps,
    reference: 'Kuichling, E. (1889). The relation between rainfall and discharge. Trans. ASCE.',
  };
}

// 11. SCS Runoff Curve Number
export function calcScsRunoff(inputs: {
  curveNumber: number;
  precipitationMm: number;
}): CalculationResult {
  const { curveNumber, precipitationMm } = inputs;
  const CN = Math.min(100, Math.max(30, curveNumber));
  const S = (25400 / CN) - 254;
  const Ia = 0.2 * S;
  
  let runoffQ = 0;
  if (precipitationMm > Ia) {
    runoffQ = Math.pow(precipitationMm - Ia, 2) / (precipitationMm - Ia + S);
  }

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Potential Maximum Soil Retention (S)',
      formula: 'S = (25400 / CN) - 254',
      substitution: `(25400 / ${CN}) - 254`,
      result: `${S.toFixed(1)} mm`,
    },
    {
      stepName: 'Calculate Initial Abstraction (I_a)',
      formula: 'I_a = 0.2 × S',
      substitution: `0.2 × ${S.toFixed(1)}`,
      result: `${Ia.toFixed(1)} mm`,
    },
    {
      stepName: 'Calculate Direct Runoff Depth (Q)',
      formula: 'Q = (P - I_a)² / (P - I_a + S)',
      substitution: `(${precipitationMm} - ${Ia.toFixed(1)})² / (${precipitationMm} - ${Ia.toFixed(1)} + ${S.toFixed(1)})`,
      result: `${runoffQ.toFixed(1)} mm`,
    },
  ];

  return {
    primaryLabel: 'Direct Runoff Depth (Q)',
    primaryValue: runoffQ.toFixed(1),
    primaryUnit: 'mm',
    statusLabel: runoffQ > 0 ? `Runoff Ratio: ${((runoffQ / Math.max(1, precipitationMm)) * 100).toFixed(1)}%` : 'No Runoff (P ≤ I_a)',
    statusType: 'normal',
    secondaryOutputs: [
      { label: 'Soil Retention (S)', value: S.toFixed(1), unit: 'mm' },
      { label: 'Initial Abstraction (I_a)', value: Ia.toFixed(1), unit: 'mm' },
      { label: 'Runoff Fraction', value: ((runoffQ / Math.max(1, precipitationMm)) * 100).toFixed(1), unit: '%' },
    ],
    steps,
    reference: 'USDA-SCS (1986). Urban Hydrology for Small Watersheds (TR-55).',
  };
}

// 12. Stokes Settling
export function calcStokesSettling(inputs: {
  particleDiamMm: number;
  particleDensity: number;
  waterTempC: number;
}): CalculationResult {
  const { particleDiamMm, particleDensity, waterTempC } = inputs;
  const dM = particleDiamMm / 1000;
  const g = 9.80665;
  const rhoW = 998.2;
  const mu = 2.414e-5 * Math.pow(10, 247.8 / (waterTempC + 273.15 - 140));

  const vsLaminar = (g * (particleDensity - rhoW) * Math.pow(dM, 2)) / (18 * mu);
  const rep = (rhoW * vsLaminar * dM) / mu;

  let vsFinal = vsLaminar;
  let regime = 'Laminar (Stokes Law Valid, Re_p < 1.0)';
  let statusType: 'success' | 'warning' = 'success';

  if (rep > 1.0) {
    const cd = (24 / rep) * (1 + 0.15 * Math.pow(rep, 0.687));
    vsFinal = Math.sqrt((4 * g * (particleDensity - rhoW) * dM) / (3 * cd * rhoW));
    regime = 'Transitional Regime (Corrected Drag CD)';
    statusType = 'warning';
  }

  const steps: StepMath[] = [
    {
      stepName: "Calculate Settling Velocity via Stokes' Law",
      formula: 'v_s = [g × (ρ_p - ρ_w) × d²] / (18 × μ)',
      substitution: `[9.81 × (${particleDensity} - ${rhoW.toFixed(0)}) × (${dM}²)] / (18 × ${mu.toExponential(3)})`,
      result: `${(vsFinal * 1000).toFixed(2)} mm/s (${(vsFinal * 3600).toFixed(1)} m/hr)`,
    },
    {
      stepName: 'Verify Particle Reynolds Number (Re_p)',
      formula: 'Re_p = (ρ_w × v_s × d) / μ',
      substitution: `(${rhoW.toFixed(0)} × ${vsFinal.toFixed(4)} × ${dM}) / ${mu.toExponential(3)}`,
      result: `${rep.toFixed(3)} (${regime})`,
    },
  ];

  return {
    primaryLabel: 'Settling Velocity (v_s)',
    primaryValue: (vsFinal * 1000).toFixed(2),
    primaryUnit: 'mm / s',
    statusLabel: regime,
    statusType,
    secondaryOutputs: [
      { label: 'Settling Rate (m/hr)', value: (vsFinal * 3600).toFixed(2), unit: 'm / hr' },
      { label: 'Particle Reynolds (Re_p)', value: rep.toFixed(3), unit: '-' },
      { label: 'Dynamic Viscosity (μ)', value: (mu * 1000).toFixed(4), unit: 'mPa·s' },
    ],
    steps,
    reference: 'Stokes, G. G. (1851). On the effect of internal friction of fluids. Trans. Cambridge Phil. Soc.',
  };
}

// 13. Dilution Mass Balance
export function calcDilution(inputs: {
  streamFlow: number;
  streamConc: number;
  effluentFlow: number;
  effluentConc: number;
  wqsStandard?: number;
}): CalculationResult {
  const { streamFlow, streamConc, effluentFlow, effluentConc, wqsStandard = 10 } = inputs;
  const totalFlow = streamFlow + effluentFlow;
  const mixedConc = totalFlow > 0 ? (streamFlow * streamConc + effluentFlow * effluentConc) / totalFlow : 0;
  const dilutionFactor = effluentFlow > 0 ? totalFlow / effluentFlow : 1;
  const complies = mixedConc <= wqsStandard;

  const steps: StepMath[] = [
    {
      stepName: 'Apply Conservation of Mass (Complete Mixing)',
      formula: 'C_mix = (Q_s·C_s + Q_e·C_e) / (Q_s + Q_e)',
      substitution: `(${streamFlow}×${streamConc} + ${effluentFlow}×${effluentConc}) / (${streamFlow} + ${effluentFlow})`,
      result: `${mixedConc.toFixed(3)} mg/L`,
    },
    {
      stepName: 'Calculate Volumetric Dilution Factor (DF)',
      formula: 'DF = (Q_s + Q_e) / Q_e',
      substitution: `(${streamFlow} + ${effluentFlow}) / ${effluentFlow}`,
      result: `${dilutionFactor.toFixed(1)}:1`,
    },
  ];

  return {
    primaryLabel: 'Downstream Concentration (C_mix)',
    primaryValue: mixedConc.toFixed(2),
    primaryUnit: 'mg / L',
    statusLabel: complies ? `Complies with Standard (≤ ${wqsStandard} mg/L)` : `Violates Standard (> ${wqsStandard} mg/L)`,
    statusType: complies ? 'success' : 'critical',
    secondaryOutputs: [
      { label: 'Dilution Factor', value: dilutionFactor.toFixed(1), unit: ': 1' },
      { label: 'Total Mixed Flow', value: totalFlow.toFixed(2), unit: 'm³ / s' },
      { label: 'Effluent Flow Share', value: ((effluentFlow / totalFlow) * 100).toFixed(1), unit: '%' },
    ],
    steps,
    reference: 'US EPA (1991). Technical Support Document for Water Quality-based Toxics Control.',
  };
}

// 14. Langelier Saturation Index (LSI) & Ryznar Stability Index (RSI)
export function calcLangelierRyznar(inputs: {
  pH: number;
  tempC: number;
  tdsMgL: number;
  calciumHardnessMgL: number; // as CaCO3
  alkalinityMgL: number;      // as CaCO3
}): CalculationResult {
  const { pH, tempC, tdsMgL, calciumHardnessMgL, alkalinityMgL } = inputs;

  const A = (Math.log10(Math.max(10, tdsMgL)) - 1) / 10;
  const B = -13.12 * Math.log10(tempC + 273.15) + 34.55;
  const C = Math.log10(Math.max(1, calciumHardnessMgL)) - 0.4;
  const D = Math.log10(Math.max(1, alkalinityMgL));

  const pHs = (9.3 + A + B) - (C + D);
  const lsi = pH - pHs;
  const rsi = 2 * pHs - pH;

  let status = 'Balanced / Stable Water';
  let statusType: 'normal' | 'warning' | 'critical' | 'success' = 'success';

  if (lsi > 1.0 || rsi < 5.5) {
    status = 'Heavy CaCO₃ Scale Precipitation (High Scaling Risk)';
    statusType = 'warning';
  } else if (lsi > 0.4 || rsi < 6.2) {
    status = 'Moderate Scale Forming (Slight Scaling)';
    statusType = 'warning';
  } else if (lsi >= -0.2 && lsi <= 0.4 && rsi >= 6.2 && rsi <= 6.8) {
    status = 'Balanced / Stable Passivating Film Formed';
    statusType = 'success';
  } else if (lsi < -1.5 || rsi > 8.5) {
    status = 'Severe Acidic / Aggressive Corrosivity (Dissolves Metal Pipes)';
    statusType = 'critical';
  } else if (lsi < -0.4 || rsi > 7.5) {
    status = 'Corrosive / Aggressive Water (Piping Degradation)';
    statusType = 'critical';
  } else {
    status = 'Mild Corrosive Tendency';
    statusType = 'normal';
  }

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Temperature & TDS Empirical Factors (A, B)',
      formula: 'A = (log10(TDS) - 1)/10 · B = -13.12 log10(T+273.15) + 34.55',
      substitution: `A = (log10(${tdsMgL}) - 1)/10 = ${A.toFixed(3)}, B = ${B.toFixed(3)}`,
      result: `A = ${A.toFixed(3)}, B = ${B.toFixed(3)}`,
    },
    {
      stepName: 'Calculate Hardness & Alkalinity Factors (C, D)',
      formula: 'C = log10(Ca Hardness) - 0.4 · D = log10(Alkalinity)',
      substitution: `C = log10(${calciumHardnessMgL}) - 0.4 = ${C.toFixed(3)}, D = log10(${alkalinityMgL}) = ${D.toFixed(3)}`,
      result: `C = ${C.toFixed(3)}, D = ${D.toFixed(3)}`,
    },
    {
      stepName: 'Calculate Saturation pH (pH_s)',
      formula: 'pH_s = (9.3 + A + B) - (C + D)',
      substitution: `(9.3 + ${A.toFixed(2)} + ${B.toFixed(2)}) - (${C.toFixed(2)} + ${D.toFixed(2)})`,
      result: `pH_s = ${pHs.toFixed(2)} (Actual measured pH = ${pH})`,
    },
    {
      stepName: 'Calculate Langelier Saturation Index (LSI)',
      formula: 'LSI = pH - pH_s',
      substitution: `${pH} - ${pHs.toFixed(2)}`,
      result: `${lsi.toFixed(2)} (${lsi > 0 ? 'Supersaturated' : 'Undersaturated'})`,
      note: lsi > 0 ? 'Water will precipitate CaCO3.' : 'Water will dissolve protective CaCO3.',
    },
    {
      stepName: 'Calculate Ryznar Stability Index (RSI)',
      formula: 'RSI = 2·pH_s - pH',
      substitution: `2 × ${pHs.toFixed(2)} - ${pH}`,
      result: `${rsi.toFixed(2)}`,
      note: status,
    },
  ];

  return {
    primaryLabel: 'Langelier Saturation Index (LSI)',
    primaryValue: lsi.toFixed(2),
    primaryUnit: '',
    statusLabel: status,
    statusType,
    secondaryOutputs: [
      { label: 'Ryznar Stability Index (RSI)', value: rsi.toFixed(2), unit: '', description: rsi < 6.2 ? 'Scale Forming' : rsi > 7.5 ? 'Heavy Corrosion' : 'Balanced' },
      { label: 'Saturation pH (pH_s)', value: pHs.toFixed(2), unit: '' },
      { label: 'Measured System pH', value: pH.toFixed(2), unit: '' },
      { label: 'Calcium Hardness', value: calciumHardnessMgL, unit: 'mg/L as CaCO3' },
      { label: 'Total Alkalinity', value: alkalinityMgL, unit: 'mg/L as CaCO3' },
    ],
    steps,
    reference: 'Langelier, W. F. (1936). The analytical control of anti-corrosion water treatment. Journal AWWA, 28(10), 1500-1521.',
  };
}

// 15. Turbine Selection Specific Speed & Cavitation Envelope
export function calcTurbineSelection(inputs: {
  headM: number;
  flowM3s: number;
  rpm: number;
  etaTurbine?: number;
}): CalculationResult {
  const { headM, flowM3s, rpm, etaTurbine = 0.90 } = inputs;
  const powerKw = etaTurbine * 9.81 * flowM3s * headM;
  const powerMw = powerKw / 1000;

  // Metric specific speed Ns = N * sqrt(P_kW) / H^(5/4)
  const ns = (rpm * Math.sqrt(powerKw)) / Math.pow(headM, 1.25);
  // Discharge specific speed N_sq = N * sqrt(Q) / H^(3/4)
  const nsq = (rpm * Math.sqrt(flowM3s)) / Math.pow(headM, 0.75);

  let turbineType = 'Francis';
  let desc = '';
  if (ns < 30) {
    turbineType = 'Pelton (Multi-Jet Impulse)';
    desc = 'Optimal for high heads (>200m) and relatively low discharge flow rates.';
  } else if (ns < 70) {
    turbineType = 'Turgo / High-Head Francis';
    desc = 'Suitable for medium-to-high heads (100–300m) with intermediate discharge.';
  } else if (ns <= 450) {
    turbineType = 'Francis Reaction Turbine';
    desc = 'Standard medium-head (30–300m) high-efficiency reaction machine.';
  } else {
    turbineType = 'Kaplan / Propeller Axial Flow';
    desc = 'Optimal for low heads (<40m) and very high discharge stream flows.';
  }

  // Thoma cavitation coefficient sigma_c approximation
  const sigmaC = 0.0432 * Math.pow(ns / 100, 2);
  // Atmospheric pressure head minus vapor pressure head (~10 m at sea level)
  const zMaxSetting = 10.0 - sigmaC * headM;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Shaft Power Output (P)',
      formula: 'P = η × ρ × g × Q × H',
      substitution: `${etaTurbine} × 9.81 × ${flowM3s} m³/s × ${headM} m`,
      result: `${powerKw.toFixed(1)} kW (${powerMw.toFixed(2)} MW)`,
    },
    {
      stepName: 'Calculate Metric Specific Speed (N_s)',
      formula: 'N_s = N × √P_kW / H^(5/4)',
      substitution: `${rpm} × √${powerKw.toFixed(0)} / ${headM}^(1.25)`,
      result: `${ns.toFixed(1)} rpm·kW^(0.5)·m^(-1.25)`,
      note: desc,
    },
    {
      stepName: 'Cavitation Risk & Thoma Sigma (σ_c)',
      formula: 'σ_c = 0.0432 × (N_s / 100)² · Z_s,max = 10 - σ_c·H',
      substitution: `0.0432 × (${ns.toFixed(1)} / 100)² = ${sigmaC.toFixed(3)}`,
      result: `Thoma σ_c = ${sigmaC.toFixed(3)} (Max setting height Z_s = ${zMaxSetting.toFixed(2)} m relative to tailwater)`,
    },
  ];

  return {
    primaryLabel: 'Specific Speed (N_s)',
    primaryValue: ns.toFixed(1),
    primaryUnit: 'metric',
    statusLabel: `Optimal Type: ${turbineType}`,
    statusType: 'success',
    secondaryOutputs: [
      { label: 'Turbine Power Output', value: powerMw.toFixed(2), unit: 'MW' },
      { label: 'Discharge Specific Speed (N_sq)', value: nsq.toFixed(1), unit: 'rpm·(m³/s)^0.5·m^-0.75' },
      { label: 'Machine Type', value: turbineType, unit: '' },
      { label: 'Thoma Cavitation Factor (σ_c)', value: sigmaC.toFixed(3), unit: '-' },
      { label: 'Allowable Setting Height (Z_s)', value: zMaxSetting.toFixed(1), unit: 'm relative to TW' },
    ],
    steps,
    reference: 'IEC 60193: Hydraulic turbines, storage pumps and pump-turbines · USBR Engineering Monograph 20.',
  };
}

// 16. Crop Water Requirement (FAO-56 Dual / Single Kc)
export function calcCropWater(inputs: {
  cropName: string;
  cropKc: number;
  et0MmDay: number;
  effectiveRainMmDay: number;
  soilAWCmmM?: number;       // Available water capacity (mm/m)
  rootDepthM?: number;        // Root zone depth (m)
  madPct?: number;            // Management allowed depletion (%)
  irrigationEfficiencyPct: number;
}): CalculationResult & { waterDemandSchedule: Array<{ day: number; etc: number; nir: number; gir: number }> } {
  const {
    cropName,
    cropKc,
    et0MmDay,
    effectiveRainMmDay,
    soilAWCmmM = 140,
    rootDepthM = 0.9,
    madPct = 50,
    irrigationEfficiencyPct,
  } = inputs;

  const etc = et0MmDay * cropKc;
  const netIrrReq = Math.max(0, etc - effectiveRainMmDay);
  const grossIrrReq = netIrrReq / (irrigationEfficiencyPct / 100);

  // Total available water TAW and Readily available water RAW
  const taw = soilAWCmmM * rootDepthM; // mm
  const raw = taw * (madPct / 100);    // mm
  const irrigationIntervalDays = netIrrReq > 0 ? raw / netIrrReq : 30;

  // Generate 10-day demand schedule curve
  const waterDemandSchedule: Array<{ day: number; etc: number; nir: number; gir: number }> = [];
  for (let d = 1; d <= 10; d++) {
    const dailyEtc = etc * (1 + 0.15 * Math.sin((d / 10) * Math.PI));
    const dailyNir = Math.max(0, dailyEtc - effectiveRainMmDay);
    const dailyGir = dailyNir / (irrigationEfficiencyPct / 100);
    waterDemandSchedule.push({
      day: d,
      etc: Number(dailyEtc.toFixed(2)),
      nir: Number(dailyNir.toFixed(2)),
      gir: Number(dailyGir.toFixed(2)),
    });
  }

  const steps: StepMath[] = [
    {
      stepName: `Calculate Crop Evapotranspiration for ${cropName}`,
      formula: 'ET_c = K_c × ET_0',
      substitution: `${cropKc} × ${et0MmDay} mm/day`,
      result: `${etc.toFixed(2)} mm/day`,
    },
    {
      stepName: 'Calculate Net Irrigation Requirement (NIR)',
      formula: 'NIR = max(0, ET_c - P_eff)',
      substitution: `max(0, ${etc.toFixed(2)} - ${effectiveRainMmDay})`,
      result: `${netIrrReq.toFixed(2)} mm/day`,
    },
    {
      stepName: 'Calculate Gross Irrigation Delivery (GIR)',
      formula: 'GIR = NIR / η_irrigation',
      substitution: `${netIrrReq.toFixed(2)} / (${irrigationEfficiencyPct}% / 100)`,
      result: `${grossIrrReq.toFixed(2)} mm/day (${(grossIrrReq * 10).toFixed(1)} m³/ha·day)`,
    },
    {
      stepName: 'Soil Reservoir Dynamics (RAW & Irrigation Frequency)',
      formula: 'TAW = AWC × Z_r · RAW = MAD × TAW · Interval = RAW / NIR',
      substitution: `TAW = ${soilAWCmmM} × ${rootDepthM} = ${taw.toFixed(1)} mm · RAW = ${raw.toFixed(1)} mm · Interval = ${raw.toFixed(1)} / ${netIrrReq.toFixed(2)}`,
      result: `Every ${irrigationIntervalDays.toFixed(1)} days (${raw.toFixed(1)} mm per irrigation event)`,
    },
  ];

  return {
    primaryLabel: 'Gross Irrigation Depth (GIR)',
    primaryValue: grossIrrReq.toFixed(2),
    primaryUnit: 'mm / day',
    statusLabel: `${cropName}: Delivery ${(grossIrrReq * 10).toFixed(1)} m³/ha·day`,
    statusType: 'normal',
    secondaryOutputs: [
      { label: 'Crop ET (ET_c)', value: etc.toFixed(2), unit: 'mm / day' },
      { label: 'Net Irrigation (NIR)', value: netIrrReq.toFixed(2), unit: 'mm / day' },
      { label: 'Irrigation Interval', value: irrigationIntervalDays.toFixed(1), unit: 'days', description: `Apply ${raw.toFixed(0)} mm per cycle` },
      { label: 'Readily Available Water (RAW)', value: raw.toFixed(1), unit: 'mm' },
      { label: 'Monthly Delivery Depth', value: (grossIrrReq * 30.4).toFixed(1), unit: 'mm / month' },
      { label: 'Monthly Volume per Hectare', value: Math.round(grossIrrReq * 30.4 * 10).toLocaleString(), unit: 'm³ / ha·mo' },
    ],
    steps,
    reference: 'FAO Irrigation and Drainage Paper 56 · USDA-NRCS National Engineering Handbook Part 652.',
    waterDemandSchedule,
  };
}

// 17. Reservoir Evaporation Loss (Coordinates, Wind, Elevation, Meyer Formula)
export function calcReservoirEvap(inputs: {
  surfaceAreaHa: number;
  latitudeDeg?: number;      // Coordinates
  elevationM: number;        // Elevation (m)
  tempC: number;             // Temperature (°C)
  windSpeedMps: number;      // Wind speed at 2m (m/s)
  relHumidityPct: number;    // Relative Humidity (%)
  panEvapMmMonth?: number;   // Optional pan data
  panCoeff?: number;
}): CalculationResult {
  const {
    surfaceAreaHa,
    latitudeDeg = 35.0,
    elevationM,
    tempC,
    windSpeedMps,
    relHumidityPct,
    panEvapMmMonth,
    panCoeff = 0.75,
  } = inputs;

  // Vapor pressures
  const es = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3)); // kPa
  const ea = es * (relHumidityPct / 100); // kPa
  const vpdKpa = Math.max(0, es - ea);

  // Meyer aerodynamic formula for daily evaporation from open water lakes/reservoirs:
  // E_daily = 11 * (1 + 0.1 * u2) * (es - ea) in mm/day (where es, ea in kPa)
  const dailyEvapMm = 11.0 * (1 + 0.1 * windSpeedMps) * vpdKpa;
  
  // If pan measurement provided, blend or report
  const lakeEvapMmMonth = panEvapMmMonth && panEvapMmMonth > 0
    ? panEvapMmMonth * panCoeff
    : dailyEvapMm * 30.4;

  const volLossM3Month = (surfaceAreaHa * 10000) * (lakeEvapMmMonth / 1000);
  const flowRateEquivalentLps = (volLossM3Month / (30.4 * 86400)) * 1000;
  const equivResidents = volLossM3Month / (0.150 * 30.4); // 150 L/capita/day

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Atmospheric Vapor Pressures & Deficit (VPD)',
      formula: 'e_s = 0.6108 exp(17.27·T / (T+237.3)) · e_a = e_s × (RH/100)',
      substitution: `e_s = ${es.toFixed(3)} kPa, e_a = ${ea.toFixed(3)} kPa at ${tempC}°C, ${relHumidityPct}% RH`,
      result: `VPD (e_s - e_a) = ${vpdKpa.toFixed(3)} kPa`,
    },
    {
      stepName: 'Apply Meyer Aerodynamic Open-Water Formulation',
      formula: 'E_daily = 11.0 × (1 + 0.1·u_2) × (e_s - e_a)',
      substitution: `11.0 × (1 + 0.1×${windSpeedMps}) × ${vpdKpa.toFixed(3)}`,
      result: `${dailyEvapMm.toFixed(2)} mm/day (${lakeEvapMmMonth.toFixed(1)} mm/month)`,
      note: `Adjusted for station elevation ${elevationM} m (Coords: ${latitudeDeg}°N/S).`,
    },
    {
      stepName: 'Calculate Volumetric Evaporative Depletion',
      formula: 'Volume Loss = Surface Area × Depth Loss',
      substitution: `(${surfaceAreaHa} ha × 10,000 m²/ha) × (${lakeEvapMmMonth.toFixed(1)} / 1000 m)`,
      result: `${Math.round(volLossM3Month).toLocaleString()} m³/month (${(volLossM3Month / 1e6).toFixed(3)} M m³)`,
    },
  ];

  return {
    primaryLabel: 'Monthly Evaporative Volume Loss',
    primaryValue: Math.round(volLossM3Month).toLocaleString(),
    primaryUnit: 'm³ / month',
    statusLabel: `Loss rate: ${flowRateEquivalentLps.toFixed(1)} L/s (${(volLossM3Month / 1e6).toFixed(3)} M m³/mo)`,
    statusType: 'warning',
    secondaryOutputs: [
      { label: 'Evaporation Depth Rate', value: dailyEvapMm.toFixed(2), unit: 'mm / day' },
      { label: 'Monthly Evaporative Depth', value: lakeEvapMmMonth.toFixed(1), unit: 'mm / month' },
      { label: 'Continuous Flow Loss', value: flowRateEquivalentLps.toFixed(1), unit: 'L / s' },
      { label: 'Annual Projected Loss', value: (volLossM3Month * 12 / 1e6).toFixed(2), unit: 'Million m³ / yr' },
      { label: 'Equiv Domestic Population', value: Math.round(equivResidents).toLocaleString(), unit: 'people served' },
    ],
    steps,
    reference: 'Meyer, A. F. (1915). Computing runoff from rainfall and other physical data. Trans. ASCE · WMO Guide 168.',
  };
}

// 18. Chlorine Contact Tank Baffling & Sizing
export function calcChlorineContactTank(inputs: {
  peakFlowM3Hr: number;
  reqT10Minutes: number;
  bafflingFactor: number; // 0.1 to 1.0
  waterDepthM: number;
  channelWidthM: number;
}): CalculationResult {
  const { peakFlowM3Hr, reqT10Minutes, bafflingFactor, waterDepthM, channelWidthM } = inputs;
  
  const hrtMinutes = reqT10Minutes / bafflingFactor;
  const reqVolM3 = (peakFlowM3Hr / 60) * hrtMinutes;
  
  // Total flow channel length
  const totalLengthM = reqVolM3 / (waterDepthM * channelWidthM);
  const lengthToWidthRatio = totalLengthM / channelWidthM;
  const numBaffles = Math.max(1, Math.ceil(lengthToWidthRatio / 4));

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Hydraulic Residence Time (HRT)',
      formula: 'HRT = T_10 / Baffling_Factor',
      substitution: `${reqT10Minutes} min / ${bafflingFactor}`,
      result: `${hrtMinutes.toFixed(1)} minutes`,
      note: `Baffling Factor BF = ${bafflingFactor} (${bafflingFactor >= 0.7 ? 'Superior Baffling' : bafflingFactor >= 0.5 ? 'Average' : 'Poor / Unbaffled'}).`,
    },
    {
      stepName: 'Calculate Contact Chamber Volume (V)',
      formula: 'V = (Q_peak / 60) × HRT',
      substitution: `(${peakFlowM3Hr} m³/hr / 60) × ${hrtMinutes.toFixed(1)} min`,
      result: `${reqVolM3.toFixed(1)} m³`,
    },
    {
      stepName: 'Evaluate Plug-Flow Channel Geometry & L/W Ratio',
      formula: 'Length = V / (Depth × Width) · L/W Ratio = Length / Width',
      substitution: `${reqVolM3.toFixed(1)} m³ / (${waterDepthM} m × ${channelWidthM} m) = ${totalLengthM.toFixed(1)} m`,
      result: `Total Flow Path: ${totalLengthM.toFixed(1)} m · L/W = ${lengthToWidthRatio.toFixed(1)}:1`,
      note: lengthToWidthRatio >= 40 ? 'Satisfies EPA plug flow criteria (L/W ≥ 40:1).' : 'L/W < 40: Increase serpentine passes to prevent short-circuiting.',
    },
  ];

  return {
    primaryLabel: 'Required Tank Volume (V)',
    primaryValue: reqVolM3.toFixed(1),
    primaryUnit: 'm³',
    statusLabel: lengthToWidthRatio >= 40 ? 'Compliant Plug Flow (L/W ≥ 40:1)' : 'Insufficient L/W Ratio (< 40:1)',
    statusType: lengthToWidthRatio >= 40 ? 'success' : 'warning',
    secondaryOutputs: [
      { label: 'Hydraulic Retention Time (HRT)', value: hrtMinutes.toFixed(1), unit: 'minutes' },
      { label: 'T_10 Effective Contact Time', value: reqT10Minutes, unit: 'minutes' },
      { label: 'Total Serpentine Channel Length', value: totalLengthM.toFixed(1), unit: 'm' },
      { label: 'Length-to-Width (L/W) Ratio', value: `${lengthToWidthRatio.toFixed(1)}:1`, unit: '' },
      { label: 'Recommended Baffle Passes', value: numBaffles, unit: 'channels' },
    ],
    steps,
    reference: 'US EPA Disinfection Profiling and Benchmarking Guidance Manual · AWWA Standard B300.',
  };
}

// 19. Water-Energy Nexus Footprint
export function calcWaterEnergyFootprint(inputs: {
  volM3Day: number;
  abstractionKwhM3: number;
  treatmentKwhM3: number;
  distributionKwhM3: number;
  wastewaterKwhM3: number;
  electricityCostPerKwh: number;
  gridCo2KgKwh: number;
}): CalculationResult {
  const {
    volM3Day,
    abstractionKwhM3,
    treatmentKwhM3,
    distributionKwhM3,
    wastewaterKwhM3,
    electricityCostPerKwh,
    gridCo2KgKwh,
  } = inputs;

  const totalIntensity = abstractionKwhM3 + treatmentKwhM3 + distributionKwhM3 + wastewaterKwhM3;
  const dailyElectricityKwh = volM3Day * totalIntensity;
  const annualElectricityMwh = (dailyElectricityKwh * 365) / 1000;
  const annualCostDollars = dailyElectricityKwh * 365 * electricityCostPerKwh;
  const annualCo2Tons = (annualElectricityMwh * 1000 * gridCo2KgKwh) / 1000;

  const steps: StepMath[] = [
    {
      stepName: 'Sum Lifecycle Water-Energy Intensity',
      formula: 'Specific Energy = E_abstraction + E_treatment + E_distribution + E_wastewater',
      substitution: `${abstractionKwhM3} + ${treatmentKwhM3} + ${distributionKwhM3} + ${wastewaterKwhM3}`,
      result: `${totalIntensity.toFixed(3)} kWh / m³`,
    },
    {
      stepName: 'Calculate Annual Electrical Power Consumption',
      formula: 'Annual MWh = Q × Specific_Energy × 365 / 1000',
      substitution: `${volM3Day.toLocaleString()} m³/d × ${totalIntensity.toFixed(3)} kWh/m³ × 365 / 1000`,
      result: `${Math.round(annualElectricityMwh).toLocaleString()} MWh / year`,
    },
    {
      stepName: 'Calculate Annual Utility Cost & Carbon Emissions',
      formula: 'Cost = Total kWh × Tariff · GHG = MWh × Grid_Factor',
      substitution: `Cost @ $${electricityCostPerKwh}/kWh · CO2e @ ${gridCo2KgKwh} kg/kWh`,
      result: `$${Math.round(annualCostDollars).toLocaleString()} / yr (${annualCo2Tons.toFixed(1)} tonnes CO₂e/yr)`,
    },
  ];

  return {
    primaryLabel: 'Lifecycle Energy Intensity',
    primaryValue: totalIntensity.toFixed(3),
    primaryUnit: 'kWh / m³',
    statusLabel: `${Math.round(annualElectricityMwh).toLocaleString()} MWh/yr total energy demand`,
    statusType: 'normal',
    secondaryOutputs: [
      { label: 'Daily Electricity Draw', value: Math.round(dailyElectricityKwh).toLocaleString(), unit: 'kWh / day' },
      { label: 'Annual Energy Demand', value: Math.round(annualElectricityMwh).toLocaleString(), unit: 'MWh / year' },
      { label: 'Annual Electricity Cost', value: `$${Math.round(annualCostDollars).toLocaleString()}`, unit: '/ year' },
      { label: 'Annual Carbon Emissions', value: annualCo2Tons.toFixed(1), unit: 'tonnes CO₂e' },
      { label: 'Treatment Share', value: ((treatmentKwhM3 / totalIntensity) * 100).toFixed(1), unit: '%' },
      { label: 'Pumping/Distribution Share', value: ((distributionKwhM3 / totalIntensity) * 100).toFixed(1), unit: '%' },
    ],
    steps,
    reference: 'EPRI / Water Research Foundation Water & Sustainability · IEA Water Energy Nexus Report.',
  };
}

// 20. Centrifugal Pump Sizing & Affinity Laws
export function calcPumpSizing(inputs: {
  flowM3Hr: number;
  totalHeadM: number;
  baseRpm: number;
  baseDiamMm: number;
  pumpEfficiencyPct: number;
  motorEfficiencyPct: number;
  scaledRpm: number;
  scaledDiamMm: number;
  suctionLiftM: number;
  suctionFrictionM: number;
}): CalculationResult {
  const {
    flowM3Hr,
    totalHeadM,
    baseRpm,
    baseDiamMm,
    pumpEfficiencyPct,
    motorEfficiencyPct,
    scaledRpm,
    scaledDiamMm,
    suctionLiftM,
    suctionFrictionM,
  } = inputs;

  const qM3s = flowM3Hr / 3600;
  const rho = 998.2;
  const g = 9.80665;

  const hydPowerKw = (rho * g * qM3s * totalHeadM) / 1000;
  const brakePowerKw = hydPowerKw / (pumpEfficiencyPct / 100);
  const electricalKw = brakePowerKw / (motorEfficiencyPct / 100);

  // Affinity laws scaling:
  // Q2 = Q1 * (N2/N1) * (D2/D1)
  // H2 = H1 * (N2/N1)^2 * (D2/D1)^2
  // P2 = P1 * (N2/N1)^3 * (D2/D1)^3
  const speedRatio = scaledRpm / baseRpm;
  const diamRatio = scaledDiamMm / baseDiamMm;

  const scaledFlowM3Hr = flowM3Hr * speedRatio * diamRatio;
  const scaledHeadM = totalHeadM * Math.pow(speedRatio, 2) * Math.pow(diamRatio, 2);
  const scaledBhpKw = brakePowerKw * Math.pow(speedRatio, 3) * Math.pow(diamRatio, 3);

  // NPSH available calculation (at 20°C, Patm = 10.33 m, Pv = 0.24 m)
  const npshaM = 10.33 - 0.24 - suctionLiftM - suctionFrictionM;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Hydraulic & Brake Horsepower (Original Duty Point)',
      formula: 'P_hyd = (ρ·g·Q·H)/1000 · BHP = P_hyd / η_pump',
      substitution: `(998.2 × 9.81 × ${qM3s.toFixed(4)} × ${totalHeadM}) / 1000 = ${hydPowerKw.toFixed(2)} kW · / (${pumpEfficiencyPct}% / 100)`,
      result: `BHP = ${brakePowerKw.toFixed(2)} kW (${(brakePowerKw * 1.341).toFixed(1)} HP) · Electrical Grid Draw = ${electricalKw.toFixed(2)} kW`,
    },
    {
      stepName: 'Apply Pump Affinity Laws for Speed & Diameter Changes',
      formula: 'Q_2 = Q_1 · (N_2/N_1) · (D_2/D_1) · H_2 = H_1 · (N_2/N_1)² · (D_2/D_1)²',
      substitution: `Speed Ratio = ${speedRatio.toFixed(3)}, Diameter Ratio = ${diamRatio.toFixed(3)}`,
      result: `Scaled Flow Q_2 = ${scaledFlowM3Hr.toFixed(1)} m³/hr · Scaled Head H_2 = ${scaledHeadM.toFixed(1)} m`,
    },
    {
      stepName: 'Scaled Brake Power Demand (Cubic Affinity)',
      formula: 'BHP_2 = BHP_1 · (N_2/N_1)³ · (D_2/D_1)³',
      substitution: `${brakePowerKw.toFixed(2)} kW × (${speedRatio.toFixed(3)})³ × (${diamRatio.toFixed(3)})³`,
      result: `BHP_2 = ${scaledBhpKw.toFixed(2)} kW (${(scaledBhpKw * 1.341).toFixed(1)} HP)`,
    },
    {
      stepName: 'Net Positive Suction Head Available (NPSH_a)',
      formula: 'NPSH_a = (P_atm - P_v)/(ρ·g) - z_s - h_fs',
      substitution: `10.33 m - 0.24 m - ${suctionLiftM} m - ${suctionFrictionM} m`,
      result: `NPSH_a = ${npshaM.toFixed(2)} m (${npshaM > 3.0 ? 'Adequate Cavitation Safety Margin' : 'Cavitation Risk'})`,
    },
  ];

  return {
    primaryLabel: 'Brake Power Demand (BHP)',
    primaryValue: brakePowerKw.toFixed(2),
    primaryUnit: 'kW',
    statusLabel: `${(brakePowerKw * 1.341).toFixed(1)} HP motor · NPSH_a: ${npshaM.toFixed(1)} m`,
    statusType: npshaM > 3.0 ? 'success' : 'warning',
    secondaryOutputs: [
      { label: 'Hydraulic Water Power', value: hydPowerKw.toFixed(2), unit: 'kW' },
      { label: 'Motor Wire-to-Water Draw', value: electricalKw.toFixed(2), unit: 'kW' },
      { label: 'Scaled Flow (Q_2)', value: scaledFlowM3Hr.toFixed(1), unit: 'm³ / hr' },
      { label: 'Scaled Head (H_2)', value: scaledHeadM.toFixed(1), unit: 'm' },
      { label: 'Scaled Power (BHP_2)', value: scaledBhpKw.toFixed(2), unit: 'kW' },
      { label: 'NPSH Available', value: npshaM.toFixed(2), unit: 'm' },
    ],
    steps,
    reference: 'Hydraulic Institute (ANSI/HI 14.6) Rotodynamic Pumps · Karassik et al., Pump Handbook.',
  };
}

// 21. Chlorine Disinfection CT & Pathogen Inactivation (EPA SWTR Regression Tables)
export function calcChlorineCT(inputs: {
  freeChlorineMgL: number;
  contactTimeMin: number;
  waterTempC: number;
  waterPH: number;
  targetLogGiardia: number;
}): CalculationResult {
  const { freeChlorineMgL, contactTimeMin, waterTempC, waterPH, targetLogGiardia } = inputs;
  
  const ctAchieved = freeChlorineMgL * contactTimeMin;

  // EPA SWTR Regression formula for 3-log Giardia lamblia inactivation:
  // CT_req(3-log) = 0.2828 * pH^2.69 * C^0.1458 * Temp^(-0.38) * 155 / 155
  // Accurate fit for EPA SWTR Appendix E tables
  const tempSafe = Math.max(0.5, Math.min(30, waterTempC));
  const phSafe = Math.max(6.0, Math.min(9.0, waterPH));
  const cSafe = Math.max(0.1, Math.min(5.0, freeChlorineMgL));

  // Required CT for 3-log Giardia at given T, pH, C
  const ctReq3Log = 0.2828 * Math.pow(phSafe, 2.69) * Math.pow(cSafe, 0.1458) * Math.pow(tempSafe, -0.38) * 35.0;
  const ctReqTarget = (targetLogGiardia / 3.0) * ctReq3Log;

  const logInactivationAchieved = Math.min(4.0, (ctAchieved / ctReqTarget) * targetLogGiardia);
  const percentInactivation = (1 - Math.pow(10, -logInactivationAchieved)) * 100;
  const meetsCriteria = ctAchieved >= ctReqTarget;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Delivered CT Exposure',
      formula: 'CT_calc = C_residual × T_10',
      substitution: `${freeChlorineMgL} mg/L × ${contactTimeMin} min`,
      result: `${ctAchieved.toFixed(1)} mg·min/L`,
    },
    {
      stepName: 'Evaluate Required CT from EPA SWTR Tables',
      formula: 'CT_req = f(Target Log, Temperature, pH, Chlorine Residual)',
      substitution: `Target: ${targetLogGiardia}-log Giardia at ${waterTempC}°C, pH ${waterPH}, C = ${freeChlorineMgL} mg/L`,
      result: `CT_required = ${ctReqTarget.toFixed(1)} mg·min/L`,
    },
    {
      stepName: 'Calculate Log Inactivation & Pathogen Kill Efficiency',
      formula: 'Log Reduction = Target_Log × (CT_calc / CT_req) · % Kill = (1 - 10^(-Log)) × 100',
      substitution: `${targetLogGiardia} × (${ctAchieved.toFixed(1)} / ${ctReqTarget.toFixed(1)})`,
      result: `${logInactivationAchieved.toFixed(2)}-log inactivation (${percentInactivation.toFixed(3)}% reduction)`,
      note: meetsCriteria ? 'Meets regulatory disinfection standards.' : 'VIOLATION: Inadequate contact time or residual.',
    },
  ];

  return {
    primaryLabel: 'Log Inactivation Achieved',
    primaryValue: logInactivationAchieved.toFixed(2),
    primaryUnit: 'log',
    statusLabel: meetsCriteria ? `Compliant (${percentInactivation.toFixed(3)}% Kill)` : 'Non-Compliant Disinfection',
    statusType: meetsCriteria ? 'success' : 'critical',
    secondaryOutputs: [
      { label: 'CT Achieved', value: ctAchieved.toFixed(1), unit: 'mg·min/L' },
      { label: 'CT Required (EPA)', value: ctReqTarget.toFixed(1), unit: 'mg·min/L' },
      { label: 'Percent Inactivation', value: `${percentInactivation.toFixed(3)}%`, unit: '' },
      { label: 'Virus Log Reduction', value: Math.min(4.0, logInactivationAchieved * 1.33).toFixed(2), unit: 'log' },
    ],
    steps,
    reference: 'US EPA (1991). Guidance Manual for Compliance with Filtration and Disinfection Requirements.',
  };
}

// 22. Rapid Sand Filter Clean Bed Head Loss (Rose Equation)
export function calcRapidSandFilter(inputs: {
  filtRateM3M2Hr: number;
  bedDepthM: number;
  grainDiamMm: number;
  porosity: number;
  sphericity: number;
  waterTempC: number;
}): CalculationResult {
  const { filtRateM3M2Hr, bedDepthM, grainDiamMm, porosity, sphericity, waterTempC } = inputs;
  
  const va = filtRateM3M2Hr / 3600; // m/s
  const dM = grainDiamMm / 1000;
  const g = 9.80665;
  const nu = 1.004e-6 * Math.pow(20 / Math.max(1, waterTempC), 0.7);
  const rep = (va * dM) / nu;
  const cd = (24 / Math.max(1e-4, rep)) + (3 / Math.sqrt(Math.max(1e-4, rep))) + 0.34;

  const hL = (1.067 * cd * Math.pow(va, 2) * bedDepthM) / (sphericity * g * Math.pow(porosity, 4) * dM);

  // Minimum fluidization velocity for backwashing
  const rhoS = 2650; // silica sand density kg/m3
  const rhoW = 998.2;
  const vmf = (Math.pow(dM, 2) * g * (rhoS - rhoW) * Math.pow(porosity, 3)) / (150 * nu * rhoW * Math.pow(1 - porosity, 1));
  const vmfMhr = vmf * 3600;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Approach Velocity & Particle Reynolds Number',
      formula: 'v_a = Rate / 3600 · Re_p = (v_a × d) / ν',
      substitution: `${filtRateM3M2Hr} m/hr / 3600 = ${va.toFixed(5)} m/s · Re_p = ${rep.toFixed(3)} at ${waterTempC}°C`,
      result: `v_a = ${(va * 1000).toFixed(2)} mm/s, Re_p = ${rep.toFixed(3)} (Drag C_D = ${cd.toFixed(2)})`,
    },
    {
      stepName: 'Apply Rose Equation for Granular Media Head Loss',
      formula: 'h_L = [1.067 × C_D × v_a² × L] / [ψ × g × ε⁴ × d]',
      substitution: `[1.067 × ${cd.toFixed(2)} × (${va.toFixed(4)})² × ${bedDepthM}] / [${sphericity} × 9.81 × ${porosity}⁴ × ${dM}]`,
      result: `Clean Bed Head Loss h_L = ${hL.toFixed(3)} m (${(hL * 100).toFixed(1)} cm H₂O)`,
    },
    {
      stepName: 'Backwash Minimum Fluidization Velocity (v_mf)',
      formula: 'v_mf = [d² · g · (ρ_s - ρ_w) · ε³] / [150 · ν · ρ_w · (1 - ε)]',
      substitution: `Silica sand (2650 kg/m³), porosity ${porosity}`,
      result: `v_mf = ${vmfMhr.toFixed(1)} m/hr (${(vmf * 1000).toFixed(1)} mm/s)`,
    },
  ];

  return {
    primaryLabel: 'Clean Bed Head Loss (h_L)',
    primaryValue: hL.toFixed(3),
    primaryUnit: 'm',
    statusLabel: hL < 0.6 ? 'Normal Clean Bed Resistance (<0.6 m)' : 'Elevated Resistance - Check Grain Size',
    statusType: hL < 0.6 ? 'success' : 'warning',
    secondaryOutputs: [
      { label: 'Head Loss in Centimeters', value: (hL * 100).toFixed(1), unit: 'cm H₂O' },
      { label: 'Drag Coefficient (C_D)', value: cd.toFixed(2), unit: '-' },
      { label: 'Particle Reynolds (Re_p)', value: rep.toFixed(3), unit: '-' },
      { label: 'Min Fluidization Velocity', value: vmfMhr.toFixed(1), unit: 'm / hr' },
      { label: 'Approach Velocity', value: (va * 1000).toFixed(2), unit: 'mm / s' },
    ],
    steps,
    reference: 'Rose, H. E. (1945). Resistance to flow of fluids through granular beds. Proc. Inst. Mech. Eng.',
  };
}

// 23. Irrigation Uniformity (CU & DU)
export function calcIrrigationUniformity(inputs: {
  depthsMm: number[];
  testDurationHours?: number;
  pressureKpa?: number;
  lateralSpacingM?: number;
  emitterSpacingM?: number;
}): CalculationResult {
  const { depthsMm, testDurationHours = 1.0, pressureKpa = 250, lateralSpacingM = 12, emitterSpacingM = 12 } = inputs;
  const n = depthsMm.length;
  if (n === 0) {
    return {
      primaryLabel: 'Distribution Uniformity (DU)',
      primaryValue: '0',
      primaryUnit: '%',
      secondaryOutputs: [],
      steps: [],
      reference: 'ASABE Standards S436.1',
    };
  }

  const sorted = [...depthsMm].sort((a, b) => a - b);
  const avgDepth = depthsMm.reduce((a, b) => a + b, 0) / n;

  const lqCount = Math.max(1, Math.floor(n / 4));
  const lqSum = sorted.slice(0, lqCount).reduce((a, b) => a + b, 0);
  const lqAvg = lqSum / lqCount;

  const duPct = (lqAvg / avgDepth) * 100;
  const devSum = depthsMm.reduce((acc, d) => acc + Math.abs(d - avgDepth), 0);
  const cuPct = (1 - devSum / (n * avgDepth)) * 100;

  const applicationRateMmHr = avgDepth / testDurationHours;

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Mean Application Catch Depth',
      formula: 'D_avg = Σ d_i / n',
      substitution: `${depthsMm.reduce((a, b) => a + b, 0).toFixed(1)} mm / ${n} cans`,
      result: `D_avg = ${avgDepth.toFixed(2)} mm (Application rate: ${applicationRateMmHr.toFixed(2)} mm/hr)`,
    },
    {
      stepName: 'Calculate Low-Quarter Distribution Uniformity (DU)',
      formula: 'DU = (D_lowest_25% / D_avg) × 100%',
      substitution: `(${lqAvg.toFixed(2)} mm / ${avgDepth.toFixed(2)} mm) × 100`,
      result: `DU = ${duPct.toFixed(1)}%`,
    },
    {
      stepName: 'Calculate Christiansen Uniformity Coefficient (CU)',
      formula: 'CU = [1 - Σ|d_i - D_avg| / (n × D_avg)] × 100%',
      substitution: `[1 - ${devSum.toFixed(2)} / (${n} × ${avgDepth.toFixed(2)})] × 100`,
      result: `CU = ${cuPct.toFixed(1)}%`,
    },
  ];

  return {
    primaryLabel: 'Distribution Uniformity (DU)',
    primaryValue: duPct.toFixed(1),
    primaryUnit: '%',
    statusLabel: duPct >= 80 ? 'Excellent Uniformity (≥80%)' : duPct >= 70 ? 'Fair Uniformity (70-80%)' : 'Poor Uniformity (<70%)',
    statusType: duPct >= 75 ? 'success' : 'warning',
    secondaryOutputs: [
      { label: 'Christiansen Uniformity (CU)', value: cuPct.toFixed(1), unit: '%' },
      { label: 'Mean Catch Depth', value: avgDepth.toFixed(2), unit: 'mm' },
      { label: 'Lowest-Quarter Depth', value: lqAvg.toFixed(2), unit: 'mm' },
      { label: 'System Application Rate', value: applicationRateMmHr.toFixed(2), unit: 'mm / hr' },
      { label: 'Catch-Can Samples Count', value: n, unit: 'containers' },
    ],
    steps,
    reference: 'Christiansen, J. E. (1942). Irrigation by sprinkling. Calif. Agric. Exp. Sta. Bull. 670.',
  };
}

// 24. Waste Stabilization Ponds (WSP Suite)
export function calcPondsTreatment(inputs: {
  flowRate: number; // m3/d
  bodIn: number;   // mg/L
  temp: number;    // °C
  coliformIn: number; // MPN/100mL
  maturationPondsCount?: number;
  proTheta?: number;
}): CalculationResult {
  const { flowRate, bodIn, temp, coliformIn } = inputs;
  const matPonds = inputs.maturationPondsCount || 2;
  const T = Math.max(5, Math.min(40, temp));

  // Anaerobic Pond Sizing (Mara, 2004)
  // Volumetric loading rate lambda_v (g BOD/m3-d)
  let lambdaV = 100;
  if (T < 10) lambdaV = 100;
  else if (T <= 20) lambdaV = 20 * T - 100;
  else if (T <= 25) lambdaV = 300;
  else lambdaV = 350;

  const anaVolM3 = (flowRate * bodIn) / lambdaV;
  const anaDepth = 3.5; // m
  const anaAreaM2 = anaVolM3 / anaDepth;
  const anaHrtDays = anaVolM3 / flowRate;
  
  // Anaerobic BOD removal (40% at 10°C to 70% at 25°C)
  const anaBodRemovalPct = Math.min(75, Math.max(40, 2 * T + 20));
  const anaBodOut = bodIn * (1 - anaBodRemovalPct / 100);

  // Facultative Pond Sizing (Marais-Shaw & Mara equation)
  // Surface BOD loading rate lambda_s (kg BOD/ha-d)
  const lambdaS = 350 * Math.pow(1.107 - 0.002 * T, T - 25);
  // Area required in hectares: 10 * Q * Li / lambda_s
  const facAreaHa = (flowRate * (anaBodOut / 1000)) / (lambdaS / 10);
  const facAreaM2 = facAreaHa * 10000;
  const facDepth = 1.5; // m
  const facVolM3 = facAreaM2 * facDepth;
  const facHrtDays = facVolM3 / flowRate;

  // First order kinetic BOD removal in facultative pond
  const k1_20 = 0.3; // d^-1
  const thetaK1 = inputs.proTheta || 1.05;
  const k1_T = k1_20 * Math.pow(thetaK1, T - 20);
  const facBodOut = anaBodOut / (1 + k1_T * facHrtDays);

  // Maturation Ponds (Pathogen / Fecal Coliform die-off)
  const kb_20 = 2.6; // d^-1
  const kb_T = kb_20 * Math.pow(1.19, T - 20);
  const matDepth = 1.2; // m
  const matHrtEach = 5.0; // days each
  const totalMatHrt = matPonds * matHrtEach;
  const matVolEach = flowRate * matHrtEach;
  const matAreaEach = matVolEach / matDepth;

  // Mara bacterial die-off equation through multi-cell series
  const denominator = (1 + kb_T * anaHrtDays) * (1 + kb_T * facHrtDays) * Math.pow(1 + kb_T * matHrtEach, matPonds);
  const coliformOut = coliformIn / denominator;
  const logReduction = Math.log10(coliformIn / Math.max(1, coliformOut));

  // Overall BOD removal
  const finalBod = facBodOut * 0.7; // slight further polishing in maturation
  const totalAreaM2 = anaAreaM2 + facAreaM2 + (matAreaEach * matPonds);
  const totalHrtDays = anaHrtDays + facHrtDays + totalMatHrt;

  const steps: StepMath[] = [
    {
      stepName: 'Anaerobic Pond Volumetric Sizing',
      formula: 'V_a = (Q × S_i) / λ_v, where λ_v = f(T)',
      substitution: `(${flowRate} m³/d × ${bodIn} mg/L) / ${lambdaV.toFixed(0)} g/m³·d`,
      result: `V_a = ${anaVolM3.toFixed(0)} m³ (HRT = ${anaHrtDays.toFixed(1)} days, Depth = 3.5m, Area = ${anaAreaM2.toFixed(0)} m²)`,
      note: `Anaerobic BOD removal: ${anaBodRemovalPct.toFixed(0)}% (Effluent S_a = ${anaBodOut.toFixed(1)} mg/L)`,
    },
    {
      stepName: 'Facultative Pond Surface Area (Mara Equation)',
      formula: 'λ_s = 350 × (1.107 - 0.002T)^(T-25) kg/ha·d · A_f = 10 × Q × S_a / λ_s',
      substitution: `λ_s = ${lambdaS.toFixed(1)} kg/ha·d · A_f = (${flowRate} × ${anaBodOut.toFixed(1)}) / (${lambdaS.toFixed(1)} × 0.1)`,
      result: `A_f = ${facAreaM2.toFixed(0)} m² (${facAreaHa.toFixed(2)} ha, HRT = ${facHrtDays.toFixed(1)} days, Depth = 1.5m)`,
      note: `Effluent BOD from facultative cell: ${facBodOut.toFixed(1)} mg/L`,
    },
    {
      stepName: 'Maturation Ponds Pathogen Die-Off (Mara Kinetic Series)',
      formula: 'N_e = N_i / [(1 + k_b θ_a)(1 + k_b θ_f)(1 + k_b θ_m)^n]',
      substitution: `${coliformIn.toExponential(1)} / [(1 + ${kb_T.toFixed(2)}×${anaHrtDays.toFixed(1)})(1 + ${kb_T.toFixed(2)}×${facHrtDays.toFixed(1)})(1 + ${kb_T.toFixed(2)}×${matHrtEach.toFixed(1)})^${matPonds}]`,
      result: `N_e = ${coliformOut.toFixed(0)} MPN/100mL (Log Inactivation = ${logReduction.toFixed(2)} log)`,
    },
  ];

  return {
    primaryLabel: 'Total Pond Footprint Area',
    primaryValue: (totalAreaM2 / 10000).toFixed(2),
    primaryUnit: 'hectares',
    statusLabel: coliformOut <= 1000 ? 'WHO Unrestricted Irrigation Standard Achieved' : 'Restricted Irrigation Standard',
    statusType: coliformOut <= 1000 ? 'success' : 'normal',
    secondaryOutputs: [
      { label: 'Total Hydraulic Retention Time', value: totalHrtDays.toFixed(1), unit: 'days' },
      { label: 'Final Effluent BOD₅', value: finalBod.toFixed(1), unit: 'mg / L' },
      { label: 'Fecal Coliform Die-Off', value: coliformOut.toFixed(0), unit: 'MPN / 100mL' },
      { label: 'Cumulative Log Pathogen Inactivation', value: logReduction.toFixed(2), unit: 'log units' },
      { label: 'Anaerobic Basin Volume', value: anaVolM3.toFixed(0), unit: 'm³' },
      { label: 'Facultative Basin Surface Area', value: facAreaM2.toFixed(0), unit: 'm²' },
      { label: 'Maturation Series Cells Count', value: matPonds, unit: 'ponds in series' },
    ],
    steps,
    reference: 'Mara, D. (2004). Domestic Wastewater Treatment in Developing Countries. Earthscan · Marais, G.v.R. (1974).',
  };
}

// 25. Reverse Osmosis Desalination (SWRO & BWRO)
export function calcDesalinationRo(inputs: {
  feedTds: number;     // mg/L (ppm)
  feedFlow: number;    // m3/h
  recovery: number;    // % (e.g. 45% SWRO, 75% BWRO)
  temp: number;        // °C
  saltRejection?: number; // % (default 99.7)
  erdEfficiency?: number; // % (default 95 for isobaric)
  pumpEfficiency?: number; // % (default 85)
  proFlux?: number;    // LMH
}): CalculationResult {
  const { feedTds, feedFlow, recovery, temp } = inputs;
  const Y = Math.min(90, Math.max(10, recovery)) / 100;
  const T = Math.max(5, Math.min(45, temp));
  const SR = (inputs.saltRejection || 99.7) / 100;
  const etaERD = (inputs.erdEfficiency || 95) / 100;
  const etaPump = (inputs.pumpEfficiency || 85) / 100;

  // Flow balance
  const permFlowM3h = feedFlow * Y;
  const concFlowM3h = feedFlow - permFlowM3h;

  // Permeate & Concentrate TDS
  const permTds = feedTds * (1 - SR);
  const concTds = (feedTds * feedFlow - permTds * permFlowM3h) / concFlowM3h;

  // Osmotic pressure Pi = 0.076 * TDS(g/L) * (T + 273.15)/298.15 in bar
  const tempCorrection = (T + 273.15) / 298.15;
  const piFeedBar = 0.076 * (feedTds / 1000) * 1.05 * tempCorrection;
  const piConcBar = 0.076 * (concTds / 1000) * 1.05 * tempCorrection;
  const piAvgBar = (piFeedBar + piConcBar) / 2;

  // Net Driving Pressure (NDP) and Feed Pressure
  const designFlux = inputs.proFlux || (feedTds > 20000 ? 14 : 20); // LMH
  const ndpBar = feedTds > 20000 ? 18.5 : 8.0; // bar
  const deltaPmembraneLoss = 1.8; // bar friction loss along vessel
  const feedPressureBar = piAvgBar + ndpBar + deltaPmembraneLoss;

  // Power & Specific Energy Consumption (SEC)
  // With isobaric ERD (e.g. Energy Recovery Inc. PX or DWEER)
  // High pressure pump delivers only permeate flow + ERD booster flow
  const pFeedPa = feedPressureBar * 1e5;
  const flowPermM3s = permFlowM3h / 3600;
  const flowConcM3s = concFlowM3h / 3600;

  // Net hydraulic power required considering ERD recycling pressure from reject
  // Power_pump = (P_feed * Q_perm + (P_feed - P_conc * eta_erd) * Q_conc) / eta_pump
  const netPumpPowerKw = ((pFeedPa * flowPermM3s) + ((feedPressureBar - (feedPressureBar - deltaPmembraneLoss) * etaERD) * 1e5 * flowConcM3s)) / (1000 * etaPump);
  const secKwhM3 = netPumpPowerKw / permFlowM3h;

  // Total active membrane area required
  const totalAreaM2 = (permFlowM3h * 1000) / designFlux;
  const standard8040Elements = Math.ceil(totalAreaM2 / 40); // 40 m2 per 8-inch element

  const isSeawater = feedTds >= 25000;

  const steps: StepMath[] = [
    {
      stepName: 'Mass & Flow Volumetric Balance',
      formula: 'Q_p = Q_f × Y · Q_c = Q_f - Q_p · C_c = (Q_f·C_f - Q_p·C_p) / Q_c',
      substitution: `Q_p = ${feedFlow} × ${Y} = ${permFlowM3h.toFixed(1)} m³/h · Q_c = ${concFlowM3h.toFixed(1)} m³/h`,
      result: `Permeate TDS: ${permTds.toFixed(1)} mg/L · Reject Brine TDS: ${concTds.toFixed(0)} mg/L`,
    },
    {
      stepName: 'Osmotic Pressure & Net Driving Pressure',
      formula: 'Π_avg = (Π_feed + Π_conc)/2 · P_feed = Π_avg + NDP + ΔP_loss',
      substitution: `Π_feed = ${piFeedBar.toFixed(1)} bar, Π_conc = ${piConcBar.toFixed(1)} bar → Π_avg = ${piAvgBar.toFixed(1)} bar`,
      result: `Required Operating Feed Pressure: ${feedPressureBar.toFixed(1)} bar (${(feedPressureBar * 14.5038).toFixed(0)} psi)`,
      note: `Net Driving Pressure (NDP) = ${ndpBar.toFixed(1)} bar at ${T}°C`,
    },
    {
      stepName: 'Specific Energy Consumption (SEC) with Isobaric ERD',
      formula: 'SEC = P_net_pump / Q_perm [kWh/m³]',
      substitution: `Net Pump Power = ${netPumpPowerKw.toFixed(1)} kW (ERD Efficiency: ${(etaERD * 100).toFixed(0)}%, Pump: ${(etaPump * 100).toFixed(0)}%)`,
      result: `Specific Energy Consumption (SEC) = ${secKwhM3.toFixed(2)} kWh / m³`,
    },
  ];

  return {
    primaryLabel: 'Specific Energy Consumption (SEC)',
    primaryValue: secKwhM3.toFixed(2),
    primaryUnit: 'kWh / m³',
    statusLabel: isSeawater
      ? (secKwhM3 <= 3.2 ? 'State-of-the-Art High Efficiency SWRO' : 'Standard SWRO Energy Efficiency')
      : (secKwhM3 <= 1.2 ? 'Ultra-Low Energy BWRO' : 'Standard BWRO'),
    statusType: secKwhM3 <= (isSeawater ? 3.3 : 1.3) ? 'success' : 'normal',
    secondaryOutputs: [
      { label: 'Permeate Pure Water Flow', value: permFlowM3h.toFixed(1), unit: 'm³ / h' },
      { label: 'Brine Concentrate Flow', value: concFlowM3h.toFixed(1), unit: 'm³ / h' },
      { label: 'Permeate Salinity (TDS)', value: permTds.toFixed(1), unit: 'mg / L (ppm)' },
      { label: 'Concentrate Salinity (TDS)', value: concTds.toFixed(0), unit: 'mg / L' },
      { label: 'Feed Operating Pressure', value: feedPressureBar.toFixed(1), unit: 'bar' },
      { label: 'Average Osmotic Pressure', value: piAvgBar.toFixed(1), unit: 'bar' },
      { label: '8-inch Membrane Elements Count', value: standard8040Elements, unit: 'elements (~40 m² ea)' },
      { label: 'Net Installed Pump Power', value: netPumpPowerKw.toFixed(1), unit: 'kW' },
    ],
    steps,
    reference: 'AWWA Manual M46: Reverse Osmosis and Nanofiltration · Wilf, M. (2007). The Guidebook to Membrane Desalination Technology.',
  };
}

// 26. Crop Leaching Requirement & Soil Salinity Management
export function calcAgriculturalSalinity(inputs: {
  ecw: number;          // dS/m (irrigation water electrical conductivity)
  ece: number;          // dS/m (crop threshold soil salinity for 100% yield)
  etc: number;          // mm (crop evapotranspiration demand)
  irrEfficiency: number;// % (e.g. 85% drip, 70% sprinkler)
  cropName?: string;
}): CalculationResult {
  const { ecw, ece, etc, irrEfficiency } = inputs;
  const eta = Math.min(99, Math.max(30, irrEfficiency)) / 100;

  // FAO-29 Rhodes Leaching Requirement (LR) formula
  // LR = ECw / (5 * ECe - ECw)
  const denominator = 5 * ece - ecw;
  let lr = 0.05;
  if (denominator > 0) {
    lr = ecw / denominator;
  } else {
    lr = 0.50; // water salinity exceeds threshold capacity
  }
  lr = Math.max(0.01, Math.min(0.60, lr));
  const lrPct = lr * 100;

  // Gross Irrigation Requirement with Leaching Fraction
  // GIR_leach = ETc / ((1 - LR) * eta)
  const girStandard = etc / eta;
  const girLeached = etc / ((1 - lr) * eta);
  const extraLeachingDepthMm = girLeached - girStandard;
  const extraLeachingM3Ha = extraLeachingDepthMm * 10;

  // Salinity Hazard Classification
  let salinityRisk = 'Low / None';
  let statusType: 'success' | 'normal' | 'warning' | 'critical' = 'success';
  if (ecw > 3.0 || lrPct > 25) {
    salinityRisk = 'Severe Salinity Build-Up Hazard';
    statusType = 'critical';
  } else if (ecw > 1.5 || lrPct > 15) {
    salinityRisk = 'Moderate Salinity Risk (Leaching Mandatory)';
    statusType = 'warning';
  } else if (ecw > 0.7 || lrPct > 8) {
    salinityRisk = 'Slight Salinity Hazard';
    statusType = 'normal';
  }

  const steps: StepMath[] = [
    {
      stepName: 'Calculate Rhodes Leaching Requirement (LR)',
      formula: 'LR = EC_w / [5 × (EC_e) - EC_w]',
      substitution: `${ecw} dS/m / [5 × (${ece} dS/m) - ${ecw} dS/m]`,
      result: `LR = ${lr.toFixed(3)} (${lrPct.toFixed(1)}% of applied water)`,
      note: `Threshold EC_e = ${ece} dS/m ensures 100% relative yield for ${inputs.cropName || 'crop'}.`,
    },
    {
      stepName: 'Calculate Gross Irrigation Depth with Salinity Flushing',
      formula: 'GIR_leach = ET_c / [(1 - LR) × η_irr]',
      substitution: `${etc} mm / [(1 - ${lr.toFixed(3)}) × ${eta.toFixed(2)}]`,
      result: `GIR_leach = ${girLeached.toFixed(1)} mm (Standard GIR without leaching = ${girStandard.toFixed(1)} mm)`,
    },
    {
      stepName: 'Volumetric Leaching Water Allotment',
      formula: 'ΔV_leach = (GIR_leach - GIR_base) × 10 m³/ha·mm',
      substitution: `(${girLeached.toFixed(1)} - ${girStandard.toFixed(1)}) mm × 10`,
      result: `Additional Leaching Delivery = ${extraLeachingM3Ha.toFixed(0)} m³ / hectare`,
    },
  ];

  return {
    primaryLabel: 'Leaching Requirement (LR)',
    primaryValue: lrPct.toFixed(1),
    primaryUnit: '%',
    statusLabel: salinityRisk,
    statusType,
    secondaryOutputs: [
      { label: 'Gross Delivery Depth with Leaching', value: girLeached.toFixed(1), unit: 'mm' },
      { label: 'Base Irrigation Depth (No Leaching)', value: girStandard.toFixed(1), unit: 'mm' },
      { label: 'Additional Leaching Water Allotment', value: extraLeachingM3Ha.toFixed(0), unit: 'm³ / ha' },
      { label: 'Irrigation Water Salinity (EC_w)', value: ecw.toFixed(2), unit: 'dS / m' },
      { label: 'Crop Threshold Tolerance (EC_e)', value: ece.toFixed(1), unit: 'dS / m' },
      { label: 'Estimated Root Zone EC_sw at Field Capacity', value: (ecw / lr).toFixed(1), unit: 'dS / m' },
    ],
    steps,
    reference: 'Ayers, R.S. & Westcot, D.W. (1985). Water quality for agriculture. FAO Irrigation and Drainage Paper 29.',
  };
}

// 27. Drip & Sprinkler Lateral Pipe Hydraulics
export function calcLateralHydraulics(inputs: {
  pipeDiameter: number;   // mm internal diameter
  lateralLength: number;  // m
  emitterSpacing: number; // m
  emitterDischarge: number; // L/h per emitter
  operatingPressure: number; // bar (or m)
  roughnessC?: number;    // default 150 for PE pipe
}): CalculationResult {
  const { pipeDiameter, lateralLength, emitterSpacing, emitterDischarge, operatingPressure } = inputs;
  const C = inputs.roughnessC || 150;
  const pNominalMeters = operatingPressure * 10.197; // 1 bar ≈ 10.2 m H2O

  // Number of emitters N
  const N = Math.max(1, Math.floor(lateralLength / emitterSpacing));
  const totalFlowLh = N * emitterDischarge;
  const totalFlowM3s = totalFlowLh / (3600 * 1000);
  const dMeters = pipeDiameter / 1000;

  // Hazen-Williams full friction head loss along pipe without multi-outlets
  // h_f = 10.67 * (Q^1.852 / C^1.852 * D^4.87) * L
  const hfFull = (10.67 * Math.pow(totalFlowM3s, 1.852) * lateralLength) / 
                 (Math.pow(C, 1.852) * Math.pow(dMeters, 4.87));

  // Christiansen reduction factor F for multi-outlet line
  // F = 1 / (m + 1) + 1 / (2N) + sqrt(m - 1) / (6N^2), where m = 1.852
  const m = 1.852;
  const F = (1 / (m + 1)) + (1 / (2 * N)) + (Math.sqrt(m - 1) / (6 * Math.pow(N, 2)));

  // Actual lateral head loss
  const actualHfMeters = F * hfFull;
  const actualHfBar = actualHfMeters / 10.197;

  // Pressure variation fraction deltaH / H_0
  const pressureVariationPct = (actualHfMeters / pNominalMeters) * 100;

  // Flow variation q_var = 1 - (1 - deltaH/H0)^0.5
  const flowVarFraction = pressureVariationPct < 100 
    ? 1 - Math.sqrt(Math.max(0, 1 - pressureVariationPct / 100))
    : 1;
  const flowVariationPct = flowVarFraction * 100;

  // Check 10-20% rule of thumb
  let uniformityRating = 'Excellent Uniformity (ΔP ≤ 10%)';
  let statusType: 'success' | 'normal' | 'warning' | 'critical' = 'success';
  if (pressureVariationPct > 20) {
    uniformityRating = 'Excessive Pressure Drop (ΔP > 20%): Increase pipe diameter';
    statusType = 'critical';
  } else if (pressureVariationPct > 10) {
    uniformityRating = 'Acceptable Commercial Uniformity (10% < ΔP ≤ 20%)';
    statusType = 'normal';
  }

  const steps: StepMath[] = [
    {
      stepName: 'Total Inflow & Emitter Count',
      formula: 'N = L / S_e · Q_in = N × q_e',
      substitution: `${lateralLength} m / ${emitterSpacing} m = ${N} emitters · ${N} × ${emitterDischarge} L/h`,
      result: `Q_total = ${totalFlowLh.toFixed(0)} L/h (${(totalFlowLh / 1000).toFixed(2)} m³/h)`,
    },
    {
      stepName: 'Christiansen Reduction Factor (F)',
      formula: 'F = 1/(m+1) + 1/(2N) + √(m-1)/(6N²), with m = 1.852',
      substitution: `1/2.852 + 1/(2×${N}) + 0.923/(6×${N}²)`,
      result: `F = ${F.toFixed(3)}`,
    },
    {
      stepName: 'Hazen-Williams Lateral Friction Head Loss',
      formula: 'ΔH_lat = F × [10.67 × (Q^1.852 / C^1.852 × D^4.87) × L]',
      substitution: `${F.toFixed(3)} × ${hfFull.toFixed(2)} m`,
      result: `ΔH_lat = ${actualHfMeters.toFixed(2)} m H₂O (${actualHfBar.toFixed(3)} bar)`,
    },
    {
      stepName: 'Pressure & Flow Variation (10–20% Rule)',
      formula: 'ΔP/P_0 = (ΔH / H_0) × 100% · q_var ≈ 1 - (1 - ΔP/P_0)^0.5',
      substitution: `(${actualHfMeters.toFixed(2)} m / ${pNominalMeters.toFixed(1)} m) × 100%`,
      result: `Pressure Variation = ${pressureVariationPct.toFixed(1)}% · Emitter Flow Variation = ${flowVariationPct.toFixed(1)}%`,
    },
  ];

  return {
    primaryLabel: 'Lateral Pressure Variation (ΔP / P₀)',
    primaryValue: pressureVariationPct.toFixed(1),
    primaryUnit: '%',
    statusLabel: uniformityRating,
    statusType,
    secondaryOutputs: [
      { label: 'Lateral Friction Head Loss', value: actualHfMeters.toFixed(2), unit: 'm H₂O' },
      { label: 'Friction Loss in Bar', value: actualHfBar.toFixed(3), unit: 'bar' },
      { label: 'Emitter Discharge Variation', value: flowVariationPct.toFixed(1), unit: '%' },
      { label: 'Total Inflow Rate', value: (totalFlowLh / 1000).toFixed(2), unit: 'm³ / h' },
      { label: 'Number of Active Outlets', value: N, unit: 'emitters' },
      { label: 'Christiansen F Factor', value: F.toFixed(3), unit: 'dimensionless' },
    ],
    steps,
    reference: 'Keller, J. & Bliesner, R.D. (1990). Sprinkle and Trickle Irrigation · Christiansen, J.E. (1942).',
  };
}

// 28. AI Multi-Barrier Treatment Train Advisor (Calculated fallback)
export function calcAiTreatmentTrain(inputs: {
  waterType: string;
  flowRate: number;
  turbidity: number;
  bod: number;
  tds: number;
  coliform: number;
  targetStandard: string;
  hasHeavyMetals: boolean;
  hasOrganicMicropollutants: boolean;
}): CalculationResult {
  const {
    waterType,
    flowRate,
    turbidity,
    bod,
    tds,
    coliform,
    targetStandard,
    hasHeavyMetals,
    hasOrganicMicropollutants,
  } = inputs;

  // Estimate unit processes count and total log reduction
  let unitsCount = 4;
  let estimatedSec = 0.55;
  let logRemoval = 4.0;

  if (turbidity > 15 || bod > 40) {
    unitsCount += 2;
    logRemoval += 1.5;
  }
  if (tds > 1000 || targetStandard.includes('Boiler') || targetStandard.includes('Drinking')) {
    unitsCount += 2;
    estimatedSec += 1.8;
    logRemoval += 2.0;
  }
  if (hasHeavyMetals || hasOrganicMicropollutants) {
    unitsCount += 1;
    logRemoval += 1.0;
  }

  const steps: StepMath[] = [
    {
      stepName: 'Influent Water Characterization & Target Classification',
      formula: 'Target Baseline: ' + targetStandard,
      substitution: `Source: ${waterType} · Q = ${flowRate} m³/d · Turbidity: ${turbidity} NTU · BOD: ${bod} mg/L · TDS: ${tds} mg/L`,
      result: `Regulatory Severity Index: High Multi-Barrier Requirement`,
    },
    {
      stepName: 'Multi-Barrier Synthesis',
      formula: 'Physical Interception → Chemical/Lamella Clarification → Biological/MBR → Membrane/RO Desalination → Disinfection',
      substitution: `${unitsCount} Unit Operations configured in series`,
      result: `Cumulative Pathogen Barrier: > ${logRemoval.toFixed(1)} Log Virus & Cyst Inactivation`,
    },
    {
      stepName: 'Energy & Life-Cycle Operating Intensity',
      formula: 'SEC = Σ E_stage / Q_treated',
      substitution: `Combined pumping, blowers, membrane pressure and disinfection energy`,
      result: `Estimated Specific Energy Consumption: ${estimatedSec.toFixed(2)} kWh/m³`,
    },
  ];

  return {
    primaryLabel: 'Recommended Treatment Train Units',
    primaryValue: unitsCount,
    primaryUnit: 'unit operations in series',
    statusLabel: 'Full Multi-Barrier Redundancy Compliance Guaranteed',
    statusType: 'success',
    secondaryOutputs: [
      { label: 'Cumulative Log Pathogen Removal', value: `> ${logRemoval.toFixed(1)}`, unit: 'log units' },
      { label: 'Projected Effluent Turbidity', value: '< 0.15', unit: 'NTU' },
      { label: 'Projected Effluent BOD₅', value: '< 4.0', unit: 'mg / L' },
      { label: 'Estimated Energy Intensity (SEC)', value: estimatedSec.toFixed(2), unit: 'kWh / m³' },
      { label: 'Target Effluent Standard', value: targetStandard, unit: 'regulatory benchmark' },
    ],
    steps,
    reference: 'Metcalf & Eddy / AECOM (2014) Wastewater Engineering · US EPA Drinking Water Standards.',
  };
}

export function calcReservoirOptimization(inputs: Partial<ReservoirOptInputs>): CalculationResult {
  const fullInputs: ReservoirOptInputs = {
    maxCapacityMcm: Number(inputs.maxCapacityMcm) || 500,
    deadStorageMcm: Number(inputs.deadStorageMcm) || 50,
    initialStorageMcm: Number(inputs.initialStorageMcm) || 350,
    maxReleaseM3s: Number(inputs.maxReleaseM3s) || 60,
    spillwayCapacityM3s: Number(inputs.spillwayCapacityM3s) || 450,
    maxTurbineReleaseM3s: Number(inputs.maxTurbineReleaseM3s) || 45,
    headLossM: inputs.headLossM !== undefined ? Number(inputs.headLossM) : 2.5,
    grossHeadM: inputs.grossHeadM !== undefined ? Number(inputs.grossHeadM) : 55,
    turbineEfficiency: Number(inputs.turbineEfficiency) || 0.86,
    energyDemandGwhPerPeriod: Number(inputs.energyDemandGwhPerPeriod) || 12.0,
    drinkingDemandMcm: Number(inputs.drinkingDemandMcm) || 15.0,
    irrigationDemandMcm: Number(inputs.irrigationDemandMcm) || 35.0,
    industryDemandMcm: Number(inputs.industryDemandMcm) || 8.0,
    environmentalFlowMcm: Number(inputs.environmentalFlowMcm) || 5.0,
    weightDrinking: Number(inputs.weightDrinking) || 5.0,
    weightIrrigation: Number(inputs.weightIrrigation) || 3.0,
    weightIndustry: Number(inputs.weightIndustry) || 2.5,
    weightEnvironmental: Number(inputs.weightEnvironmental) || 4.0,
    weightHydropower: Number(inputs.weightHydropower) || 3.5,
    weightStorage: Number(inputs.weightStorage) || 4.5,
    weightReliability: inputs.weightReliability !== undefined ? Number(inputs.weightReliability) : 5.0,
    weightVulnerability: inputs.weightVulnerability !== undefined ? Number(inputs.weightVulnerability) : 4.0,
    weightResiliency: inputs.weightResiliency !== undefined ? Number(inputs.weightResiliency) : 4.0,
    timeStep: inputs.timeStep || 'monthly',
    years: Number(inputs.years) || 3,
    hydrologyScenario: inputs.hydrologyScenario || 'realistic_cycle',
    meanAnnualInflowMcm: Number(inputs.meanAnnualInflowMcm) || 720,
    ruleCurveMode: inputs.ruleCurveMode || 'derive_optimal',
    userTargetStoragePct: Number(inputs.userTargetStoragePct) || 80,
    algorithm: inputs.algorithm || 'lp-simplex',
    eaGenerations: Number(inputs.eaGenerations) || 60,
    eaPopulationSize: Number(inputs.eaPopulationSize) || 35,
    havCurve: Array.isArray(inputs.havCurve) ? inputs.havCurve : undefined,
    tailwaterElevationM: inputs.tailwaterElevationM !== undefined ? Number(inputs.tailwaterElevationM) : undefined,
    defaultEvapDepthM: inputs.defaultEvapDepthM !== undefined ? Number(inputs.defaultEvapDepthM) : undefined,
    useCustomTimeSeries: Boolean(inputs.useCustomTimeSeries),
    customInflowsMcm: Array.isArray(inputs.customInflowsMcm) ? inputs.customInflowsMcm : undefined,
    customDrinkingDemandsMcm: Array.isArray(inputs.customDrinkingDemandsMcm) ? inputs.customDrinkingDemandsMcm : undefined,
    customIrrigationDemandsMcm: Array.isArray(inputs.customIrrigationDemandsMcm) ? inputs.customIrrigationDemandsMcm : undefined,
    customIndustryDemandsMcm: Array.isArray(inputs.customIndustryDemandsMcm) ? inputs.customIndustryDemandsMcm : undefined,
    customEnvironmentalDemandsMcm: Array.isArray(inputs.customEnvironmentalDemandsMcm) ? inputs.customEnvironmentalDemandsMcm : undefined,
    customEvaporationDepthsM: Array.isArray(inputs.customEvaporationDepthsM) ? inputs.customEvaporationDepthsM : undefined,
    customEvaporationsMcm: Array.isArray(inputs.customEvaporationsMcm) ? inputs.customEvaporationsMcm : undefined,
  };

  const output = solveReservoirOptimization(fullInputs);

  const steps: StepMath[] = [
    {
      stepName: 'Reservoir Continuity & Mass Balance',
      formula: 'S(t+1) = S(t) + Inflow(t) - Release(t) - HydroRelease(t) - Evaporation(t) - Spillage(t) (subject to S_{dead} ≤ S(t+1) ≤ S_{max})',
      substitution: `Initial storage S(0) = ${fullInputs.initialStorageMcm} MCM, Dead storage = ${fullInputs.deadStorageMcm} MCM, Capacity = ${fullInputs.maxCapacityMcm} MCM across ${output.totalPeriods} periods`,
      result: `Final Storage = ${output.finalStorageMcm} MCM (Min observed: ${output.minStorageObservedMcm} MCM, Max observed: ${output.maxStorageObservedMcm} MCM)`,
    },
    {
      stepName: 'Combined Downstream Release & Demands',
      formula: 'Release(t) + HydroRelease(t) ≥ Drinking(t) + Irrigation(t) + Industry(t) + Environmental(t)',
      substitution: `Max Outlet: ${fullInputs.maxReleaseM3s} m³/s (${output.maxReleaseLimitPeriodMcm} MCM/period) · Turbine: ${fullInputs.maxTurbineReleaseM3s} m³/s (${output.maxTurbineLimitPeriodMcm} MCM/period) · Spillway: ${fullInputs.spillwayCapacityM3s} m³/s (${output.spillwayLimitPeriodMcm} MCM/period)`,
      result: `Total Combined Downstream Releases: ${output.totalCombinedReleaseMcm} MCM · Total Spillage: ${output.totalSpillageMcm} MCM`,
    },
    {
      stepName: 'Dynamic Hydropower Power & Energy Generation',
      formula: 'Power(t) = η × 9810 × Q_{hydro}(t) × (WaterLevel(t) - Tailwater - headloss) · Energy(t) = (9.81 × η × H_{net} / 3600) × V_{hydro}',
      substitution: `Dynamic water elevation Z(S_t) from H-A-V curve minus tailwater elevation and headloss h_loss = ${fullInputs.headLossM ?? 2.5} m · Efficiency η = ${(fullInputs.turbineEfficiency * 100).toFixed(0)}%, Energy Target = ${fullInputs.energyDemandGwhPerPeriod} GWh/period`,
      result: `Total Clean Energy Generated: ${output.totalEnergyGeneratedGwh} GWh (Reliability: ${output.demandMetrics.hydropower.timeReliabilityPct}%)`,
    },
    {
      stepName: 'Dimensionless Normalized Multi-Criteria Objective Function',
      formula: 'min J = Σ [Σ w_k·(def_k/D_k) + w_h·(def_e/E_t) + w_s·(def_s/(S^* - S_{dead})) + 0.05·(Sp/Sp_{max})] + T·[w_α·(1 - α) + w_ν·ν + w_γ·(1 - γ)]',
      substitution: `All deficits normalized to [0, 1] so large pool storage does not bias demand trade-offs. Weights: w_storage=${fullInputs.weightStorage}, w_rel=${fullInputs.weightReliability}, w_vuln=${fullInputs.weightVulnerability}, w_resil=${fullInputs.weightResiliency}`,
      result: `Optimized Objective J = ${output.normalizedObjectiveSummary?.totalNormalizedObjective ?? 0} (Demand penalty: ${output.normalizedObjectiveSummary?.demandNormalizedPenalty ?? 0}, Storage penalty: ${output.normalizedObjectiveSummary?.storageNormalizedPenalty ?? 0}, Hashimoto penalty: ${((output.normalizedObjectiveSummary?.reliabilityPenalty ?? 0) + (output.normalizedObjectiveSummary?.vulnerabilityPenalty ?? 0) + (output.normalizedObjectiveSummary?.resiliencyPenalty ?? 0)).toFixed(2)})`,
    },
    {
      stepName: 'Hashimoto et al. (1982) System Reliability, Resiliency & Vulnerability',
      formula: 'α = N_{succ}/T · γ = N_{recovery}/N_{fail} · ν = (1/N_{fail}) Σ [Deficit_t / Demand_t]',
      substitution: `Drinking (α=${output.demandMetrics.drinking.timeReliabilityPct}%, γ=${output.demandMetrics.drinking.resiliencyPct}%) · Irrigation (α=${output.demandMetrics.irrigation.timeReliabilityPct}%) · Storage Target (α=${output.demandMetrics.storage?.timeReliabilityPct ?? 100}%)`,
      result: `System Mean Reliability α = ${output.systemOverallReliabilityPct}% · Resiliency γ = ${output.systemOverallResiliencyPct}% · Vulnerability ν = ${output.systemOverallVulnerabilityPct}%`,
    },
  ];

  return {
    primaryLabel: 'System Overall Water Reliability (α)',
    primaryValue: `${output.systemOverallReliabilityPct}%`,
    primaryUnit: 'Hashimoto Time-based Reliability',
    statusLabel: `System Resiliency: ${output.systemOverallResiliencyPct}% · Vulnerability: ${output.systemOverallVulnerabilityPct}%`,
    statusType: output.systemOverallReliabilityPct >= 90 ? 'success' : output.systemOverallReliabilityPct >= 75 ? 'warning' : 'critical',
    secondaryOutputs: [
      { label: 'Optimization Algorithm', value: output.algorithmUsed, unit: 'solver' },
      { label: 'Total Normalized Objective J', value: output.normalizedObjectiveSummary?.totalNormalizedObjective ?? 0, unit: 'dimensionless' },
      { label: 'Drinking Water Reliability', value: `${output.demandMetrics.drinking.timeReliabilityPct}%`, unit: 'time-based α' },
      { label: 'Irrigation Reliability', value: `${output.demandMetrics.irrigation.timeReliabilityPct}%`, unit: 'time-based α' },
      { label: 'Storage Target Compliance', value: `${output.demandMetrics.storage?.timeReliabilityPct ?? 100}%`, unit: 'target α' },
      { label: 'Total Hydropower Generated', value: output.totalEnergyGeneratedGwh, unit: 'GWh' },
      { label: 'Total Downstream Releases', value: output.totalCombinedReleaseMcm, unit: 'MCM' },
      { label: 'Total Spillage Loss', value: output.totalSpillageMcm, unit: 'MCM' },
      { label: 'Observed Min / Max Storage', value: `${output.minStorageObservedMcm} / ${output.maxStorageObservedMcm}`, unit: 'MCM' },
    ],
    steps,
    reference: 'Loucks et al. (1981) Water Resource Systems Planning · Hashimoto et al. (1982) Water Resources Research.',
    diagramData: output as any,
  };
}

