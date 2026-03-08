import { animals as initialAnimals } from "@/data/mockData";
import { RiskBadge } from "@/components/RiskBadge";
import { Thermometer, Activity, Eye, ShieldAlert, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Animal } from "@/data/mockData";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

function jitter(val: number, range: number, min: number, max: number) {
  return Math.min(max, Math.max(min, parseFloat((val + (Math.random() - 0.5) * range).toFixed(1))));
}

export function AnimalHealthTable() {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("just now");

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setAnimals(prev => prev.map(a => ({
        ...a,
        bodyTemp: jitter(a.bodyTemp, 0.4, 37.5, 43),
        skinColorIndex: jitter(a.skinColorIndex, 4, 0, 100),
        activityScore: jitter(a.activityScore, 5, 0, 100),
        lastChecked: "just now",
      })));
      const now = new Date();
      setLastUpdated(`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`);
      setRefreshing(false);
    }, 800);
  }

  return (
    <div id="health-table-section" className="bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-foreground">Animal Health Monitor</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live sensor readings per animal</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
          <DownloadPDFButton sectionId="health-table-section" filename="animal-health-table" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Tag</th>
              <th className="px-4 py-3 text-left">Species</th>
              <th className="px-4 py-3 text-left">Pen</th>
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Temp (°C)</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Skin Index</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Activity</span>
              </th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Isolated</th>
            </tr>
          </thead>
          <tbody>
            {animals.map((a) => (
              <tr
                key={a.id}
                className={cn(
                  "border-t transition-colors hover:bg-muted/30",
                  a.healthStatus === "high" && "bg-red-50/60",
                  a.isIsolated && "opacity-75"
                )}
              >
                <td className="px-4 py-3 font-medium font-display">{a.tag}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded", a.species === "pig" ? "bg-pink-100 text-pink-700" : "bg-sky-100 text-sky-700")}>
                    {a.species}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{a.pen}</td>
                <td className="px-4 py-3">
                  <span className={cn("font-semibold", a.bodyTemp > 40 ? "text-red-600" : a.bodyTemp > 39.5 ? "text-amber-600" : "text-emerald-600")}>
                    {a.bodyTemp}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                      <div className={cn("h-1.5 rounded-full", a.skinColorIndex > 50 ? "bg-red-500" : a.skinColorIndex > 25 ? "bg-amber-400" : "bg-emerald-500")}
                        style={{ width: `${a.skinColorIndex}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{a.skinColorIndex}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                      <div className={cn("h-1.5 rounded-full", a.activityScore < 40 ? "bg-red-500" : a.activityScore < 65 ? "bg-amber-400" : "bg-emerald-500")}
                        style={{ width: `${a.activityScore}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{a.activityScore}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><RiskBadge level={a.healthStatus} /></td>
                <td className="px-4 py-3">
                  {a.isIsolated ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      <ShieldAlert className="w-3 h-3" /> Isolated
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 bg-muted/30 border-t text-xs text-muted-foreground">
        Showing {animals.length} animals · Last updated {lastUpdated}
      </div>
    </div>
  );
}
