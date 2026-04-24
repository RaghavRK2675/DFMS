// Type-only definitions. Live data now comes from the API via src/hooks/useDfmsData.ts.
// (This file used to contain hardcoded mock arrays — those moved to the server seed.)

export type RiskLevel = "low" | "medium" | "high";

export interface Animal {
  id: string;
  tag: string;
  species: "pig" | "poultry";
  breed?: string;
  pen: string;
  bodyTemp: number;
  skinColorIndex: number;
  activityScore: number;
  healthStatus: RiskLevel;
  isIsolated: boolean;
  lastChecked: string;
}

export interface EnvironmentReading {
  time: string;
  temperature: number;
  humidity: number;
  ammonia: number;
  hygieneScore: number;
}

export interface Alert {
  id: string;
  type: "disease" | "environment" | "nutrition" | "behavior";
  severity: RiskLevel;
  message: string;
  animal?: string;
  pen?: string;
  timestamp: string;
  resolved: boolean;
}

export interface FeedRecord {
  date: string;
  pigStarter: number;
  pigGrower: number;
  pigFinisher: number;
  poultryStarter: number;
  poultryGrower: number;
  poultryLayer: number;
}

export interface NutritionProfile {
  stage: string;
  crudeProtein: number;
  energy: number;
  lysine: number;
  threonine: number;
  minerals: number;
}

export interface SummaryStats {
  totalAnimals: number;
  pigsCount: number;
  poultryCount: number;
  healthyAnimals: number;
  atRiskAnimals: number;
  infectedAnimals: number;
  isolatedAnimals: number;
  activeAlerts: number;
  detectionAccuracy: number;
  hygieneImprovement: number;
  diseaseSusceptibilityIndex: number;
  biosecurityRiskIndex: number;
}
