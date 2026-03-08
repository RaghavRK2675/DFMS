import { summaryStats } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DiseaseRiskDetailModal } from "@/components/DiseaseRiskDetailModal";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

type ModalType = "bri" | "dsi" | "healthy" | "atRisk" | "infected" | null;

interface RiskIndexCardProps {
  title: string;
  value: number;
  description: string;
  formula: string;
  onDetails: () => void;
}

function getRiskColor(v: number) {
  if (v >= 0.7) return { bar: "bg-red-500", text: "text-red-600", label: "High Risk" };
  if (v >= 0.4) return { bar: "bg-amber-500", text: "text-amber-600", label: "Moderate Risk" };
  return { bar: "bg-emerald-500", text: "text-emerald-600", label: "Low Risk" };
}

function RiskIndexCard({ title, value, description, formula, onDetails }: RiskIndexCardProps) {
  const colors = getRiskColor(value);
  const pct = Math.round(value * 100);
  return (
    <div
      onClick={onDetails}
      className="border rounded-xl p-4 bg-card cursor-pointer hover:shadow-elevated hover:scale-[1.01] transition-all duration-150"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", colors.text, "bg-opacity-10")}>
            {colors.label}
          </span>
          <span className="text-xs text-muted-foreground opacity-60">Details →</span>
        </div>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className={cn("text-3xl font-display font-bold", colors.text)}>{value.toFixed(2)}</span>
        <span className="text-sm text-muted-foreground mb-1">/ 1.00</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-2">
        <div className={cn("h-2 rounded-full transition-all", colors.bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <code className="text-xs text-muted-foreground/70 mt-1 block">{formula}</code>
    </div>
  );
}

export function DiseaseRiskPanel() {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <div id="disease-risk-section" className="bg-card rounded-xl border shadow-card">
        <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-semibold text-foreground">Disease & Biosecurity Risk Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Statistical indices derived from Two-Way ANOVA model · 92% detection accuracy</p>
          </div>
          <DownloadPDFButton sectionId="disease-risk-section" filename="disease-risk-analysis" />
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RiskIndexCard
            title="Biosecurity Risk Index (BRI)"
            value={summaryStats.biosecurityRiskIndex}
            description="Composite risk from temperature deviation, humidity, ammonia levels & behavioral stress."
            formula="BRI = w₁·Td + w₂·Hd + w₃·Ad + w₄·Bs"
            onDetails={() => setModal("bri")}
          />
          <RiskIndexCard
            title="Disease Susceptibility Index (DSI)"
            value={summaryStats.diseaseSusceptibilityIndex}
            description="Risk based on environmental deviation, nutritional imbalance, and vision-based behavioral stress."
            formula="DSI = α·Ed + β·Nd + γ·Bs"
            onDetails={() => setModal("dsi")}
          />
        </div>
        {/* Animal distribution */}
        <div className="px-5 pb-5 grid grid-cols-3 gap-3">
          {[
            { label: "Healthy", count: summaryStats.healthyAnimals, color: "text-emerald-700 bg-emerald-50 border-emerald-200", key: "healthy" as ModalType },
            { label: "At Risk", count: summaryStats.atRiskAnimals, color: "text-amber-700 bg-amber-50 border-amber-200", key: "atRisk" as ModalType },
            { label: "Infected", count: summaryStats.infectedAnimals, color: "text-red-700 bg-red-50 border-red-200", key: "infected" as ModalType },
          ].map(item => (
            <div
              key={item.label}
              onClick={() => setModal(item.key)}
              className={cn("rounded-xl border p-4 text-center cursor-pointer hover:scale-[1.02] hover:shadow-elevated transition-all duration-150", item.color)}
            >
              <div className="text-2xl font-display font-bold">{item.count}</div>
              <div className="text-xs font-medium mt-0.5">{item.label}</div>
              <div className="text-xs opacity-60 mt-0.5">Details →</div>
            </div>
          ))}
        </div>
      </div>
      <DiseaseRiskDetailModal open={!!modal} onClose={() => setModal(null)} type={modal} />
    </>
  );
}
