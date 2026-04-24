import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStats, useAnimals, useAlerts } from "@/hooks/useDfmsData";
import { ShieldAlert, Thermometer, Activity, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  modalKey: string | null;
}

function Row({ label, value, highlight }: { label: string; value: string | number; highlight?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", highlight)}>{value}</span>
    </div>
  );
}

export function StatCardDetailModal({ open, onClose, modalKey }: Props) {
  const { data: stats } = useStats();
  const { data: animals = [] } = useAnimals();
  const { data: alerts = [] } = useAlerts();

  if (!modalKey || !stats) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>Loading…</DialogTitle></DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const total = stats.totalAnimals || 1;

  const titles: Record<string, string> = {
    totalAnimals: "Total Animal Population",
    healthyAnimals: "Healthy Animals Detail",
    activeAlerts: "Active Alerts Breakdown",
    isolatedAnimals: "Isolated Animals — Quarantine",
    detectionAccuracy: "Detection Accuracy — ANOVA Model",
    hygieneImprovement: "Hygiene Improvement Metrics",
    atRiskAnimals: "At-Risk Animal Monitor",
  };

  const contents: Record<string, React.ReactNode> = {
    totalAnimals: (
      <div className="space-y-2">
        <Row label="Total Animals" value={stats.totalAnimals} />
        <Row label="Pigs" value={stats.pigsCount} highlight="text-pink-600" />
        <Row label="Poultry" value={stats.poultryCount} highlight="text-sky-600" />
        <Row label="Healthy" value={stats.healthyAnimals} highlight="text-emerald-600" />
        <Row label="At Risk" value={stats.atRiskAnimals} highlight="text-amber-600" />
        <Row label="Infected" value={stats.infectedAnimals} highlight="text-red-600" />
      </div>
    ),
    healthyAnimals: (
      <div className="space-y-2">
        <Row label="Healthy Animals" value={stats.healthyAnimals} highlight="text-emerald-700" />
        <Row label="Percentage of Herd" value={`${Math.round((stats.healthyAnimals / total) * 100)}%`} highlight="text-emerald-700" />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {animals.filter((a) => a.healthStatus === "low").slice(0, 6).map((a) => (
            <div key={a.id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-emerald-800">{a.tag}</p>
              <p className="text-xs text-muted-foreground">{a.pen}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    activeAlerts: (
      <div className="space-y-2">
        <Row label="Total Alerts" value={alerts.length} />
        <Row label="Active (Unresolved)" value={stats.activeAlerts} highlight="text-amber-700" />
        <Row label="High Severity" value={alerts.filter((a) => a.severity === "high" && !a.resolved).length} highlight="text-red-600" />
        <Row label="Medium Severity" value={alerts.filter((a) => a.severity === "medium" && !a.resolved).length} highlight="text-amber-600" />
        <div className="space-y-2 mt-3">
          {alerts.filter((a) => !a.resolved).slice(0, 5).map((al) => (
            <div key={al.id} className={cn("p-3 rounded-lg border-l-4 text-sm", al.severity === "high" ? "border-l-red-500 bg-red-50" : "border-l-amber-500 bg-amber-50")}>
              <p className="font-medium text-foreground capitalize">[{al.type}] {al.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{al.timestamp}{al.pen ? ` · ${al.pen}` : ""}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    isolatedAnimals: (
      <div className="space-y-3">
        <Row label="Currently Isolated" value={stats.isolatedAnimals} highlight="text-red-700" />
        {animals.filter((a) => a.isIsolated).map((a) => (
          <div key={a.id} className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-foreground">{a.tag} — {a.pen}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" /><span className="text-red-700 font-medium">{a.bodyTemp}°C</span></div>
              <div><span className="text-muted-foreground">Skin:</span> <span className="font-medium text-red-700">{a.skinColorIndex}</span></div>
              <div className="flex items-center gap-1"><Activity className="w-3 h-3 text-amber-500" /><span className="font-medium">{a.activityScore}/100</span></div>
            </div>
            <p className="text-xs text-muted-foreground">Last checked: {a.lastChecked}</p>
          </div>
        ))}
      </div>
    ),
    detectionAccuracy: (
      <div className="space-y-2">
        <Row label="Detection Accuracy" value={`${stats.detectionAccuracy}%`} highlight="text-emerald-700" />
        <Row label="Model" value="Two-Way ANOVA" />
        <Row label="Baseline (pre-DFMS)" value="~61%" />
        <p className="text-xs text-muted-foreground mt-2">Two-Way ANOVA detects significant differences in health indicators across pen groups and species.</p>
      </div>
    ),
    hygieneImprovement: (
      <div className="space-y-2">
        <Row label="Hygiene Improvement" value={`+${stats.hygieneImprovement}%`} highlight="text-emerald-700" />
        <Row label="Cleaning Cycles/Day" value="3 (automated)" />
        <Row label="Ammonia Reduction" value="-28% vs baseline" highlight="text-emerald-700" />
      </div>
    ),
    atRiskAnimals: (
      <div className="space-y-2">
        <Row label="At-Risk Animals" value={stats.atRiskAnimals} highlight="text-amber-700" />
        <Row label="Monitoring Frequency" value="Every 5 min" />
        <div className="space-y-2 mt-3">
          {animals.filter((a) => a.healthStatus === "medium").map((a) => (
            <div key={a.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm flex items-center justify-between">
              <span className="font-semibold">{a.tag}</span>
              <span className="text-muted-foreground">{a.pen}</span>
              <span className="text-amber-700 font-medium">{a.bodyTemp}°C</span>
              <span className="text-xs">Activity: {a.activityScore}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[modalKey]}</DialogTitle>
          <DialogDescription>Live data from the DFMS API</DialogDescription>
        </DialogHeader>
        {contents[modalKey]}
      </DialogContent>
    </Dialog>
  );
}
