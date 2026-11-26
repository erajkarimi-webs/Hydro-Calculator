/**
 * AquaCalcs - Reservoir Monthly Time Series & H-A-V Curve CSV Import/Export Helper
 * Supports:
 * 1. Monthly Time Series (Inflow, Drinking, Irrigation, Industry, Environmental, Evaporation Depth in meters)
 * 2. Reservoir Height-Area-Volume (Elevation-Area-Capacity) Stage-Storage Curve
 */

import { HeightAreaVolumePoint, generateDefaultHavCurve } from '../calculators/reservoirOptimizationEngine';

export interface MonthlyTimeSeriesRow {
  month: number;          // 1 to totalPeriods
  year: number;           // 1 to 5
  monthInYear: number;    // 1 to 12
  label: string;          // e.g. "Yr 1 - M01 (Jan)"
  inflowMcm: number;
  drinkingMcm: number;
  irrigationMcm: number;
  industryMcm: number;
  environmentalMcm: number;
  evaporationDepthM: number; // Evaporation depth in meters (m)
  evaporationMcm?: number;    // Estimated volume in MCM for quick preview
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHLY_WEIGHTS = [0.05, 0.07, 0.12, 0.18, 0.22, 0.14, 0.08, 0.04, 0.03, 0.02, 0.02, 0.03]; // sum = 1.0

const YEAR_MULTIPLIERS: Record<string, number[]> = {
  realistic_cycle: [1.10, 0.72, 0.58, 0.95, 1.25],
  drought_stress:  [0.65, 0.52, 0.48, 0.60, 0.55],
  average_normal:  [1.00, 1.02, 0.98, 1.01, 0.99],
  wet_flood:       [1.25, 1.35, 1.40, 1.15, 1.30],
};

/**
 * Generates synthetic baseline monthly rows for the given horizon and default settings
 */
export function generateMonthlyBaselineRows(
  years: number,
  meanAnnualInflowMcm: number,
  hydrologyScenario: string,
  defaults: {
    drinkingMcm: number;
    irrigationMcm: number;
    industryMcm: number;
    environmentalMcm: number;
  }
): MonthlyTimeSeriesRow[] {
  const totalMonths = Math.min(60, Math.max(1, years) * 12);
  const multipliers = YEAR_MULTIPLIERS[hydrologyScenario] || YEAR_MULTIPLIERS.realistic_cycle;
  const rows: MonthlyTimeSeriesRow[] = [];

  for (let m = 0; m < totalMonths; m++) {
    const yrIndex = Math.min(Math.floor(m / 12), multipliers.length - 1);
    const yrMult = multipliers[yrIndex];
    const monthInYr = m % 12;
    const periodShare = MONTHLY_WEIGHTS[monthInYr];
    const noise = 0.92 + 0.16 * Math.sin(m * 0.73) * Math.cos(m * 0.31);
    const inflow = Math.max(0.5, parseFloat((meanAnnualInflowMcm * yrMult * periodShare * noise).toFixed(2)));

    // Seasonal evaporation depth in meters (e.g. 0.05m in winter up to 0.14m in hot summer)
    const evapSin = Math.sin(((monthInYr - 2) / 12) * 2 * Math.PI);
    const evapDepthM = parseFloat(Math.max(0.03, 0.09 + 0.05 * evapSin).toFixed(3)); // meters
    const estEvapMcm = parseFloat((evapDepthM * 18.5).toFixed(2)); // estimated with ~18.5 km² nominal pool

    // Seasonal irrigation adjustment (higher in agricultural growing seasons)
    const irrigSeasonFactor = [0.4, 0.6, 1.0, 1.4, 1.6, 1.5, 1.2, 0.9, 0.6, 0.4, 0.3, 0.3][monthInYr];
    const seasonalIrrig = parseFloat((defaults.irrigationMcm * irrigSeasonFactor).toFixed(2));

    const yrNum = Math.floor(m / 12) + 1;
    const moNum = monthInYr + 1;
    const moName = MONTH_NAMES[monthInYr];
    const label = `Yr ${yrNum} - M${moNum < 10 ? '0' + moNum : moNum} (${moName})`;

    rows.push({
      month: m + 1,
      year: yrNum,
      monthInYear: moNum,
      label,
      inflowMcm: inflow,
      drinkingMcm: defaults.drinkingMcm,
      irrigationMcm: seasonalIrrig,
      industryMcm: defaults.industryMcm,
      environmentalMcm: defaults.environmentalMcm,
      evaporationDepthM: evapDepthM,
      evaporationMcm: estEvapMcm,
    });
  }

  return rows;
}

/**
 * Exports current monthly data to CSV and triggers instant browser download
 */
export function exportMonthlyTimeSeriesCsv(rows: MonthlyTimeSeriesRow[], fileName = 'reservoir_monthly_timeseries.csv'): void {
  const headers = [
    'Month',
    'Year',
    'Period_Label',
    'Inflow_MCM',
    'Drinking_MCM',
    'Irrigation_MCM',
    'Industry_MCM',
    'Environmental_MCM',
    'Evaporation_Depth_m',
  ];

  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.month,
      r.year,
      `"${r.label}"`,
      r.inflowMcm.toFixed(2),
      r.drinkingMcm.toFixed(2),
      r.irrigationMcm.toFixed(2),
      r.industryMcm.toFixed(2),
      r.environmentalMcm.toFixed(2),
      r.evaporationDepthM.toFixed(3),
    ].join(','));
  }

  const csvString = lines.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean CSV template ready for users to populate with external raw monthly data
 */
