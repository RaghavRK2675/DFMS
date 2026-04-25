import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

// =====================================================================
// Live-feeling demo data layer.
// The dashboard runs entirely client-side against this in-memory store —
// no Node API is required. Auth is handled by Lovable Cloud (Supabase).
// =====================================================================

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
export interface EnvReading {
  time: string;
  temperature: number;
  humidity: number;
  ammonia: number;
  hygieneScore: number;
}
export interface Camera {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  streamType: "hls" | "mp4";
  isActive: boolean;
}
export interface IoTDevice {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  location: string;
  status: "online" | "offline" | "warning";
  battery: number;
  pingMs: number;
  firmware: string;
  lastSeen: string;
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
  biosecurityRiskIndex: number;
  diseaseSusceptibilityIndex: number;
}

// ---------- helpers ----------
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const uid = () => Math.random().toString(36).slice(2, 10);
const classify = (bodyTemp: number, skin: number): RiskLevel =>
  bodyTemp > 40.2 || skin > 60 ? "high" : bodyTemp > 39.5 || skin > 35 ? "medium" : "low";

// ---------- seed store ----------
const store = {
  animals: [] as Animal[],
  alerts: [] as Alert[],
  envTrend: [] as EnvReading[],
  iot: [] as IoTDevice[],
  cameras: [] as Camera[],
  feed: [] as any[],
  nutrition: { pig: [] as any[], poultry: [] as any[] },
  initialized: false,
};

