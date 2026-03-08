// Mock data simulating live DFMS sensor readings

export type RiskLevel = "low" | "medium" | "high";

export interface Animal {
  id: string;
  tag: string;
  species: "pig" | "poultry";
  pen: string;
  bodyTemp: number; // °C
  skinColorIndex: number; // 0–100 (higher = more redness)
  activityScore: number; // 0–100 (lower = lethargic)
  healthStatus: RiskLevel;
  isIsolated: boolean;
  lastChecked: string;
}

export interface EnvironmentReading {
  time: string;
  temperature: number; // °C
  humidity: number; // %
  ammonia: number; // ppm
  hygieneScore: number; // 0–100
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
  crudeProtein: number; // %
  energy: number; // kcal/kg
  lysine: number; // %
  threonine: number; // %
  minerals: number; // %
}

// ─── Animals ────────────────────────────────────────────────────────────────
export const animals: Animal[] = [
  { id: "A001", tag: "P-001", species: "pig", pen: "Pen A", bodyTemp: 38.6, skinColorIndex: 12, activityScore: 88, healthStatus: "low", isIsolated: false, lastChecked: "10 min ago" },
  { id: "A002", tag: "P-002", species: "pig", pen: "Pen A", bodyTemp: 40.4, skinColorIndex: 67, activityScore: 42, healthStatus: "high", isIsolated: true, lastChecked: "5 min ago" },
  { id: "A003", tag: "P-003", species: "pig", pen: "Pen B", bodyTemp: 39.1, skinColorIndex: 34, activityScore: 71, healthStatus: "medium", isIsolated: false, lastChecked: "8 min ago" },
  { id: "A004", tag: "P-004", species: "pig", pen: "Pen B", bodyTemp: 38.8, skinColorIndex: 18, activityScore: 82, healthStatus: "low", isIsolated: false, lastChecked: "12 min ago" },
  { id: "A005", tag: "P-005", species: "pig", pen: "Pen C", bodyTemp: 39.8, skinColorIndex: 52, activityScore: 55, healthStatus: "medium", isIsolated: false, lastChecked: "3 min ago" },
  { id: "A006", tag: "BK-001", species: "poultry", pen: "House 1", bodyTemp: 41.1, skinColorIndex: 9, activityScore: 91, healthStatus: "low", isIsolated: false, lastChecked: "6 min ago" },
  { id: "A007", tag: "BK-002", species: "poultry", pen: "House 1", bodyTemp: 42.8, skinColorIndex: 48, activityScore: 38, healthStatus: "high", isIsolated: true, lastChecked: "2 min ago" },
  { id: "A008", tag: "BK-003", species: "poultry", pen: "House 2", bodyTemp: 41.5, skinColorIndex: 21, activityScore: 79, healthStatus: "low", isIsolated: false, lastChecked: "9 min ago" },
];

// ─── Environmental Trend (last 12 hours) ────────────────────────────────────
export const environmentTrend: EnvironmentReading[] = [
  { time: "00:00", temperature: 24.2, humidity: 62, ammonia: 12, hygieneScore: 82 },
  { time: "02:00", temperature: 23.8, humidity: 64, ammonia: 13, hygieneScore: 81 },
  { time: "04:00", temperature: 23.5, humidity: 65, ammonia: 14, hygieneScore: 79 },
  { time: "06:00", temperature: 24.0, humidity: 63, ammonia: 15, hygieneScore: 78 },
  { time: "08:00", temperature: 25.4, humidity: 60, ammonia: 18, hygieneScore: 75 },
  { time: "10:00", temperature: 27.1, humidity: 57, ammonia: 22, hygieneScore: 72 },
  { time: "12:00", temperature: 29.3, humidity: 55, ammonia: 28, hygieneScore: 68 },
  { time: "14:00", temperature: 30.5, humidity: 53, ammonia: 31, hygieneScore: 65 },
  { time: "16:00", temperature: 29.8, humidity: 54, ammonia: 29, hygieneScore: 67 },
  { time: "18:00", temperature: 28.2, humidity: 58, ammonia: 24, hygieneScore: 70 },
  { time: "20:00", temperature: 26.5, humidity: 60, ammonia: 20, hygieneScore: 73 },
  { time: "22:00", temperature: 25.1, humidity: 62, ammonia: 16, hygieneScore: 76 },
];

// ─── Current Readings ─────────────────────────────────────────────────────
export const currentEnv = {
  temperature: 29.8,
  humidity: 54,
  ammonia: 29,
  hygieneScore: 67,
  airQuality: "Moderate",
};