export function downloadCsvTemplate(years: number): void {
  const templateRows = generateMonthlyBaselineRows(years, 720, 'average_normal', {
    drinkingMcm: 15.0,
    irrigationMcm: 35.0,
    industryMcm: 8.0,
    environmentalMcm: 5.0,
  });
  exportMonthlyTimeSeriesCsv(templateRows, `reservoir_timeseries_template_${years}yr.csv`);
}

/**
 * Parses user-uploaded CSV file for monthly series.
 */
export function parseMonthlyTimeSeriesCsv(
  csvText: string,
  existingRows: MonthlyTimeSeriesRow[],
  targetColumnOverride?: 'inflow' | 'drinking' | 'irrigation' | 'industry' | 'environmental' | 'evaporation' | 'all'
): {
  success: boolean;
  updatedRows: MonthlyTimeSeriesRow[];
  message: string;
  rowsParsed: number;
} {
  const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (rawLines.length === 0) {
    return {
      success: false,
      updatedRows: existingRows,
      message: 'Uploaded file is empty.',
      rowsParsed: 0,
    };
  }

  // Detect delimiter (, or ; or \t)
  const firstLine = rawLines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  const headerTokens = firstLine.split(delimiter).map((h) => h.replace(/["']/g, '').trim().toLowerCase());

  // Check if first line is a header
  const isHeader = headerTokens.some((t) =>
    ['month', 'inflow', 'drinking', 'irrigation', 'industry', 'environmental', 'evap', 'flow', 'demand', 'depth', 'value'].some((keyword) => t.includes(keyword))
  );

  const startLine = isHeader ? 1 : 0;
  const dataLines = rawLines.slice(startLine);

  if (dataLines.length === 0) {
    return {
      success: false,
      updatedRows: existingRows,
      message: 'No data rows found below CSV header.',
      rowsParsed: 0,
    };
  }

  // Map column index to field
  const colMap: Record<string, number> = {};
  if (isHeader) {
    headerTokens.forEach((token, idx) => {
      if (token.includes('inflow') || token === 'flow' || token === 'q' || token === 'q_in') {
        colMap.inflow = idx;
      } else if (token.includes('drink') || token.includes('muni') || token.includes('domest')) {
        colMap.drinking = idx;
      } else if (token.includes('irrig') || token.includes('agri') || token.includes('crop')) {
        colMap.irrigation = idx;
      } else if (token.includes('indus')) {
        colMap.industry = idx;
      } else if (token.includes('env') || token.includes('eco')) {
        colMap.environmental = idx;
      } else if (token.includes('evap') || token.includes('loss') || token.includes('depth')) {
        colMap.evaporation = idx;
      }
    });
  }

  const updatedRows = existingRows.map((r) => ({ ...r }));
  let rowsParsed = 0;

  for (let i = 0; i < Math.min(dataLines.length, updatedRows.length); i++) {
    const parts = dataLines[i].split(delimiter).map((p) => p.replace(/["']/g, '').trim());
    if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) continue;

    // Single-column targeted import
    if (targetColumnOverride && targetColumnOverride !== 'all') {
      const val = parseFloat(parts[0]);
      if (!isNaN(val) && val >= 0) {
        if (targetColumnOverride === 'inflow') updatedRows[i].inflowMcm = val;
        else if (targetColumnOverride === 'drinking') updatedRows[i].drinkingMcm = val;
        else if (targetColumnOverride === 'irrigation') updatedRows[i].irrigationMcm = val;
        else if (targetColumnOverride === 'industry') updatedRows[i].industryMcm = val;
        else if (targetColumnOverride === 'environmental') updatedRows[i].environmentalMcm = val;
        else if (targetColumnOverride === 'evaporation') {
          // If > 5, assume mm and convert to m
          updatedRows[i].evaporationDepthM = val > 5 ? val / 1000 : val;
        }
        rowsParsed++;
      }
      continue;
    }

    // Header-mapped multi-column import
    if (Object.keys(colMap).length > 0) {
      if (colMap.inflow !== undefined && parts[colMap.inflow] !== undefined) {
        const val = parseFloat(parts[colMap.inflow]);
        if (!isNaN(val) && val >= 0) updatedRows[i].inflowMcm = val;
      }
      if (colMap.drinking !== undefined && parts[colMap.drinking] !== undefined) {
        const val = parseFloat(parts[colMap.drinking]);
        if (!isNaN(val) && val >= 0) updatedRows[i].drinkingMcm = val;
      }
      if (colMap.irrigation !== undefined && parts[colMap.irrigation] !== undefined) {
        const val = parseFloat(parts[colMap.irrigation]);
        if (!isNaN(val) && val >= 0) updatedRows[i].irrigationMcm = val;
      }
      if (colMap.industry !== undefined && parts[colMap.industry] !== undefined) {
        const val = parseFloat(parts[colMap.industry]);
        if (!isNaN(val) && val >= 0) updatedRows[i].industryMcm = val;
      }
      if (colMap.environmental !== undefined && parts[colMap.environmental] !== undefined) {
        const val = parseFloat(parts[colMap.environmental]);
        if (!isNaN(val) && val >= 0) updatedRows[i].environmentalMcm = val;
      }
      if (colMap.evaporation !== undefined && parts[colMap.evaporation] !== undefined) {
        const val = parseFloat(parts[colMap.evaporation]);
        if (!isNaN(val) && val >= 0) {
          // If user gave in mm (> 5), convert to meters
          updatedRows[i].evaporationDepthM = val > 5 ? val / 1000 : val;
        }
      }
      rowsParsed++;
    } else {
      // Positional fallback
      const numericParts = parts.map((p) => parseFloat(p)).filter((n) => !isNaN(n));
      if (numericParts.length >= 6) {
        updatedRows[i].inflowMcm = numericParts[0];
        updatedRows[i].drinkingMcm = numericParts[1];
        updatedRows[i].irrigationMcm = numericParts[2];
        updatedRows[i].industryMcm = numericParts[3];
        updatedRows[i].environmentalMcm = numericParts[4];
        updatedRows[i].evaporationDepthM = numericParts[5] > 5 ? numericParts[5] / 1000 : numericParts[5];
        rowsParsed++;
      } else if (numericParts.length === 1) {
        updatedRows[i].inflowMcm = numericParts[0];
        rowsParsed++;
      }
    }
  }

  if (rowsParsed === 0) {
    return {
      success: false,
      updatedRows: existingRows,
      message: 'Could not extract valid numbers from CSV. Please check formatting or download the template.',
      rowsParsed: 0,
    };
  }

  return {
    success: true,
    updatedRows,
    message: `Successfully loaded ${rowsParsed} monthly time-series records from CSV.`,
    rowsParsed,
  };
}

/**
 * =========================================================================
 * Height-Area-Volume (H-A-V) Elevation-Capacity Curve CSV Helpers
 * =========================================================================
 */

/**
 * Exports Height-Area-Volume curve points to CSV
 */
export function exportHavCurveCsv(points: HeightAreaVolumePoint[], fileName = 'reservoir_hav_curve.csv'): void {
  const headers = ['Elevation_m', 'Area_km2', 'Storage_MCM'];
  const lines = [headers.join(',')];

  for (const pt of points) {
    lines.push([
      pt.elevationM.toFixed(2),
      pt.areaKm2.toFixed(2),
      pt.storageMcm.toFixed(2),
    ].join(','));
  }

  const csvString = lines.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean CSV template for Height-Area-Volume curve
 */
export function downloadHavCurveTemplate(maxCapacityMcm = 500, deadStorageMcm = 50): void {
  const points = generateDefaultHavCurve(maxCapacityMcm, deadStorageMcm);
  exportHavCurveCsv(points, 'reservoir_hav_curve_template.csv');
}

/**
 * Parses a user-uploaded CSV file into HeightAreaVolumePoint[]
 */
export function parseHavCurveCsv(csvText: string): {
  success: boolean;
  points: HeightAreaVolumePoint[];
  message: string;
} {
  const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (rawLines.length === 0) {
    return { success: false, points: [], message: 'Uploaded file is empty.' };
  }

  const firstLine = rawLines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  const headerTokens = firstLine.split(delimiter).map((h) => h.replace(/["']/g, '').trim().toLowerCase());
  const isHeader = headerTokens.some((t) =>
    ['elev', 'height', 'area', 'storage', 'vol', 'cap'].some((keyword) => t.includes(keyword))
  );

  const startLine = isHeader ? 1 : 0;
  const dataLines = rawLines.slice(startLine);

  let colElev = 0;
  let colArea = 1;
  let colStorage = 2;

  if (isHeader) {
    headerTokens.forEach((token, idx) => {
      if (token.includes('elev') || token.includes('height') || token.includes('level') || token === 'h' || token === 'z') {
        colElev = idx;
      } else if (token.includes('area') || token.includes('surface') || token === 'a') {
        colArea = idx;
      } else if (token.includes('stor') || token.includes('vol') || token.includes('cap') || token === 's' || token === 'v') {
        colStorage = idx;
      }
    });
  }

  const parsedPoints: HeightAreaVolumePoint[] = [];

  for (const line of dataLines) {
    const parts = line.split(delimiter).map((p) => p.replace(/["']/g, '').trim());
    if (parts.length < 2) continue;

    const elev = parseFloat(parts[colElev]);
    const area = parseFloat(parts[colArea]);
    const stor = parseFloat(parts[colStorage]);

    if (!isNaN(elev) && !isNaN(area) && !isNaN(stor)) {
      parsedPoints.push({
        elevationM: parseFloat(elev.toFixed(2)),
        areaKm2: parseFloat(Math.max(0, area).toFixed(2)),
        storageMcm: parseFloat(Math.max(0, stor).toFixed(2)),
      });
    }
  }

  if (parsedPoints.length < 2) {
    return {
      success: false,
      points: [],
      message: 'Height-Area-Volume curve must have at least 2 valid numeric points (Elevation, Area, Storage).',
    };
  }

  // Sort ascending by storage
  parsedPoints.sort((a, b) => a.storageMcm - b.storageMcm);

  return {
    success: true,
    points: parsedPoints,
    message: `Successfully loaded Height-Area-Volume curve with ${parsedPoints.length} stage-storage points.`,
  };
}
