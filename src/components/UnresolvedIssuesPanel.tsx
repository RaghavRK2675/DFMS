import { useAlerts } from "@/hooks/useDfmsData";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Wind, Leaf, Info, TrendingDown,
  IndianRupee, Clock, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { useState } from "react";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";
import type { Alert } from "@/data/mockData";

const iconMap = {
  disease: AlertTriangle,
  environment: Wind,
  nutrition: Leaf,
  behavior: Info,
};

const consequences: Record<string, { impact: string; economic: string; timeline: string; solution: string }> = {
  disease: {
    impact: "Potential herd-wide outbreak within 48–72 h if uncontained. Mortality risk: 15–30% of affected pen.",
    economic: "₹8,000–₹25,000 per infected animal. Potential pen quarantine cost: ₹40,000+",
    timeline: "Action required within 2 hours",
    solution: "Isolate, administer antipyretics, call vet, disinfect pen, run PCR test",
  },
  environment: {
    impact: "Chronic ammonia exposure (>25 ppm) causes respiratory damage, reducing growth rate by 12–18%",
    economic: "Feed conversion ratio worsens by 0.3–0.5 points, costing ₹4,000–₹9,000/week",
    timeline: "Ventilation fix within 6 hours",
    solution: "Increase fan speed, schedule cleaning, check filters, recalibrate sensors",
  },
  nutrition: {
    impact: "Under-feeding for 2+ days suppresses immunity and reduces daily weight gain by up to 200g/day",
    economic: "Market delay of 1–2 weeks = ₹3,500–₹7,000 loss per pen batch",
    timeline: "Feeder inspection within 4 hours",
    solution: "Inspect feeder blockage, verify water supply, adjust DFMS feed schedule",
  },
  behavior: {
    impact: "Behavioral anomalies are early indicators — if unaddressed, 60% escalate to clinical disease within 72 h",
    economic: "Treatment costs if escalated: ₹5,000–₹15,000. Early action saves 80% of this cost",
    timeline: "Monitoring every 15 minutes",
    solution: "Visual inspection, vet notification if temp >39.8°C, check for overcrowding",
  },
};

function IssueCard({ alert }: { alert: Alert }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[alert.type];
  const cons = consequences[alert.type];

  return (
    <div className={cn("rounded-xl border overflow-hidden", alert.severity === "high" ? "border-red-200" : "border-amber-200")}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn("w-full flex items-start gap-3 p-4 text-left hover:opacity-90 transition-opacity",
          alert.severity === "high" ? "bg-red-50" : "bg-amber-50"
        )}
      >
        <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", alert.severity === "high" ? "text-red-600" : "text-amber-600")} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{alert.message}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={cn("text-xs font-bold uppercase px-2 py-0.5 rounded-full",
              alert.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            )}>{alert.severity}</span>
            <span className="text-xs text-muted-foreground capitalize">{alert.type}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />{alert.timestamp}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-4 border-t bg-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-red-50 border border-red-100 p-3">
              <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Health Impact</p>
              <p className="text-xs text-muted-foreground">{cons.impact}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Economic Impact</p>
              <p className="text-xs text-muted-foreground">{cons.economic}</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time to Act</p>
              <p className="text-xs font-medium text-blue-800">{cons.timeline}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">✅ Recommended Resolution Steps</p>
            <p className="text-xs text-muted-foreground">{cons.solution}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function UnresolvedIssuesPanel() {
  const { data: alerts = [], isLoading } = useAlerts();
  const unresolved = alerts.filter((a) => !a.resolved);
  const highCount = unresolved.filter((a) => a.severity === "high").length;
  const medCount = unresolved.filter((a) => a.severity === "medium").length;
  const revenueAtRisk = highCount * 25000 + medCount * 7000;

  return (
    <div id="unresolved-section" className="bg-card rounded-xl border shadow-card">
      <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Unresolved Issues & Consequences
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unresolved.length} unresolved · {highCount} critical · {medCount} moderate
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <span className="text-xs font-medium text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
            {highCount} Critical Action Required
          </span>
          <DownloadPDFButton sectionId="unresolved-section" filename="unresolved-issues" />
        </div>
      </div>

      <div className="px-5 py-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Unresolved", value: unresolved.length, color: "text-foreground" },
          { label: "High Severity", value: highCount, color: "text-red-700" },
          { label: "Medium Severity", value: medCount, color: "text-amber-700" },
          { label: "Potential Revenue at Risk", value: `₹${revenueAtRisk.toLocaleString("en-IN")}+`, color: "text-red-700" },
        ].map((s) => (
          <div key={s.label} className="text-center rounded-lg bg-muted/50 p-3 border">
            <p className={cn("text-2xl font-display font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-5 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : unresolved.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">🎉 All issues resolved!</p>
        ) : (
          unresolved.map((alert) => <IssueCard key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