function seed() {
  if (store.initialized) return;

  const animalSeed = [
    { tag: "P-001", species: "pig", breed: "Yorkshire", pen: "Pen A", bodyTemp: 38.6, skinColorIndex: 12, activityScore: 88, isIsolated: false },
    { tag: "P-002", species: "pig", breed: "Yorkshire", pen: "Pen A", bodyTemp: 40.4, skinColorIndex: 67, activityScore: 42, isIsolated: true },
    { tag: "P-003", species: "pig", breed: "Berkshire", pen: "Pen B", bodyTemp: 39.1, skinColorIndex: 34, activityScore: 71, isIsolated: false },
    { tag: "P-004", species: "pig", breed: "Berkshire", pen: "Pen B", bodyTemp: 38.8, skinColorIndex: 18, activityScore: 82, isIsolated: false },
    { tag: "P-005", species: "pig", breed: "Landrace",  pen: "Pen C", bodyTemp: 39.8, skinColorIndex: 52, activityScore: 55, isIsolated: false },
    { tag: "P-006", species: "pig", breed: "Landrace",  pen: "Pen C", bodyTemp: 38.4, skinColorIndex: 14, activityScore: 86, isIsolated: false },
    { tag: "P-007", species: "pig", breed: "Duroc",     pen: "Pen A", bodyTemp: 39.0, skinColorIndex: 22, activityScore: 78, isIsolated: false },
    { tag: "P-008", species: "pig", breed: "Duroc",     pen: "Pen B", bodyTemp: 38.7, skinColorIndex: 16, activityScore: 84, isIsolated: false },
    { tag: "BK-001", species: "poultry", breed: "Broiler", pen: "House 1", bodyTemp: 41.1, skinColorIndex: 9,  activityScore: 91, isIsolated: false },
    { tag: "BK-002", species: "poultry", breed: "Broiler", pen: "House 1", bodyTemp: 42.8, skinColorIndex: 48, activityScore: 38, isIsolated: true },
    { tag: "BK-003", species: "poultry", breed: "Layer",   pen: "House 2", bodyTemp: 41.5, skinColorIndex: 21, activityScore: 79, isIsolated: false },
    { tag: "BK-004", species: "poultry", breed: "Layer",   pen: "House 2", bodyTemp: 41.3, skinColorIndex: 17, activityScore: 83, isIsolated: false },
    { tag: "BK-005", species: "poultry", breed: "Layer",   pen: "House 2", bodyTemp: 41.8, skinColorIndex: 25, activityScore: 75, isIsolated: false },
  ] as const;

  const now = Date.now();
  store.animals = animalSeed.map((a) => ({
    id: uid(),
    ...a,
    species: a.species as "pig" | "poultry",
    healthStatus: classify(a.bodyTemp, a.skinColorIndex),
    lastChecked: new Date(now).toISOString(),
  }));

  store.alerts = [
    { type: "disease", severity: "high", message: "High fever detected — P-002 (Pen A). Possible Swine Fever. Animal isolated.", animal: "P-002", pen: "Pen A", resolved: false },
    { type: "disease", severity: "high", message: "Abnormal activity & elevated temp — BK-002 (House 1). Avian infection suspected.", animal: "BK-002", pen: "House 1", resolved: false },
    { type: "environment", severity: "medium", message: "Ammonia level approaching critical threshold (30 ppm). Improve ventilation.", pen: "All Pens", resolved: false },
    { type: "behavior", severity: "medium", message: "Reduced activity & social isolation observed — P-005 (Pen C).", animal: "P-005", pen: "Pen C", resolved: false },
    { type: "nutrition", severity: "low", message: "Under-feeding pattern detected in Pen B for 2 consecutive days.", pen: "Pen B", resolved: true },
    { type: "environment", severity: "low", message: "Hygiene score dropped to 65 in House 1. Schedule cleaning.", pen: "House 1", resolved: true },
  ].map((a) => ({ id: uid(), timestamp: new Date(now - Math.random() * 3600_000).toISOString(), ...a })) as Alert[];

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 30 * 60 * 1000);
    const hour = t.getHours() + t.getMinutes() / 60;
    const diurnal = Math.sin(((hour - 6) / 24) * Math.PI * 2);
    store.envTrend.push({
      time: t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
      temperature: round1(24 + 4 * diurnal + (Math.random() - 0.5)),
      humidity: Math.round(60 - 6 * diurnal + (Math.random() - 0.5) * 3),
      ammonia: Math.round(15 + 8 * diurnal + (Math.random() - 0.5) * 3),
      hygieneScore: Math.round(78 - 8 * diurnal + (Math.random() - 0.5) * 3),
    });
  }

  store.iot = [
    { deviceId: "TS-001", name: "Temp Sensor — Pen A", type: "temp_sensor", location: "Pen A", battery: 87, pingMs: 28, firmware: "v2.1.4", status: "online" },
    { deviceId: "TS-002", name: "Temp Sensor — Pen B", type: "temp_sensor", location: "Pen B", battery: 72, pingMs: 35, firmware: "v2.1.4", status: "online" },
    { deviceId: "HS-001", name: "Humidity — Pen A", type: "humidity_sensor", location: "Pen A", battery: 91, pingMs: 22, firmware: "v2.0.8", status: "online" },
    { deviceId: "AM-001", name: "Ammonia — House 1", type: "ammonia_sensor", location: "House 1", battery: 64, pingMs: 41, firmware: "v1.9.2", status: "warning" },
    { deviceId: "CAM-01", name: "Camera — Pen A", type: "camera", location: "Pen A", battery: 100, pingMs: 18, firmware: "v3.2.0", status: "online" },
    { deviceId: "CAM-02", name: "Camera — House 1", type: "camera", location: "House 1", battery: 100, pingMs: 24, firmware: "v3.2.0", status: "online" },
    { deviceId: "RFID-01", name: "RFID Reader — Gate", type: "rfid_reader", location: "Main Gate", battery: 100, pingMs: 12, firmware: "v1.4.0", status: "online" },
    { deviceId: "FD-001", name: "Auto Feeder — Pen B", type: "feeder", location: "Pen B", battery: 55, pingMs: 33, firmware: "v2.3.1", status: "online" },
    { deviceId: "FD-002", name: "Auto Feeder — House 2", type: "feeder", location: "House 2", battery: 48, pingMs: 38, firmware: "v2.3.1", status: "warning" },
    { deviceId: "GW-001", name: "IoT Gateway — Main", type: "gateway", location: "Control Room", battery: 100, pingMs: 8, firmware: "v4.0.1", status: "online" },
    { deviceId: "TS-003", name: "Temp Sensor — House 2", type: "temp_sensor", location: "House 2", battery: 0, pingMs: 0, firmware: "v2.1.4", status: "offline" },
  ].map((d) => ({ id: uid(), lastSeen: new Date(now).toISOString(), ...d })) as IoTDevice[];

  store.feed = [
    { date: "Mon", pigStarter: 48, pigGrower: 62, pigFinisher: 75, poultryStarter: 32, poultryGrower: 45, poultryLayer: 38 },
    { date: "Tue", pigStarter: 50, pigGrower: 60, pigFinisher: 78, poultryStarter: 30, poultryGrower: 47, poultryLayer: 40 },
    { date: "Wed", pigStarter: 45, pigGrower: 58, pigFinisher: 72, poultryStarter: 28, poultryGrower: 44, poultryLayer: 36 },
    { date: "Thu", pigStarter: 52, pigGrower: 65, pigFinisher: 80, poultryStarter: 33, poultryGrower: 49, poultryLayer: 42 },
    { date: "Fri", pigStarter: 49, pigGrower: 61, pigFinisher: 76, poultryStarter: 31, poultryGrower: 46, poultryLayer: 39 },
    { date: "Sat", pigStarter: 47, pigGrower: 59, pigFinisher: 73, poultryStarter: 29, poultryGrower: 43, poultryLayer: 37 },
    { date: "Sun", pigStarter: 51, pigGrower: 63, pigFinisher: 77, poultryStarter: 34, poultryGrower: 48, poultryLayer: 41 },
  ];

  store.nutrition = {
    pig: [
      { stage: "Starter (0–8 wk)", crudeProtein: 20, energy: 3400, lysine: 1.35, threonine: 0.88, minerals: 2 },
      { stage: "Grower (8–16 wk)", crudeProtein: 18, energy: 3300, lysine: 1.10, threonine: 0.72, minerals: 2 },
      { stage: "Finisher (>16 wk)", crudeProtein: 16, energy: 3200, lysine: 0.95, threonine: 0.62, minerals: 2 },
    ],
    poultry: [
      { stage: "Starter", crudeProtein: 22, energy: 3000, lysine: 1.40, threonine: 0.90, minerals: 1.8 },
      { stage: "Grower", crudeProtein: 19, energy: 3100, lysine: 1.15, threonine: 0.75, minerals: 1.9 },
      { stage: "Layer/Finisher", crudeProtein: 16, energy: 2900, lysine: 0.85, threonine: 0.65, minerals: 3.5 },
    ],
  };

  store.initialized = true;
}

