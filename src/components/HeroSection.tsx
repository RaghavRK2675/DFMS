import farmHero from "@/assets/farm-hero.jpg";
import { summaryStats, currentEnv } from "@/data/mockData";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ShieldCheck, Leaf, Thermometer, Wind, Droplets, TrendingUp } from "lucide-react";

function MetricSlider({ label, value, max, unit, warnAt, dangerAt }: {
  label: string; value: number; max: number; unit: string; warnAt: number; dangerAt: number;
}) {
  const pct = (value / max) * 100;
  const isWarn = value >= warnAt && value < dangerAt;
  const isDanger = value >= dangerAt;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/80 font-medium">{label}</span>
        <span className={cn("font-bold", isDanger ? "text-red-300" : isWarn ? "text-amber-300" : "text-emerald-300")}>
          {value}{unit}
        </span>
      </div>
      <Slider value={[pct]} max={100} disabled
        className="[&_[role=slider]]:hidden [&_.relative]:h-2 [&_.absolute]:rounded-full"
      />
      <div className="flex justify-between text-xs text-white/40">
        <span>0</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  const herdHealthPct = Math.round((summaryStats.healthyAnimals / summaryStats.totalAnimals) * 100);
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <img
        src={farmHero}
        alt="Aerial view of the pig and poultry farm"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left — text & badges */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DFMS Live Monitoring — Active
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
              Smart Farming, <br />
              <span className="text-emerald-400">Healthier Herds.</span>
            </h2>
            <p className="text-white/70 mt-3 text-sm sm:text-base leading-relaxed">
              The Digital Farm Management System uses IoT sensors, computer vision & Two-Way ANOVA modelling
              to detect disease early, automate biosecurity responses, and deliver <strong className="text-white">92% detection accuracy</strong> — keeping your animals safe and your farm profitable.
            </p>
          </div>

          {/* Key highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "Detection Accuracy", value: `${summaryStats.detectionAccuracy}%`, color: "text-emerald-400" },
              { icon: TrendingUp, label: "Hygiene Improved", value: `+${summaryStats.hygieneImprovement}%`, color: "text-amber-400" },
              { icon: Leaf, label: "Herd Health Rate", value: `${herdHealthPct}%`, color: "text-emerald-400" },
            ].map(item => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3.5 flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 shrink-0", item.color)} />
                <div>
                  <p className={cn("text-lg font-display font-bold leading-tight", item.color)}>{item.value}</p>
                  <p className="text-xs text-white/60">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Thought/quote */}
          <blockquote className="border-l-2 border-emerald-400 pl-4 text-white/60 text-sm italic">
            "Healthy animals are not a coincidence — they are the result of continuous, data-driven care. DFMS ensures no symptom goes undetected."
          </blockquote>
        </div>

        {/* Right — live sensor sliders */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-display font-semibold">Live Sensor Readings</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
            </span>
          </div>

          <MetricSlider label="Ambient Temperature" value={currentEnv.temperature} max={45} unit="°C" warnAt={28} dangerAt={32} />
          <MetricSlider label="Humidity" value={currentEnv.humidity} max={100} unit="%" warnAt={70} dangerAt={85} />
          <MetricSlider label="Ammonia Level" value={currentEnv.ammonia} max={50} unit=" ppm" warnAt={25} dangerAt={35} />
          <MetricSlider label="Hygiene Score" value={currentEnv.hygieneScore} max={100} unit="/100" warnAt={0} dangerAt={0} />

          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: "Healthy", value: summaryStats.healthyAnimals, color: "text-emerald-300 bg-emerald-900/40 border-emerald-700" },
              { label: "At Risk", value: summaryStats.atRiskAnimals, color: "text-amber-300 bg-amber-900/40 border-amber-700" },
              { label: "Isolated", value: summaryStats.isolatedAnimals, color: "text-red-300 bg-red-900/40 border-red-700" },
            ].map(s => (
              <div key={s.label} className={cn("rounded-xl border py-2.5", s.color)}>
                <p className="text-xl font-display font-bold">{s.value}</p>
                <p className="opacity-70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
