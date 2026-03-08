import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { summaryStats, animals, alerts } from "@/data/mockData";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CheckCircle2, AlertTriangle, ShieldAlert, Thermometer, Activity } from "lucide-react";

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
  const pieData = [
    { name: "Healthy", value: summaryStats.healthyAnimals, color: "hsl(142 71% 35%)" },
    { name: "At Risk", value: summaryStats.atRiskAnimals, color: "hsl(38 92% 50%)" },
    { name: "Infected", value: summaryStats.infectedAnimals, color: "hsl(0 72% 51%)" },
    { name: "Isolated", value: summaryStats.isolatedAnimals, color: "hsl(0 60% 70%)" },
  ];

  const breedDisease = [
    { breed: "Yorkshire", count: 7 }, { breed: "Berkshire", count: 5 },
    { breed: "Landrace", count: 4 }, { breed: "Duroc", count: 3 },
    { breed: "Pietrain", count: 2 }, { breed: "Tamworth", count: 1 },
  ];

  const contents: Record<string, React.ReactNode> = {
    totalAnimals: (
      <div className="space-y-4">
        <Row label="Total Animals" value={summaryStats.totalAnimals} />
        <Row label="Pigs" value={summaryStats.pigsCount} highlight="text-pink-600" />
        <Row label="Poultry" value={summaryStats.poultryCount} highlight="text-sky-600" />
        <Row label="Male / Female Split" value="~52% / 48% (estimated)" />
        <p className="text-xs text-muted-foreground pt-1">Distribution across Pen A, B, C and House 1, 2. Pigs tracked via RFID tags; poultry via vision-based counting.</p>
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Health Status Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-2">Disease by Breed (Power BI data)</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={breedDisease} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="breed" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" name="Disease Cases" fill="hsl(150 55% 28%)" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ),
    healthyAnimals: (
      <div className="space-y-4">
        <Row label="Healthy Animals" value={summaryStats.healthyAnimals} highlight="text-emerald-700" />
        <Row label="Percentage of Herd" value={`${Math.round((summaryStats.healthyAnimals / summaryStats.totalAnimals) * 100)}%`} highlight="text-emerald-700" />
        <Row label="Pigs (healthy)" value="~154 of 165" />
        <Row label="Poultry (healthy)" value="~77 of 83" />
        <Row label="Avg Body Temp (healthy)" value="38.9°C" />
        <Row label="Avg Activity Score" value="82/100" highlight="text-emerald-700" />
        <p className="text-xs text-muted-foreground">Animals are classified healthy when body temp ≤39.5°C, skin index ≤30, activity score ≥65 and no behavioral anomaly detected.</p>
        <div className="flex gap-3 mt-3">
          {animals.filter(a => a.healthStatus === "low").map(a => (
            <div key={a.id} className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-emerald-800">{a.tag}</p>
              <p className="text-xs text-muted-foreground">{a.pen}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    activeAlerts: (
      <div className="space-y-3">
        <Row label="Total Alerts" value={alerts.length} />
        <Row label="Active (Unresolved)" value={summaryStats.activeAlerts} highlight="text-amber-700" />
        <Row label="High Severity" value={alerts.filter(a => a.severity === "high" && !a.resolved).length} highlight="text-red-600" />
        <Row label="Medium Severity" value={alerts.filter(a => a.severity === "medium" && !a.resolved).length} highlight="text-amber-600" />
        {alerts.filter(a => !a.resolved).map(al => (
          <div key={al.id} className={cn("p-3 rounded-lg border-l-4 text-sm", al.severity === "high" ? "border-l-red-500 bg-red-50" : "border-l-amber-500 bg-amber-50")}>
            <p className="font-medium text-foreground capitalize">[{al.type}] {al.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{al.timestamp} · {al.pen}</p>
          </div>
        ))}
      </div>
    ),
    isolatedAnimals: (
      <div className="space-y-3">
        <Row label="Currently Isolated" value={summaryStats.isolatedAnimals} highlight="text-red-700" />
        <Row label="Isolation Protocol" value="Active" highlight="text-red-700" />
        <p className="text-sm text-muted-foreground">Animals flagged for isolation are placed in quarantine pens with restricted herd contact. Veterinary review is required before release.</p>
        {animals.filter(a => a.isIsolated).map(a => (
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
      <div className="space-y-3">
        <Row label="Detection Accuracy" value="92%" highlight="text-emerald-700" />
        <Row label="Model" value="Two-Way ANOVA" />
        <Row label="Baseline (pre-DFMS)" value="~61%" />
        <Row label="Improvement" value="+31 percentage points" highlight="text-emerald-700" />
        <Row label="False Positive Rate" value="~6%" />
        <Row label="False Negative Rate" value="~8%" />
        <p className="text-xs text-muted-foreground mt-2">Two-Way ANOVA analysis was conducted to detect statistically significant differences in health indicators across pen groups and species, achieving F(3,44)=12.7, p&lt;0.001 (temp), F(3,44)=9.3, p&lt;0.001 (activity).</p>
      </div>
    ),
    hygieneImprovement: (
      <div className="space-y-3">
        <Row label="Hygiene Improvement" value="+40%" highlight="text-emerald-700" />
        <Row label="Baseline Score (pre-DFMS)" value="~48/100" />
        <Row label="Current Score" value="67/100" highlight="text-emerald-700" />
        <Row label="Cleaning Cycles/Day" value="3 (automated)" />
        <Row label="Ammonia Reduction" value="-28% vs baseline" highlight="text-emerald-700" />
        <p className="text-xs text-muted-foreground mt-2">Automated hygiene monitoring schedules cleaning tasks based on real-time sensor thresholds (ammonia, moisture, visual cleanliness via camera feed).</p>
      </div>
    ),
    atRiskAnimals: (
      <div className="space-y-3">
        <Row label="At-Risk Animals" value={summaryStats.atRiskAnimals} highlight="text-amber-700" />
        <Row label="Monitoring Frequency" value="Every 5 min" />
        <Row label="Avg Temp (at-risk)" value="39.6°C" highlight="text-amber-600" />
        <Row label="Avg Activity Score" value="58/100" highlight="text-amber-600" />
        {animals.filter(a => a.healthStatus === "medium").map(a => (
          <div key={a.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm flex items-center justify-between">
            <span className="font-semibold">{a.tag}</span>
            <span className="text-muted-foreground">{a.pen}</span>
            <span className="text-amber-700 font-medium">{a.bodyTemp}°C</span>
            <span className="text-xs">Activity: {a.activityScore}</span>
          </div>
        ))}
      </div>
    ),
  };

  const titles: Record<string, string> = {
    totalAnimals: "Total Animal Population",
    healthyAnimals: "Healthy Animals Detail",
    activeAlerts: "Active Alerts Breakdown",
    isolatedAnimals: "Isolated Animals — Quarantine",
    detectionAccuracy: "Detection Accuracy — ANOVA Model",
    hygieneImprovement: "Hygiene Improvement Metrics",
    atRiskAnimals: "At-Risk Animal Monitor",
  };

  const descriptions: Record<string, string> = {
    totalAnimals: "Full population breakdown across all pens and poultry houses",
    healthyAnimals: "Animals with normal vitals and no behavioral anomalies",
    activeAlerts: "Live unresolved alerts requiring immediate action",
    isolatedAnimals: "Animals currently under biosecurity isolation protocol",
    detectionAccuracy: "Two-Way ANOVA statistical model performance metrics",
    hygieneImprovement: "Hygiene improvements since DFMS deployment",
    atRiskAnimals: "Medium-risk animals under close observation",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalKey ? titles[modalKey] : ""}</DialogTitle>
          <DialogDescription>{modalKey ? descriptions[modalKey] : ""}</DialogDescription>
        </DialogHeader>
        {modalKey && contents[modalKey]}
      </DialogContent>
    </Dialog>
  );
}
