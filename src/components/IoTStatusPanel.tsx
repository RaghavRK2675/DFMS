import { cn } from "@/lib/utils";
import {
  Wifi, WifiOff, Thermometer, Droplets, Wind, Camera,
  Cpu, Radio, Battery, AlertTriangle, CheckCircle2, RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

type DeviceStatus = "online" | "warning" | "offline";

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  location: string;
  status: DeviceStatus;
  lastPing: string;
  battery?: number;
  firmware: string;
  reading?: string;
  icon: React.ElementType;
}

const devices: IoTDevice[] = [
  { id: "S001", name: "Temp Sensor A1", type: "Temperature", location: "Pen A", status: "online", lastPing: "12s ago", battery: 92, firmware: "v2.3.1", reading: "38.6°C", icon: Thermometer },
  { id: "S002", name: "Temp Sensor A2", type: "Temperature", location: "Pen B", status: "online", lastPing: "8s ago", battery: 87, firmware: "v2.3.1", reading: "39.1°C", icon: Thermometer },
  { id: "S003", name: "Temp Sensor H1", type: "Temperature", location: "House 1", status: "warning", lastPing: "2m 18s ago", battery: 21, firmware: "v2.2.9", reading: "41.1°C", icon: Thermometer },
  { id: "H001", name: "Humidity Hub-1", type: "Humidity", location: "All Pens", status: "online", lastPing: "5s ago", battery: 78, firmware: "v1.8.0", reading: "54%", icon: Droplets },
  { id: "H002", name: "Humidity Hub-2", type: "Humidity", location: "House 1-2", status: "online", lastPing: "11s ago", battery: 65, firmware: "v1.8.0", reading: "58%", icon: Droplets },
  { id: "A001", name: "Ammonia Sensor 1", type: "Air Quality", location: "Pen A/B", status: "warning", lastPing: "4m 02s ago", battery: 34, firmware: "v3.0.2", reading: "29 ppm", icon: Wind },
  { id: "A002", name: "Ammonia Sensor 2", type: "Air Quality", location: "Pen C", status: "online", lastPing: "18s ago", battery: 81, firmware: "v3.0.2", reading: "21 ppm", icon: Wind },
  { id: "C001", name: "Camera — Pen A", type: "Vision / CV", location: "Pen A", status: "online", lastPing: "1s ago", firmware: "v4.1.0", reading: "1080p @ 15fps", icon: Camera },
  { id: "C002", name: "Camera — Pen B", type: "Vision / CV", location: "Pen B", status: "online", lastPing: "1s ago", firmware: "v4.1.0", reading: "1080p @ 15fps", icon: Camera },
  { id: "C003", name: "Camera — House 1", type: "Vision / CV", location: "House 1", status: "warning", lastPing: "8m 55s ago", firmware: "v4.0.8", reading: "Last frame: 9m ago", icon: Camera },
  { id: "G001", name: "RFID Gateway-1", type: "Animal Tracking", location: "Pen A/B Entry", status: "online", lastPing: "3s ago", firmware: "v2.1.4", reading: "8 tags active", icon: Radio },
  { id: "G002", name: "RFID Gateway-2", type: "Animal Tracking", location: "House Entry", status: "offline", lastPing: "2h 12m ago", firmware: "v2.0.9", reading: "—", icon: Radio },
  { id: "M001", name: "Edge Compute Node", type: "Processing Unit", location: "Server Room", status: "online", lastPing: "2s ago", firmware: "v5.2.0", reading: "CPU 34% · RAM 61%", icon: Cpu },
];

const statusConfig: Record<DeviceStatus, { label: string; color: string; dot: string; bg: string }> = {
  online:  { label: "Online",  color: "text-emerald-700", dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  warning: { label: "Warning", color: "text-amber-700",   dot: "bg-amber-500",   bg: "bg-amber-50 border-amber-200" },
  offline: { label: "Offline", color: "text-red-700",     dot: "bg-red-500",     bg: "bg-red-50 border-red-200" },
};

function DeviceCard({ device }: { device: IoTDevice }) {
  const s = statusConfig[device.status];
  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-2", s.bg)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
            device.status === "online" ? "bg-emerald-100" : device.status === "warning" ? "bg-amber-100" : "bg-red-100"
          )}>
            <device.icon className={cn("w-4 h-4", s.color)} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{device.name}</p>
            <p className="text-xs text-muted-foreground">{device.type}</p>
          </div>
        </div>
        <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full shrink-0", s.color, "bg-white/60 border", s.bg.includes("emerald") ? "border-emerald-200" : s.bg.includes("amber") ? "border-amber-200" : "border-red-200")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot, device.status === "online" && "animate-pulse")} />
          {s.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">Location</span>
        <span className="font-medium text-foreground text-right">{device.location}</span>
        <span className="text-muted-foreground">Last Ping</span>
        <span className={cn("font-medium text-right", device.status === "offline" ? "text-red-600" : "text-foreground")}>{device.lastPing}</span>
        <span className="text-muted-foreground">Reading</span>
        <span className="font-medium text-foreground text-right">{device.reading ?? "—"}</span>
        <span className="text-muted-foreground">Firmware</span>
        <span className="text-right text-muted-foreground font-mono">{device.firmware}</span>
      </div>

      {device.battery !== undefined && (
        <div className="flex items-center gap-2 mt-1">
          <Battery className={cn("w-3.5 h-3.5", device.battery < 30 ? "text-red-500" : "text-muted-foreground")} />
          <div className="flex-1 bg-white/60 rounded-full h-1.5">
            <div className={cn("h-1.5 rounded-full transition-all", device.battery < 30 ? "bg-red-500" : device.battery < 60 ? "bg-amber-400" : "bg-emerald-500")}
              style={{ width: `${device.battery}%` }} />
          </div>
          <span className={cn("text-xs font-medium", device.battery < 30 ? "text-red-600" : "text-muted-foreground")}>{device.battery}%</span>
        </div>
      )}
    </div>
  );
}

export function IoTStatusPanel() {
  const [refreshing, setRefreshing] = useState(false);
  const online = devices.filter(d => d.status === "online").length;
  const warning = devices.filter(d => d.status === "warning").length;
  const offline = devices.filter(d => d.status === "offline").length;
  const lowBattery = devices.filter(d => d.battery !== undefined && d.battery < 30).length;

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
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

      {/* Summary row */}
      <div className="px-5 py-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Online", value: online, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", Icon: CheckCircle2 },
          { label: "Warning", value: warning, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", Icon: AlertTriangle },
          { label: "Offline", value: offline, color: "text-red-700", bg: "bg-red-50 border-red-200", Icon: WifiOff },
          { label: "Low Battery", value: lowBattery, color: "text-orange-700", bg: "bg-orange-50 border-orange-200", Icon: Battery },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-3 flex items-center gap-3", s.bg)}>
            <s.Icon className={cn("w-5 h-5", s.color)} />
            <div>
              <p className={cn("text-xl font-display font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Device grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(d => <DeviceCard key={d.id} device={d} />)}
      </div>
    </div>
  );
}
