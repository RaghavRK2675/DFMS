import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ===== Types kept compatible with old mockData shape =====
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

// ===== Hooks =====
export const useAnimals = () =>
  useQuery({
    queryKey: ["animals"],
    queryFn: async () => (await api.get<{ animals: Animal[] }>("/animals")).data.animals,
    refetchInterval: 30000,
  });

export const useRefreshAnimals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<{ animals: Animal[] }>("/animals/refresh")).data.animals,
    onSuccess: (animals) => {
      qc.setQueryData(["animals"], animals);
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["env", "current"] });
    },
  });
};

export const useAlerts = () =>
  useQuery({
    queryKey: ["alerts"],
    queryFn: async () => (await api.get<{ alerts: Alert[] }>("/alerts")).data.alerts,
    refetchInterval: 30000,
  });

export const useResolveAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/alerts/${id}/resolve`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
};

export const useEnvTrend = () =>
  useQuery({
    queryKey: ["env", "trend"],
    queryFn: async () => (await api.get<{ trend: EnvReading[] }>("/environment/trend")).data.trend,
    refetchInterval: 30000,
  });

export const useCurrentEnv = () =>
  useQuery({
    queryKey: ["env", "current"],
    queryFn: async () => (await api.get("/environment/current")).data.current,
    refetchInterval: 15000,
  });

export const useStats = () =>
  useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await api.get<{ summary: SummaryStats }>("/stats/summary")).data.summary,
    refetchInterval: 30000,
  });

export const useIoTDevices = () =>
  useQuery({
    queryKey: ["iot"],
    queryFn: async () => (await api.get<{ devices: IoTDevice[] }>("/iot")).data.devices,
    refetchInterval: 30000,
  });

export const useCameras = () =>
  useQuery({
    queryKey: ["cameras"],
    queryFn: async () => (await api.get<{ cameras: Camera[] }>("/cameras")).data.cameras,
  });

export const useAddCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; location: string; streamUrl: string; streamType: "hls" | "mp4" }) =>
      (await api.post("/cameras", input)).data.camera,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};

export const useDeleteCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/cameras/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};

export const useFeedRecords = () =>
  useQuery({
    queryKey: ["nutrition", "feed"],
    queryFn: async () => (await api.get("/nutrition/feed")).data.feed,
  });

export const useNutritionProfiles = () =>
  useQuery({
    queryKey: ["nutrition", "profiles"],
    queryFn: async () => (await api.get("/nutrition/profiles")).data,
  });
