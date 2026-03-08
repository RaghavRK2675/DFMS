import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/mockData";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const config: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low Risk", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  medium: { label: "Medium Risk", className: "bg-amber-100 text-amber-800 border-amber-200" },
  high: { label: "High Risk", className: "bg-red-100 text-red-800 border-red-200" },
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const { label, className: lvlClass } = config[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border", lvlClass, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-emerald-500": level === "low",
        "bg-amber-500": level === "medium",
        "bg-red-500": level === "high",
      })} />
      {label}
    </span>
  );
}
