import { useStats } from "@/hooks/useDfmsData";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { AnimalHealthTable } from "@/components/AnimalHealthTable";
import { EnvironmentPanel } from "@/components/EnvironmentPanel";
import { AlertsPanel } from "@/components/AlertsPanel";
import { NutritionPanel } from "@/components/NutritionPanel";
import { DiseaseRiskPanel } from "@/components/DiseaseRiskPanel";
import { HeroSection } from "@/components/HeroSection";
import { ProfilePanel } from "@/components/ProfilePanel";
import { UnresolvedIssuesPanel } from "@/components/UnresolvedIssuesPanel";
import { IoTStatusPanel } from "@/components/IoTStatusPanel";
import { StatCardDetailModal } from "@/components/StatCardDetailModal";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";
import { AccountSettingsDialog } from "@/components/AccountSettingsDialog";
import { NotificationPrefsDialog } from "@/components/NotificationPrefsDialog";
import {
  PawPrint, Leaf, ShieldCheck, BellRing, Target,
  TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, User,
} from "lucide-react";
import { useState } from "react";

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

type StatModalKey = "totalAnimals" | "healthyAnimals" | "activeAlerts" | "isolatedAnimals"
  | "detectionAccuracy" | "hygieneImprovement" | "atRiskAnimals" | null;

export default function Index() {
  const [activeModal, setActiveModal] = useState<StatModalKey>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { data: stats } = useStats();
  const { user } = useAuth();
  const total = stats?.totalAnimals ?? 0;
  const healthyPct = total ? Math.round(((stats?.healthyAnimals ?? 0) / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background" id="dfms-full-dashboard">
      <header className="gradient-hero text-white px-6 py-5 shadow-elevated sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">DFMS Farmer Dashboard</h1>
              <p className="text-white/70 text-xs">Digital Farm Management System · Biosecurity & Health Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-white/90 text-sm font-medium">{today}</span>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Online · {stats?.detectionAccuracy ?? 92}% Detection Accuracy {user ? `· ${user.name}` : ""}
              </div>
            </div>
            <button
              onClick={() => setProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center transition-colors shrink-0"
              aria-label="Open farmer profile"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <HeroSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section id="summary-stats-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground text-base">Herd Overview</h2>
            <DownloadPDFButton sectionId="summary-stats-section" filename="herd-overview" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            <StatCard title="Total Animals" value={stats?.totalAnimals ?? 0}
              subtitle={`${stats?.pigsCount ?? 0} pigs · ${stats?.poultryCount ?? 0} poultry`}
              icon={PawPrint} variant="default" onClick={() => setActiveModal("totalAnimals")} />
            <StatCard title="Healthy Animals" value={stats?.healthyAnimals ?? 0}
              subtitle={`${healthyPct}% of herd`} icon={CheckCircle2} variant="success"
              onClick={() => setActiveModal("healthyAnimals")} />
            <StatCard title="Active Alerts" value={stats?.activeAlerts ?? 0}
              subtitle="Require immediate action" icon={BellRing} variant="warning"
              onClick={() => setActiveModal("activeAlerts")} />
            <StatCard title="Isolated Animals" value={stats?.isolatedAnimals ?? 0}
              subtitle="Disease containment active" icon={ShieldAlert} variant="danger"
              onClick={() => setActiveModal("isolatedAnimals")} />
          </div>
        </section>

        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Detection Accuracy" value={`${stats?.detectionAccuracy ?? 92}%`}
              subtitle="Two-Way ANOVA model" icon={Target} variant="success"
              onClick={() => setActiveModal("detectionAccuracy")} />
            <StatCard title="Hygiene Improvement" value={`+${stats?.hygieneImprovement ?? 40}%`}
              subtitle="vs. pre-DFMS baseline" icon={TrendingUp} variant="success"
              onClick={() => setActiveModal("hygieneImprovement")} />
            <StatCard title="At-Risk Animals" value={stats?.atRiskAnimals ?? 0}
              subtitle="Medium risk — monitor closely" icon={AlertTriangle} variant="warning"
              onClick={() => setActiveModal("atRiskAnimals")} />
            <StatCard title="Nutrition Tracked" value="3 Stages"
              subtitle="Starter · Grower · Finisher" icon={Leaf} variant="info" />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><EnvironmentPanel /></div>
          <div><AlertsPanel /></div>
        </section>

        <section><AnimalHealthTable /></section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DiseaseRiskPanel />
          <NutritionPanel />
        </section>

        <section><UnresolvedIssuesPanel /></section>

        <section><IoTStatusPanel /></section>

        <footer className="text-center text-xs text-muted-foreground py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DFMS v1.0 · Digital Farm Management System · LPU · Group KRGC0056</span>
          <DownloadPDFButton sectionId="dfms-full-dashboard" filename="dfms-full-dashboard" />
        </footer>
      </main>

      <StatCardDetailModal open={!!activeModal} onClose={() => setActiveModal(null)} modalKey={activeModal} />
      <ProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onOpenAccount={() => { setProfileOpen(false); setAccountOpen(true); }}
        onOpenPrefs={() => { setProfileOpen(false); setPrefsOpen(true); }}
      />
      <AccountSettingsDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
      <NotificationPrefsDialog open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </div>
  );
}
