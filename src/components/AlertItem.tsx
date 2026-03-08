import { AlertTriangle, Info, Leaf, Wind, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/data/mockData";

interface AlertItemProps {
  alert: Alert;
  onClick?: () => void;
}

const iconMap = {
  disease: AlertTriangle,
  environment: Wind,
  nutrition: Leaf,
  behavior: Info,
};

const severityStyles = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-amber-500 bg-amber-50",
  low: "border-l-blue-500 bg-blue-50",
};

const iconStyles = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-blue-500",
};

export function AlertItem({ alert, onClick }: AlertItemProps) {
  const Icon = iconMap[alert.type];
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-3 p-3.5 rounded-lg border-l-4 transition-all",
        severityStyles[alert.severity],
        alert.resolved && "opacity-50",
        onClick && "cursor-pointer hover:brightness-95"
      )}
    >
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", iconStyles[alert.severity])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> {alert.timestamp}
          </span>
          {alert.resolved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          )}
          {onClick && !alert.resolved && (
            <span className="text-xs text-muted-foreground ml-auto opacity-60">Tap for details →</span>
          )}
        </div>
      </div>
    </div>
  );
}