function tick() {
  // jitter env
  const last = store.envTrend[store.envTrend.length - 1] ?? { temperature: 26, humidity: 60, ammonia: 18, hygieneScore: 75 };
  store.envTrend.push({
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
    temperature: round1(clamp(last.temperature + (Math.random() - 0.5) * 0.6, 18, 38)),
    humidity: Math.round(clamp(last.humidity + (Math.random() - 0.5) * 2, 40, 90)),
    ammonia: Math.round(clamp(last.ammonia + (Math.random() - 0.5) * 1.5, 5, 45)),
    hygieneScore: Math.round(clamp(last.hygieneScore + (Math.random() - 0.5) * 2, 50, 95)),
  });
  if (store.envTrend.length > 48) store.envTrend.shift();

  // jitter animals
  store.animals = store.animals.map((a) => {
    const bodyTemp = round1(clamp(a.bodyTemp + (Math.random() - 0.5) * 0.2, 37.5, 43));
    const activityScore = Math.round(clamp(a.activityScore + (Math.random() - 0.5) * 2, 0, 100));
    return {
      ...a,
      bodyTemp,
      activityScore,
      healthStatus: classify(bodyTemp, a.skinColorIndex),
      lastChecked: new Date().toISOString(),
    };
  });

  // jitter IoT
  store.iot = store.iot.map((d) => {
    if (d.status === "offline") return d;
    return {
      ...d,
      pingMs: Math.max(5, Math.round(d.pingMs + (Math.random() - 0.5) * 4)),
      battery: Math.max(0, d.battery - (Math.random() < 0.05 ? 1 : 0)),
      lastSeen: new Date().toISOString(),
    };
  });
}

seed();

