import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Alert } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { AlertTriangle, Wind, Leaf, Info, CheckCircle2, Clock, MapPin, Tag } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  alert: Alert | null;
}

const iconMap = {
  disease: AlertTriangle,
  environment: Wind,
  nutrition: Leaf,
  behavior: Info,
};

const severityBg = {
  high: "bg-red-50 border-red-200",
  medium: "bg-amber-50 border-amber-200",
  low: "bg-blue-50 border-blue-200",
};

const consequences: Record<string, string[]> = {
  disease: [
    "Rapid spread to adjacent pens if not contained",
    "Increased mortality risk within 48–72 hours",
    "Economic loss: estimated ₹8,000–₹25,000 per infected animal",
    "Mandatory reporting to state veterinary authority (ASF, PED, PRRS)",
  ],
  environment: [
    "Prolonged ammonia exposure causes respiratory damage",
    "High humidity accelerates bacterial growth (E. coli, Salmonella)",
    "Heat stress reduces feed intake and growth rate by up to 20%",
    "Poor air quality correlates with higher disease susceptibility (DSI ↑)",
  ],
  nutrition: [
    "Under-feeding stunts growth rate and FCR",
    "Nutrient deficiency weakens immune response",
    "Weight target miss leads to market delay and revenue loss",
    "Chronic underfeeding may trigger aggressive behavior",
  ],
  behavior: [
    "Social isolation often precedes clinical disease onset",
    "Reduced activity is correlated with fever and infection",
    "Behavioral anomalies detected by vision system — vet review recommended",
    "Unaddressed stress leads to weight loss and immune suppression",
  ],
};

const solutions: Record<string, string[]> = {
  disease: [
    "Immediately isolate affected animal(s) to quarantine pen",
    "Administer antipyretics and notify farm veterinarian",
    "Disinfect all shared equipment and pen surfaces",
    "Run PCR/swab diagnostic tests within 24 hours",
    "Place entire pen under observation lockdown",
  ],
  environment: [
    "Increase ventilation fan speed — target ammonia <20 ppm",
    "Schedule deep-clean and disinfection within 6 hours",
    "Adjust cooling / misting system settings",
    "Check and replace air filters if clogged",
    "Re-calibrate ammonia and humidity sensors",
  ],
  nutrition: [
    "Inspect feeder for mechanical blockage",
    "Verify water supply and nipple drinker function",
    "Adjust feed schedule in DFMS feeding module",
    "Cross-check feed batch quality (moisture, mold)",
    "Increase pen monitoring frequency for 48 hours",
  ],
  behavior: [
    "Conduct visual inspection of affected animal",
    "Record activity score and compare to 7-day baseline",
    "Isolate if body temperature exceeds 39.8°C",
    "Engage veterinarian if symptoms persist >12 hours",
    "Check for social stress (overcrowding) in pen",
  ],
};

export function AlertDetailModal({ open, onClose, alert }: Props) {
  if (!alert) return null;
  const Icon = iconMap[alert.type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Alert Detail — {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
          </DialogTitle>
          <DialogDescription>Full breakdown, consequences, and recommended actions</DialogDescription>
        </DialogHeader>

        {/* Alert card */}
        <div className={cn("rounded-xl border p-4 text-sm", severityBg[alert.severity])}>
          <p className="font-medium text-foreground">{alert.message}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{alert.timestamp}</span>
            {alert.pen && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{alert.pen}</span>}
            {alert.animal && <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{alert.animal}</span>}
            {alert.resolved && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />Resolved
              </span>
            )}
          </div>
        </div>

        {/* Severity indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</span>
          <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase",
            alert.severity === "high" ? "bg-red-100 text-red-700" :
            alert.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
          )}>{alert.severity}</span>
        </div>

        {/* Consequences */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">⚠️ Potential Consequences if Unresolved</h4>
          <ul className="space-y-1.5">
            {consequences[alert.type].map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">✅ Recommended Actions</h4>
          <ol className="space-y-1.5 list-none">
            {solutions[alert.type].map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
