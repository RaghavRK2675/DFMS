import { alerts } from "@/data/mockData";
import { AlertItem } from "@/components/AlertItem";
import { BellRing } from "lucide-react";
import { useState } from "react";
import { AlertDetailModal } from "@/components/AlertDetailModal";
import type { Alert } from "@/data/mockData";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

export function AlertsPanel() {
  const [showResolved, setShowResolved] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const filtered = showResolved ? alerts : alerts.filter(a => !a.resolved);
  const unresolved = alerts.filter(a => !a.resolved).length;

  return (
    <>
      <div id="alerts-panel-section" className="bg-card rounded-xl border shadow-card flex flex-col">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-display font-semibold text-foreground">Alerts & Notifications</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{unresolved} active alert{unresolved !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResolved(v => !v)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline transition-colors"
            >
              {showResolved ? "Hide resolved" : "Show all"}
            </button>
            <DownloadPDFButton sectionId="alerts-panel-section" filename="alerts-report" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 p-4 overflow-y-auto max-h-96">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No active alerts 🎉</p>
          )}
          {filtered.map(alert => (
            <AlertItem key={alert.id} alert={alert} onClick={() => setSelectedAlert(alert)} />
          ))}
        </div>
      </div>
      <AlertDetailModal open={!!selectedAlert} onClose={() => setSelectedAlert(null)} alert={selectedAlert} />
    </>
  );
}
