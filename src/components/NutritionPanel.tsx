import { useFeedRecords, useNutritionProfiles } from "@/hooks/useDfmsData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Leaf, Loader2 } from "lucide-react";
import { useState } from "react";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

export function NutritionPanel() {
  const [tab, setTab] = useState<"pig" | "poultry">("pig");
  const { data: feed = [], isLoading: feedLoading } = useFeedRecords();
  const { data: profiles, isLoading: profLoading } = useNutritionProfiles();
  const nutrition = (tab === "pig" ? profiles?.pig : profiles?.poultry) ?? [];

  return (
    <div id="nutrition-section" className="bg-card rounded-xl border shadow-card">
      <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-primary" />
          <div>
            <h3 className="font-display font-semibold text-foreground">Nutrition & Feed Tracking</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Weekly consumption · Nutritional profiles per growth stage</p>
          </div>
        </div>
        <DownloadPDFButton sectionId="nutrition-section" filename="nutrition-tracking" />
      </div>

      <div className="px-5 pt-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">Weekly Feed Consumption (kg)</p>
        {feedLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feed} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 10% 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="pigStarter" name="Pig Starter" fill="#f472b6" radius={[3,3,0,0]} />
              <Bar dataKey="pigGrower" name="Pig Grower" fill="#fb923c" radius={[3,3,0,0]} />
              <Bar dataKey="pigFinisher" name="Pig Finisher" fill="#a78bfa" radius={[3,3,0,0]} />
              <Bar dataKey="poultryLayer" name="Poultry Layer" fill="#34d399" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="px-5 pb-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-medium text-muted-foreground">Nutritional Profile —</p>
          <div className="flex gap-1">
            {(["pig", "poultry"] as const).map((s) => (
              <button key={s} onClick={() => setTab(s)} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors capitalize ${tab === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {profLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase tracking-wide">
                  <th className="py-2 text-left">Stage</th>
                  <th className="py-2 text-right">Protein (%)</th>
                  <th className="py-2 text-right">Energy (kcal)</th>
                  <th className="py-2 text-right">Lysine (%)</th>
                  <th className="py-2 text-right">Threonine (%)</th>
                  <th className="py-2 text-right">Minerals (%)</th>
                </tr>
              </thead>
              <tbody>
                {nutrition.map((n: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 font-medium text-foreground">{n.stage}</td>
                    <td className="py-2 text-right text-foreground">{n.crudeProtein}</td>
                    <td className="py-2 text-right text-foreground">{n.energy}</td>
                    <td className="py-2 text-right text-foreground">{n.lysine}</td>
                    <td className="py-2 text-right text-foreground">{n.threonine}</td>
                    <td className="py-2 text-right text-foreground">{n.minerals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
