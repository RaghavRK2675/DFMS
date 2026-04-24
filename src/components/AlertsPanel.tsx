import { useAlerts, useResolveAlert } from "@/hooks/useDfmsData";
import { AlertItem } from "@/components/AlertItem";
import { BellRing, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { AlertDetailModal } from "@/components/AlertDetailModal";
import type { Alert } from "@/data/mockData";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";
import { toast } from "sonner";

export function AlertsPanel() {
  const [showResolved, setShowResolved] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { data: alerts = [], isLoading } = useAlerts();
  const resolveMut = useResolveAlert();

  const filtered = showResolved ? alerts : alerts.filter((a) => !a.resolved);
  const unresolved = alerts.filter((a) => !a.resolved).length;

  return (
    <>
      <div id="alerts-panel-section" className="bg-card rounded-xl border shadow-card flex flex-col">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-primary" />
            <div>
              <h3 className="font-display font-semibold text-foreground">Alerts & Notifications</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLoading ? "Loading…" : `${unresolved} active alert${unresolved !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline transition-colors"
            >
              {showResolved ? "Hide resolved" : "Show all"}
            </button>
            <DownloadPDFButton sectionId="alerts-panel-section" filename="alerts-report" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 p-4 overflow-y-auto max-h-96">
          {isLoading && (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No active alerts 🎉</p>
          )}
          {filtered.map((alert) => (
            <div key={alert.id} className="relative group">
              <AlertItem alert={alert} onClick={() => setSelectedAlert(alert)} />
              {!alert.resolved && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await resolveMut.mutateAsync(alert.id);
                      toast.success("Alert resolved");
                    } catch {
                      toast.error("Failed to resolve");
                    }
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-emerald-600 text-white px-2 py-1 rounded-md flex items-center gap-1 transition-opacity no-print"
                  title="Mark resolved"
                >
                  <Check className="w-3 h-3" /> Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <AlertDetailModal open={!!selectedAlert} onClose={() => setSelectedAlert(null)} alert={selectedAlert} />
    </>
  );
}
