import { cn } from "@/lib/utils";

interface GaugeMeterProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  thresholds: { warn: number; danger: number };
  size?: "sm" | "md";
}

function getColor(value: number, thresholds: { warn: number; danger: number }) {
  if (value >= thresholds.danger) return { stroke: "#ef4444", text: "text-red-600", bg: "bg-red-100" };
  if (value >= thresholds.warn) return { stroke: "#f59e0b", text: "text-amber-600", bg: "bg-amber-100" };
  return { stroke: "#10b981", text: "text-emerald-600", bg: "bg-emerald-100" };
}

export function GaugeMeter({ value, max, label, unit, thresholds, size = "md" }: GaugeMeterProps) {
  const pct = Math.min(value / max, 1);
  const radius = size === "sm" ? 32 : 42;
  const cx = size === "sm" ? 40 : 54;
  const cy = size === "sm" ? 40 : 54;
  const viewBox = size === "sm" ? "0 0 80 80" : "0 0 108 108";
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const { stroke, text, bg } = getColor(value, thresholds);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg viewBox={viewBox} className={size === "sm" ? "w-20 h-20" : "w-28 h-28"}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(120 10% 90%)" strokeWidth="8" />
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display font-bold leading-none", text, size === "sm" ? "text-lg" : "text-2xl")}>{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-center text-muted-foreground leading-tight">{label}</span>
    </div>
  );
}
