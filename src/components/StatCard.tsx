import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  onClick?: () => void;
  modalKey?: string;
}

const variantStyles: Record<string, { bg: string; icon: string; border: string }> = {
  default: { bg: "bg-card", icon: "bg-primary/10 text-primary", border: "border-border" },
  success: { bg: "bg-card", icon: "bg-emerald-100 text-emerald-700", border: "border-emerald-100" },
  warning: { bg: "bg-card", icon: "bg-amber-100 text-amber-700", border: "border-amber-100" },
  danger:  { bg: "bg-card", icon: "bg-red-100 text-red-700", border: "border-red-100" },
  info:    { bg: "bg-card", icon: "bg-blue-100 text-blue-700", border: "border-blue-100" },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default", className, onClick }: StatCardProps) {
  const styles = variantStyles[variant];
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-5 shadow-card flex flex-col gap-3",
        styles.bg, styles.border, className,
        onClick && "cursor-pointer hover:shadow-elevated hover:scale-[1.02] transition-all duration-150"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-lg", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", trend.up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
        {onClick && (
          <span className="text-xs text-muted-foreground opacity-60 font-medium">Details →</span>
        )}
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-foreground">{value}</div>
        <div className="text-sm font-medium text-foreground/80 mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
