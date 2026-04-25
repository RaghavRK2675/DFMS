import { cn } from "@/lib/utils";
import {
  WifiOff, Thermometer, Droplets, Wind, Camera as CameraIcon,
  Cpu, Radio, Battery, AlertTriangle, CheckCircle2, RefreshCw, Video, Plus,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";
import { useIoTDevices, useCameras } from "@/hooks/useDfmsData";
import { Button } from "@/components/ui/button";
import { CameraFeedDialog } from "@/components/CameraFeedDialog";
import { Skeleton } from "@/components/ui/skeleton";

const iconForType: Record<string, React.ElementType> = {
  Temperature: Thermometer,
  Humidity: Droplets,
  "Air Quality": Wind,
  "Vision / CV": CameraIcon,
  "Animal Tracking": Radio,
  "Processing Unit": Cpu,
};

const statusConfig = {
  online: { label: "Online", color: "text-emerald-700", dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  warning: { label: "Warning", color: "text-amber-700", dot: "bg-amber-500", bg: "bg-amber-50 border-amber-200" },
  offline: { label: "Offline", color: "text-red-700", dot: "bg-red-500", bg: "bg-red-50 border-red-200" },
} as const;

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

export function IoTStatusPanel() {
  const qc = useQueryClient();
  const { data: devices = [], isLoading } = useIoTDevices();
  const { data: cameras = [] } = useCameras();
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const online = devices.filter((d) => d.status === "online").length;
  const warning = devices.filter((d) => d.status === "warning").length;
  const offline = devices.filter((d) => d.status === "offline").length;
  const lowBattery = devices.filter((d) => d.battery !== undefined && d.battery < 30).length;

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["iot"] }),
      qc.invalidateQueries({ queryKey: ["cameras"] }),
    ]);
    setTimeout(() => setRefreshing(false), 600);
  }

  return (
    <div id="iot-section" className="bg-card rounded-xl border shadow-card">
      <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            IoT Hardware & Sensor Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {devices.length} devices monitored · {online} online · {warning} warning · {offline} offline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCameraDialogOpen(true)} variant="outline" size="sm" className="gap-1.5">
            <Video className="w-3.5 h-3.5" />
            Live Camera Feed
            <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">{cameras.length}</span>
          </Button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
          <DownloadPDFButton sectionId="iot-section" filename="iot-status" />
        </div>
      </div>

      <div className="px-5 py-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Online", value: online, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", Icon: CheckCircle2 },
          { label: "Warning", value: warning, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", Icon: AlertTriangle },
          { label: "Offline", value: offline, color: "text-red-700", bg: "bg-red-50 border-red-200", Icon: WifiOff },
          { label: "Low Battery", value: lowBattery, color: "text-orange-700", bg: "bg-orange-50 border-orange-200", Icon: Battery },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-3 flex items-center gap-3", s.bg)}>
            <s.Icon className={cn("w-5 h-5", s.color)} />
            <div>
              <p className={cn("text-xl font-display font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          : devices.length === 0
            ? <p className="col-span-full text-center text-sm text-muted-foreground py-8">No IoT devices registered yet.</p>
            : devices.map((d) => {
                const s = statusConfig[d.status];
                const Icon = iconForType[d.type] ?? Cpu;
                return (
                  <div key={d.deviceId} className={cn("rounded-xl border p-4 flex flex-col gap-2", s.bg)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
                          d.status === "online" ? "bg-emerald-100" : d.status === "warning" ? "bg-amber-100" : "bg-red-100"
                        )}>
                          <Icon className={cn("w-4 h-4", s.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.type}</p>
                        </div>
                      </div>
                      <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full shrink-0", s.color, "bg-white/60 border")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", s.dot, d.status === "online" && "animate-pulse")} />
                        {s.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-foreground text-right">{d.location}</span>
                      <span className="text-muted-foreground">Last Ping</span>
                      <span className={cn("font-medium text-right", d.status === "offline" ? "text-red-600" : "text-foreground")}>
                        {relativeTime(d.lastSeen)}
                      </span>
                      <span className="text-muted-foreground">Latency</span>
                      <span className="font-medium text-foreground text-right">{d.pingMs} ms</span>
                      <span className="text-muted-foreground">Firmware</span>
                      <span className="text-right text-muted-foreground font-mono">{d.firmware}</span>
                    </div>
                    {d.battery !== undefined && d.battery > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Battery className={cn("w-3.5 h-3.5", d.battery < 30 ? "text-red-500" : "text-muted-foreground")} />
                        <div className="flex-1 bg-white/60 rounded-full h-1.5">
                          <div className={cn("h-1.5 rounded-full transition-all",
                            d.battery < 30 ? "bg-red-500" : d.battery < 60 ? "bg-amber-400" : "bg-emerald-500"
                          )} style={{ width: `${d.battery}%` }} />
                        </div>
                        <span className={cn("text-xs font-medium", d.battery < 30 ? "text-red-600" : "text-muted-foreground")}>{d.battery}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
      </div>

      <CameraFeedDialog open={cameraDialogOpen} onClose={() => setCameraDialogOpen(false)} />
    </div>
  );
}