// ─── Alerts ─────────────────────────────────────────────────────────────────
export const alerts: Alert[] = [
  { id: "AL001", type: "disease", severity: "high", message: "High fever detected — P-002 (Pen A). Possible Swine Fever. Animal isolated.", animal: "P-002", pen: "Pen A", timestamp: "Today, 14:32", resolved: false },
  { id: "AL002", type: "disease", severity: "high", message: "Abnormal activity & elevated temp — BK-002 (House 1). Avian infection suspected.", animal: "BK-002", pen: "House 1", timestamp: "Today, 14:15", resolved: false },
  { id: "AL003", type: "environment", severity: "medium", message: "Ammonia level at 29 ppm — approaching critical threshold (30 ppm). Improve ventilation.", pen: "All Pens", timestamp: "Today, 13:50", resolved: false },
  { id: "AL004", type: "behavior", severity: "medium", message: "Reduced activity & social isolation observed — P-005 (Pen C). Monitor closely.", animal: "P-005", pen: "Pen C", timestamp: "Today, 12:20", resolved: false },
  { id: "AL005", type: "nutrition", severity: "low", message: "Under-feeding pattern detected in Pen B for 2 consecutive days. Check feeder.", pen: "Pen B", timestamp: "Today, 09:00", resolved: true },
  { id: "AL006", type: "environment", severity: "low", message: "Hygiene score dropped to 65 in House 1. Schedule cleaning task.", pen: "House 1", timestamp: "Yesterday, 18:45", resolved: true },
];

// ─── Feed Records (last 7 days) ───────────────────────────────────────────
export const feedRecords: FeedRecord[] = [
  { date: "Mon", pigStarter: 48, pigGrower: 62, pigFinisher: 75, poultryStarter: 32, poultryGrower: 45, poultryLayer: 38 },
  { date: "Tue", pigStarter: 50, pigGrower: 60, pigFinisher: 78, poultryStarter: 30, poultryGrower: 47, poultryLayer: 40 },
  { date: "Wed", pigStarter: 45, pigGrower: 58, pigFinisher: 72, poultryStarter: 28, poultryGrower: 44, poultryLayer: 36 },
  { date: "Thu", pigStarter: 52, pigGrower: 65, pigFinisher: 80, poultryStarter: 33, poultryGrower: 49, poultryLayer: 42 },
  { date: "Fri", pigStarter: 49, pigGrower: 61, pigFinisher: 76, poultryStarter: 31, poultryGrower: 46, poultryLayer: 39 },
  { date: "Sat", pigStarter: 47, pigGrower: 59, pigFinisher: 73, poultryStarter: 29, poultryGrower: 43, poultryLayer: 37 },
  { date: "Sun", pigStarter: 51, pigGrower: 63, pigFinisher: 77, poultryStarter: 34, poultryGrower: 48, poultryLayer: 41 },
];

// ─── Nutrition Profiles ──────────────────────────────────────────────────
export const pigNutrition: NutritionProfile[] = [
  { stage: "Starter (0–8 wk)", crudeProtein: 20, energy: 3400, lysine: 1.35, threonine: 0.88, minerals: 2 },
  { stage: "Grower (8–16 wk)", crudeProtein: 18, energy: 3300, lysine: 1.10, threonine: 0.72, minerals: 2 },
  { stage: "Finisher (>16 wk)", crudeProtein: 16, energy: 3200, lysine: 0.95, threonine: 0.62, minerals: 2 },
];

export const poultryNutrition: NutritionProfile[] = [
  { stage: "Starter", crudeProtein: 22, energy: 3000, lysine: 1.40, threonine: 0.90, minerals: 1.8 },
  { stage: "Grower", crudeProtein: 19, energy: 3100, lysine: 1.15, threonine: 0.75, minerals: 1.9 },
  { stage: "Layer/Finisher", crudeProtein: 16, energy: 2900, lysine: 0.85, threonine: 0.65, minerals: 3.5 },
];

// ─── Summary Stats ───────────────────────────────────────────────────────
export const summaryStats = {
  totalAnimals: 248,
  pigsCount: 165,
  poultryCount: 83,
  healthyAnimals: 231,
  atRiskAnimals: 12,
  infectedAnimals: 5,
  isolatedAnimals: 2,
  activeAlerts: 4,
  detectionAccuracy: 92,
  hygieneImprovement: 40,
  diseaseSusceptibilityIndex: 0.32,
  biosecurityRiskIndex: 0.41,
};
