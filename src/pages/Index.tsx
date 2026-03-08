import { summaryStats } from "@/data/mockData";
import { StatCard } from "@/components/StatCard";
import { AnimalHealthTable } from "@/components/AnimalHealthTable";
import { EnvironmentPanel } from "@/components/EnvironmentPanel";
import { AlertsPanel } from "@/components/AlertsPanel";
import { NutritionPanel } from "@/components/NutritionPanel";
import { DiseaseRiskPanel } from "@/components/DiseaseRiskPanel";
import {
  PawPrint, Leaf, ShieldCheck, BellRing, Thermometer, Target,
  TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert
} from "lucide-react";

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-white px-6 py-5 shadow-elevated">
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
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-white/90 text-sm font-medium">{today}</span>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online · 99% Uptime · {summaryStats.detectionAccuracy}% Detection Accuracy
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Summary Stats ── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Animals"
              value={summaryStats.totalAnimals}
              subtitle={`${summaryStats.pigsCount} pigs · ${summaryStats.poultryCount} poultry`}
              icon={PawPrint}
              variant="default"
            />
            <StatCard
              title="Healthy Animals"
              value={summaryStats.healthyAnimals}
              subtitle={`${Math.round((summaryStats.healthyAnimals / summaryStats.totalAnimals) * 100)}% of herd`}
              icon={CheckCircle2}
              variant="success"
              trend={{ value: "93%", up: true }}
            />
            <StatCard
              title="Active Alerts"
              value={summaryStats.activeAlerts}
              subtitle="Require immediate action"
              icon={BellRing}
              variant="warning"
            />
            <StatCard
              title="Isolated Animals"
              value={summaryStats.isolatedAnimals}
              subtitle="Disease containment active"
              icon={ShieldAlert}
              variant="danger"
            />
          </div>
        </section>

        {/* ── Performance Metrics ── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Detection Accuracy"
              value={`${summaryStats.detectionAccuracy}%`}
              subtitle="Two-Way ANOVA model"
              icon={Target}
              variant="success"
              trend={{ value: "92%", up: true }}
            />
            <StatCard
              title="Hygiene Improvement"
              value={`+${summaryStats.hygieneImprovement}%`}
              subtitle="vs. pre-DFMS baseline"
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="At-Risk Animals"
              value={summaryStats.atRiskAnimals}
              subtitle="Medium risk — monitor closely"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              title="Nutrition Tracked"
              value="3 Stages"
              subtitle="Starter · Grower · Finisher"
              icon={Leaf}
              variant="info"
            />
          </div>
        </section>

        {/* ── Main Grid: Environment + Alerts ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnvironmentPanel />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </section>

        {/* ── Animal Health Table ── */}
        <section>
          <AnimalHealthTable />
        </section>

        {/* ── Disease Risk + Nutrition ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DiseaseRiskPanel />
          <NutritionPanel />
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-muted-foreground py-4 border-t">
          DFMS v1.0 · Design & Implementation of a Digital Farm Management System for Enhancing Biosecurity in Pig & Poultry Farms
          · Lovely Professional University · Group KRGC0056
        </footer>
      </main>
    </div>
  );
}
