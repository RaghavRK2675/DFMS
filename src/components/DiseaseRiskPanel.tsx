import { summaryStats } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface RiskIndexCardProps {
  title: string;
  value: number;
  description: string;
  formula: string;
}

function getRiskColor(v: number) {
  if (v >= 0.7) return { bar: "bg-red-500", text: "text-red-600", label: "High Risk" };
  if (v >= 0.4) return { bar: "bg-amber-500", text: "text-amber-600", label: "Moderate Risk" };
  return { bar: "bg-emerald-500", text: "text-emerald-600", label: "Low Risk" };
}

function RiskIndexCard({ title, value, description, formula }: RiskIndexCardProps) {
  const colors = getRiskColor(value);
  const pct = Math.round(value * 100);
  return (
    <div className="border rounded-xl p-4 bg-card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", colors.text, "bg-opacity-10")}>
          {colors.label}
        </span>
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
  return (
    <div className="bg-card rounded-xl border shadow-card">
      <div className="px-5 py-4 border-b">
        <h3 className="font-display font-semibold text-foreground">Disease & Biosecurity Risk Analysis</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Statistical indices derived from Two-Way ANOVA model · 92% detection accuracy</p>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RiskIndexCard
          title="Biosecurity Risk Index (BRI)"
          value={summaryStats.biosecurityRiskIndex}
          description="Composite risk from temperature deviation, humidity, ammonia levels & behavioral stress."
          formula="BRI = w₁·Td + w₂·Hd + w₃·Ad + w₄·Bs"
        />
        <RiskIndexCard
          title="Disease Susceptibility Index (DSI)"
          value={summaryStats.diseaseSusceptibilityIndex}
          description="Risk based on environmental deviation, nutritional imbalance, and vision-based behavioral stress."
          formula="DSI = α·Ed + β·Nd + γ·Bs"
        />
      </div>
      {/* Animal distribution */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Healthy", count: summaryStats.healthyAnimals, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "At Risk", count: summaryStats.atRiskAnimals, color: "text-amber-700 bg-amber-50 border-amber-200" },
          { label: "Infected", count: summaryStats.infectedAnimals, color: "text-red-700 bg-red-50 border-red-200" },
        ].map(item => (
          <div key={item.label} className={cn("rounded-xl border p-4 text-center", item.color)}>
            <div className="text-2xl font-display font-bold">{item.count}</div>
            <div className="text-xs font-medium mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
