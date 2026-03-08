import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { summaryStats } from "@/data/mockData";

interface Props {
  open: boolean;
  onClose: () => void;
  type: "bri" | "dsi" | "healthy" | "atRisk" | "infected" | null;
}

export function DiseaseRiskDetailModal({ open, onClose, type }: Props) {
  const titles: Record<string, string> = {
    bri: "Biosecurity Risk Index (BRI)",
    dsi: "Disease Susceptibility Index (DSI)",
    healthy: "Healthy Animals — Full Detail",
    atRisk: "At-Risk Animals — Monitoring Data",
    infected: "Infected Animals — Clinical Status",
  };

  const contents: Record<string, React.ReactNode> = {
    bri: (
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-3xl font-display font-bold text-amber-700">{summaryStats.biosecurityRiskIndex.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Score out of 1.00 · Moderate Risk threshold: 0.40</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Formula</p>
          <code className="block text-xs bg-muted p-3 rounded-lg">BRI = w₁·Td + w₂·Hd + w₃·Ad + w₄·Bs</code>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {[
              ["w₁ (Temp weight)", "0.30"], ["Td (Temp deviation)", "0.48"],
              ["w₂ (Humidity weight)", "0.25"], ["Hd (Humidity deviation)", "0.35"],
              ["w₃ (Ammonia weight)", "0.25"], ["Ad (Ammonia deviation)", "0.52"],
              ["w₄ (Behavior weight)", "0.20"], ["Bs (Behavior stress)", "0.28"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border rounded px-2 py-1.5">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Risk Thresholds</p>
          {[
            { label: "Low Risk", range: "< 0.40", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "Moderate Risk", range: "0.40 – 0.69", color: "text-amber-700 bg-amber-50 border-amber-200" },
            { label: "High Risk", range: "≥ 0.70", color: "text-red-700 bg-red-50 border-red-200" },
          ].map(t => (
            <div key={t.label} className={cn("flex justify-between rounded-lg border px-3 py-2 text-sm mb-1.5", t.color)}>
              <span className="font-medium">{t.label}</span>
              <span>{t.range}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Current BRI of 0.41 indicates moderate biosecurity risk. Primary driver: elevated ammonia (29 ppm). Recommend immediate ventilation improvement.</p>
      </div>
    ),
    dsi: (
      <div className="space-y-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-3xl font-display font-bold text-emerald-700">{summaryStats.diseaseSusceptibilityIndex.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Score out of 1.00 · Current status: Low Risk</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Formula</p>
          <code className="block text-xs bg-muted p-3 rounded-lg">DSI = α·Ed + β·Nd + γ·Bs</code>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {[
              ["α (Env weight)", "0.40"], ["Ed (Environment deviation)", "0.30"],
              ["β (Nutrition weight)", "0.35"], ["Nd (Nutrition deviation)", "0.22"],
              ["γ (Behavior weight)", "0.25"], ["Bs (Behavior stress)", "0.28"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border rounded px-2 py-1.5">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">DSI of 0.32 indicates low susceptibility. Nutritional compliance is strong. Continue regular monitoring and maintain hygiene score above 70.</p>
      </div>
    ),
    healthy: (
      <div className="space-y-3">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <p className="text-4xl font-display font-bold text-emerald-700">{summaryStats.healthyAnimals}</p>
          <p className="text-sm text-muted-foreground">Healthy Animals ({Math.round((summaryStats.healthyAnimals / summaryStats.totalAnimals) * 100)}% of herd)</p>
        </div>
        <p className="text-sm text-muted-foreground">All healthy animals meet the DFMS wellness criteria: body temp ≤39.5°C, skin color index ≤30, activity score ≥65, no behavioral anomalies detected in last 24h.</p>
        {[["Pigs (healthy)", "~154"], ["Poultry (healthy)", "~77"], ["Avg temp", "38.9°C"], ["Avg activity", "82/100"], ["Avg skin index", "14"]].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm border-b py-1.5">
            <span className="text-muted-foreground">{k}</span><span className="font-semibold text-emerald-700">{v}</span>
          </div>
        ))}
      </div>
    ),
    atRisk: (
      <div className="space-y-3">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-4xl font-display font-bold text-amber-700">{summaryStats.atRiskAnimals}</p>
          <p className="text-sm text-muted-foreground">At-Risk Animals — Medium Risk Level</p>
        </div>
        <p className="text-sm text-muted-foreground">Medium risk animals show elevated vitals or behavioral deviation. They are monitored every 5 minutes and auto-escalated to high-risk if thresholds are crossed.</p>
        <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong>Trigger conditions:</strong> Body temp 39.5–40.0°C, skin index 30–55, activity score 40–65, or mild behavioral stress detected by vision system.
        </p>
        {[["Monitoring interval", "5 minutes"], ["Auto-escalation threshold", "Temp >40°C or Activity <40"], ["Avg temp", "39.6°C"], ["Avg activity score", "58/100"]].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm border-b py-1.5">
            <span className="text-muted-foreground">{k}</span><span className="font-semibold text-amber-700">{v}</span>
          </div>
        ))}
      </div>
    ),
    infected: (
      <div className="space-y-3">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-4xl font-display font-bold text-red-700">{summaryStats.infectedAnimals}</p>
          <p className="text-sm text-muted-foreground">Infected Animals — High Risk / Under Treatment</p>
        </div>
        <p className="text-sm text-muted-foreground">All infected animals are isolated in quarantine pens. A veterinary treatment protocol is active. Disease containment measures are in place per DFMS biosecurity SOP.</p>
        {[
          ["Suspected disease", "Swine Fever (1), Avian Infection (1)"],
          ["Isolation pen", "Pen Q1, House Q1"],
          ["Treatment started", "Today, 14:35"],
          ["Expected review", "Within 24 hours"],
          ["Herd lockdown", "Pen A, House 1 — restricted"],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:justify-between text-sm border-b py-1.5 gap-0.5">
            <span className="text-muted-foreground">{k}</span><span className="font-semibold text-red-700">{v}</span>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type ? titles[type] : ""}</DialogTitle>
          <DialogDescription>Detailed statistical breakdown from Two-Way ANOVA DFMS model</DialogDescription>
        </DialogHeader>
        {type && contents[type]}
      </DialogContent>
    </Dialog>
  );
}
