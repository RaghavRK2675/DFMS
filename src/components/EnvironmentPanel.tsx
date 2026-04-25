import { useEnvTrend, useCurrentEnv } from "@/hooks/useDfmsData";
import { GaugeMeter } from "@/components/GaugeMeter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

const envMetrics = [
  { key: "temperature", label: "Temperature", color: "#f97316", unit: "°C" },
  { key: "humidity", label: "Humidity", color: "#3b82f6", unit: "%" },
  { key: "ammonia", label: "Ammonia", color: "#a855f7", unit: "ppm" },
];

function StatusChip({ value, label, good }: { value: string | number; label: string; good: boolean }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-3 rounded-xl border", good ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
      <span className={cn("text-lg font-display font-bold", good ? "text-emerald-700" : "text-red-600")}>{value}</span>
      <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

export function EnvironmentPanel() {
  const { data: trend = [], isLoading: trendLoading } = useEnvTrend();
  const { data: current, isLoading: curLoading } = useCurrentEnv();

  const env = current ?? { temperature: 0, humidity: 0, ammonia: 0, hygieneScore: 0, airQuality: "—" };

  return (
    <div id="environment-section" className="bg-card rounded-xl border shadow-card">
      <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-display font-semibold text-foreground">Environmental Monitoring</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Temperature · Humidity · Ammonia · Hygiene — 12h trend</p>
        </div>
        <DownloadPDFButton sectionId="environment-section" filename="environment-monitoring" />
      </div>

      {curLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="px-5 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GaugeMeter value={env.temperature} max={45} label="Temperature" unit="°C" thresholds={{ warn: 28, danger: 32 }} />
            <GaugeMeter value={env.humidity} max={100} label="Humidity" unit="%" thresholds={{ warn: 70, danger: 85 }} />
            <GaugeMeter value={env.ammonia} max={50} label="Ammonia" unit="ppm" thresholds={{ warn: 25, danger: 35 }} />
            <GaugeMeter value={env.hygieneScore} max={100} label="Hygiene Score" unit="/100" thresholds={{ warn: 120, danger: 140 }} />
          </div>

          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatusChip value={`${env.temperature}°C`} label="Ambient Temp" good={env.temperature < 30} />
            <StatusChip value={`${env.humidity}%`} label="Humidity" good={env.humidity < 70} />
            <StatusChip value={`${env.ammonia} ppm`} label="Ammonia" good={env.ammonia < 25} />
            <StatusChip
              value={env.ammonia < 20 ? "Good" : env.ammonia < 30 ? "Fair" : "Poor"}
              label="Air Quality"
              good={env.ammonia < 20}
            />
          </div>
        </>
      )}

      <div className="px-5 pb-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">12-Hour Trend</p>
        {trendLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 10% 90%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {envMetrics.map((m) => (
                <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} name={`${m.label} (${m.unit})`} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
