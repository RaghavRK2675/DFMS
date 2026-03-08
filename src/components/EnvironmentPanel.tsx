import { environmentTrend, currentEnv } from "@/data/mockData";
import { GaugeMeter } from "@/components/GaugeMeter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Thermometer, Droplets, Wind, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="bg-card rounded-xl border shadow-card">
      <div className="px-5 py-4 border-b">
        <h3 className="font-display font-semibold text-foreground">Environmental Monitoring</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Temperature · Humidity · Ammonia · Hygiene — 12h trend</p>
      </div>

      {/* Gauges */}
      <div className="px-5 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GaugeMeter value={currentEnv.temperature} max={45} label="Temperature" unit="°C" thresholds={{ warn: 28, danger: 32 }} />
        <GaugeMeter value={currentEnv.humidity} max={100} label="Humidity" unit="%" thresholds={{ warn: 70, danger: 85 }} />
        <GaugeMeter value={currentEnv.ammonia} max={50} label="Ammonia" unit="ppm" thresholds={{ warn: 25, danger: 35 }} />
        <GaugeMeter value={currentEnv.hygieneScore} max={100} label="Hygiene Score" unit="/100" thresholds={{ warn: 120, danger: 140 }} />
      </div>

      {/* Status row */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusChip value={`${currentEnv.temperature}°C`} label="Ambient Temp" good={currentEnv.temperature < 30} />
        <StatusChip value={`${currentEnv.humidity}%`} label="Humidity" good={currentEnv.humidity < 70} />
        <StatusChip value={`${currentEnv.ammonia} ppm`} label="Ammonia" good={currentEnv.ammonia < 25} />
        <StatusChip value={currentEnv.airQuality} label="Air Quality" good={currentEnv.airQuality === "Good"} />
      </div>

      {/* Trend chart */}
      <div className="px-5 pb-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">12-Hour Trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={environmentTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 10% 90%)" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {envMetrics.map(m => (
              <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} name={`${m.label} (${m.unit})`} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
