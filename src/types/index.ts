export type DomainId = 
  | 'water-quality'
  | 'hydrology-reservoirs'
  | 'wastewater'
  | 'geo-energy'
  | 'wef-nexus'
  | 'agricultural'
  | 'desalination';

export type UnitSystem = 'metric' | 'us';
export type Language = 'en' | 'fa' | 'es';

export interface CalculatorMeta {
  id: string;
  name: string;
  shortDescription: string;
  domain: DomainId;
  featured?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  standardReference: string;
  equationSummary: string;
}

export interface DomainInfo {
  id: DomainId;
  nameKey: string;
  title: string;
  iconName: string;
  count: number;
  description: string;
}

export interface StepMath {
  stepName: string;
  formula: string;
  substitution: string;
  result: string;
  note?: string;
}

export interface CalculationResult {
  primaryLabel: string;
  primaryValue: string | number;
  primaryUnit: string;
  statusLabel?: string;
  statusType?: 'normal' | 'warning' | 'critical' | 'success';
  secondaryOutputs: Array<{
    label: string;
    value: string | number;
    unit: string;
    description?: string;
  }>;
  steps: StepMath[];
  reference: string;
  diagramData?: Record<string, any>;
}

export interface UserProfile {
  email: string;
  name: string;
  isPro: boolean;
  role?: string;
  organization?: string;
  avatarUrl?: string;
}
