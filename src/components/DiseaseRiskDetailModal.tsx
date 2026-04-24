import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SummaryStats } from "@/data/mockData";

interface Props {
  open: boolean;
  onClose: () => void;
  type: "bri" | "dsi" | "healthy" | "atRisk" | "infected" | null;
  stats?: SummaryStats;
}

export function DiseaseRiskDetailModal({ open, onClose, type, stats }: Props) {
  const titles: Record<string, string> = {
    bri: "Biosecurity Risk Index (BRI)",
    dsi: "Disease Susceptibility Index (DSI)",
    healthy: "Healthy Animals — Full Detail",
    atRisk: "At-Risk Animals — Monitoring Data",
    infected: "Infected Animals — Clinical Status",
  };

  if (!type) return null;
  const bri = stats?.biosecurityRiskIndex ?? 0;
  const dsi = stats?.diseaseSusceptibilityIndex ?? 0;

  const contents: Record<string, React.ReactNode> = {
    bri: (
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-3xl font-display font-bold text-amber-700">{bri.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Score out of 1.00 · Moderate Risk threshold: 0.40</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Formula</p>
          <code className="block text-xs bg-muted p-3 rounded-lg">BRI = w₁·Td + w₂·Hd + w₃·Ad + w₄·Bs</code>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Risk Thresholds</p>
          {[
            { label: "Low Risk", range: "< 0.40", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "Moderate Risk", range: "0.40 – 0.69", color: "text-amber-700 bg-amber-50 border-amber-200" },
            { label: "High Risk", range: "≥ 0.70", color: "text-red-700 bg-red-50 border-red-200" },
          ].map((t) => (
            <div key={t.label} className={cn("flex justify-between rounded-lg border px-3 py-2 text-sm mb-1.5", t.color)}>
              <span className="font-medium">{t.label}</span>
              <span>{t.range}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    dsi: (
      <div className="space-y-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-3xl font-display font-bold text-emerald-700">{dsi.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Score out of 1.00</p>
        </div>
        <code className="block text-xs bg-muted p-3 rounded-lg">DSI = α·Ed + β·Nd + γ·Bs</code>
        <p className="text-xs text-muted-foreground">Computed live from current animal vitals on the server.</p>
      </div>
    ),
    healthy: (
      <div className="space-y-3">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <p className="text-4xl font-display font-bold text-emerald-700">{stats?.healthyAnimals ?? 0}</p>
          <p className="text-sm text-muted-foreground">Healthy Animals</p>
        </div>
        <p className="text-sm text-muted-foreground">Body temp ≤ 39.5°C · skin index ≤ 30 · activity ≥ 65 · no behavioral anomaly.</p>
      </div>
    ),
    atRisk: (
      <div className="space-y-3">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-4xl font-display font-bold text-amber-700">{stats?.atRiskAnimals ?? 0}</p>
          <p className="text-sm text-muted-foreground">At-Risk Animals — Medium Risk</p>
        </div>
        <p className="text-sm text-muted-foreground">Body temp 39.5–40.0°C · skin 30–55 · activity 40–65. Monitored every 5 min.</p>
      </div>
    ),
    infected: (
      <div className="space-y-3">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-4xl font-display font-bold text-red-700">{stats?.infectedAnimals ?? 0}</p>
          <p className="text-sm text-muted-foreground">Infected Animals — Quarantined</p>
        </div>
        <p className="text-sm text-muted-foreground">Animals isolated under DFMS biosecurity SOP.</p>
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
          <DialogDescription>Live data from the DFMS API · Two-Way ANOVA model</DialogDescription>
        </DialogHeader>
        {contents[type]}
      </DialogContent>
    </Dialog>
  );
}