function summarize(): SummaryStats {
  const total = store.animals.length;
  const pigs = store.animals.filter((a) => a.species === "pig").length;
  const poultry = total - pigs;
  const healthy = store.animals.filter((a) => a.healthStatus === "low").length;
  const atRisk = store.animals.filter((a) => a.healthStatus === "medium").length;
  const infected = store.animals.filter((a) => a.healthStatus === "high").length;
  const isolated = store.animals.filter((a) => a.isIsolated).length;
  const activeAlerts = store.alerts.filter((a) => !a.resolved).length;
  const env = store.envTrend[store.envTrend.length - 1];
  // BRI: combines ammonia + hygiene + isolation pressure
  const bri = Math.round(
    clamp(
      (env ? (env.ammonia / 45) * 40 + ((100 - env.hygieneScore) / 100) * 30 : 35) +
        (isolated / Math.max(total, 1)) * 30,
      0,
      100,
    ),
  );
  // DSI: average risk profile across herd
  const dsi = Math.round(
    clamp(
      (infected * 100 + atRisk * 55 + healthy * 10) / Math.max(total, 1),
      0,
      100,
    ),
  );
  return {
    totalAnimals: total,
    pigsCount: pigs,
    poultryCount: poultry,
    healthyAnimals: healthy,
    atRiskAnimals: atRisk,
    infectedAnimals: infected,
    isolatedAnimals: isolated,
    activeAlerts,
    detectionAccuracy: 92,
    hygieneImprovement: 40,
    biosecurityRiskIndex: bri,
    diseaseSusceptibilityIndex: dsi,
  };
}

// Run a global background tick so all queries see fresh data on refetch.
let intervalStarted = false;
function useGlobalTick() {
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (intervalStarted) return;
    intervalStarted = true;
    ref.current = window.setInterval(tick, 30_000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
      intervalStarted = false;
    };
  }, []);
}

// ===== Hooks =====
export const useAnimals = () => {
  useGlobalTick();
  return useQuery({
    queryKey: ["animals"],
    queryFn: async () => [...store.animals],
    refetchInterval: 30_000,
  });
};

export const useRefreshAnimals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      tick();
      return [...store.animals];
    },
    onSuccess: (animals) => {
      qc.setQueryData(["animals"], animals);
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["env"] });
      qc.invalidateQueries({ queryKey: ["iot"] });
    },
  });
};

export const useAlerts = () =>
  useQuery({
    queryKey: ["alerts"],
    queryFn: async () => [...store.alerts],
    refetchInterval: 30_000,
  });

export const useResolveAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const a = store.alerts.find((x) => x.id === id);
      if (a) a.resolved = true;
      return a;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useEnvTrend = () =>
  useQuery({
    queryKey: ["env", "trend"],
    queryFn: async () => [...store.envTrend],
    refetchInterval: 30_000,
  });

export const useCurrentEnv = () =>
  useQuery({
    queryKey: ["env", "current"],
    queryFn: async () => store.envTrend[store.envTrend.length - 1],
    refetchInterval: 15_000,
  });

export const useStats = () =>
  useQuery({
    queryKey: ["stats"],
    queryFn: async () => summarize(),
    refetchInterval: 30_000,
  });

export const useIoTDevices = () =>
  useQuery({
    queryKey: ["iot"],
    queryFn: async () => [...store.iot],
    refetchInterval: 30_000,
  });

export const useCameras = () =>
  useQuery({
    queryKey: ["cameras"],
    queryFn: async () => [...store.cameras],
  });

export const useAddCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; location: string; streamUrl: string; streamType: "hls" | "mp4" }) => {
      const cam: Camera = { id: uid(), isActive: true, ...input };
      store.cameras.push(cam);
      return cam;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};

export const useDeleteCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      store.cameras = store.cameras.filter((c) => c.id !== id);
      return { ok: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};

export const useFeedRecords = () =>
  useQuery({
    queryKey: ["nutrition", "feed"],
    queryFn: async () => [...store.feed],
  });

export const useNutritionProfiles = () =>
  useQuery({
    queryKey: ["nutrition", "profiles"],
    queryFn: async () => store.nutrition,
  });
