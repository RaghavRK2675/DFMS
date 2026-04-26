import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useAnimal,
  useAnimalEvents,
  useAnimalTreatments,
  useAnimalVaccinations,
  useAnimalMortality,
  useAddVaccination,
  useAddTreatment,
  useAddMedicalEvent,
  useRecordMortality,
  fetchMedicalInsight,
} from "@/hooks/useMedical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Loader2, Plus, Download, Activity, Syringe, Pill, Skull, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { can, Role } from "@/lib/permissions";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import jsPDF from "jspdf";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—");
const fmtDateTime = (s?: string | null) => (s ? new Date(s).toLocaleString("en-IN") : "—");

export default function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const role = user?.role as Role | undefined;
  const { data: animal, isLoading } = useAnimal(id);
  const { data: vaccinations = [] } = useAnimalVaccinations(id);
  const { data: treatments = [] } = useAnimalTreatments(id);
  const { data: events = [] } = useAnimalEvents(id);
  const { data: mortality = [] } = useAnimalMortality(id);

  const [insight, setInsight] = useState<Awaited<ReturnType<typeof fetchMedicalInsight>>["insight"] | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }
  if (!animal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p>Animal not found.</p>
        <Link to="/animals"><Button variant="outline" size="sm">Back to registry</Button></Link>
      </div>
    );
  }

  // Build a unified timeline
  type TLItem = { ts: string; type: string; title: string; description: string; severity: string; icon: string };
  const timeline: TLItem[] = [
    ...events.map((e) => ({ ts: e.occurred_at, type: e.event_type, title: e.title, description: e.description ?? "", severity: e.severity ?? "info", icon: "event" })),
    ...vaccinations.map((v) => ({ ts: v.administered_at, type: "vaccination", title: v.vaccine_name, description: `Dose ${v.dose ?? "—"} · Batch ${v.batch_number ?? "—"} · Vet ${v.vet_name ?? "—"}`, severity: "info", icon: "vacc" })),
    ...treatments.map((t) => ({ ts: t.started_at, type: "treatment", title: t.diagnosis, description: `${t.medication ?? ""} ${t.dosage ?? ""} ${t.frequency ?? ""} · ${t.status}`, severity: t.status === "ongoing" ? "high" : "info", icon: "treat" })),
    ...mortality.map((m) => ({ ts: m.died_at, type: "mortality", title: `Mortality — ${m.cause}`, description: m.post_mortem_notes ?? "", severity: "critical", icon: "mort" })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const generateInsight = async () => {
    if (!id) return;
    setLoadingInsight(true);
    setInsight(null);
    try {
      const res = await fetchMedicalInsight(id);
      setInsight(res.insight);
      await logAudit({
        action: "ai.insight.generate",
        target_table: "animals",
        target_id: id,
        summary: `Generated AI medical insight for ${animal.tag}`,
      });
    } catch (e: any) {
      const msg = e?.message ?? "Failed to generate insight";
      toast.error(msg.includes("rate") ? "AI rate limited — try again in a moment" : msg.includes("credits") ? "AI credits exhausted" : msg);
    } finally {
      setLoadingInsight(false);
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;

    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text(`Medical Record — ${animal.tag}`, margin, y); y += 24;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated ${new Date().toLocaleString("en-IN")} · DFMS`, margin, y); y += 18;
    doc.setTextColor(0);

    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("Animal Profile", margin, y); y += 16;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const profileLines = [
      `Species: ${animal.species}    Breed: ${animal.breed ?? "—"}    Sex: ${animal.sex ?? "—"}`,
      `Pen: ${animal.pen}    Date of birth: ${fmtDate(animal.date_of_birth)}    Weight: ${animal.current_weight_kg ?? "—"} kg`,
      `Health status: ${animal.health_status ?? "—"}    Isolated: ${animal.is_isolated ? "Yes" : "No"}    Status: ${animal.status}`,
      `Body temp: ${animal.body_temp ?? "—"} °C    Skin index: ${animal.skin_color_index ?? "—"}    Activity: ${animal.activity_score ?? "—"}`,
    ];
    profileLines.forEach((l) => { doc.text(l, margin, y); y += 14; });
    y += 8;

    const section = (title: string, rows: string[]) => {
      if (rows.length === 0) return;
      if (y > 740) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text(title, margin, y); y += 16;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      rows.forEach((r) => {
        const split = doc.splitTextToSize(r, pageW - margin * 2);
        if (y + split.length * 12 > 800) { doc.addPage(); y = margin; }
        doc.text(split, margin, y); y += split.length * 12 + 4;
      });
      y += 6;
    };

    section("Vaccinations", vaccinations.map((v) =>
      `• ${fmtDate(v.administered_at)} — ${v.vaccine_name} (dose ${v.dose ?? "—"}, batch ${v.batch_number ?? "—"}). Next due: ${fmtDate(v.next_due_at)}. Vet: ${v.vet_name ?? "—"}`,
    ));
    section("Treatments", treatments.map((t) =>
      `• ${fmtDate(t.started_at)} — ${t.diagnosis} [${t.status}]. Med: ${t.medication ?? "—"} ${t.dosage ?? ""} ${t.frequency ?? ""}. Vet: ${t.prescribing_vet ?? "—"}`,
    ));
    section("Medical Events", events.map((e) =>
      `• ${fmtDateTime(e.occurred_at)} — [${e.event_type}/${e.severity}] ${e.title}. ${e.description ?? ""}`,
    ));
    section("Mortality", mortality.map((m) =>
      `• ${fmtDate(m.died_at)} — Cause: ${m.cause}. ${m.post_mortem_notes ?? ""}`,
    ));
    if (insight) {
      section("AI Health Assessment", [
        `Risk: ${insight.risk_level.toUpperCase()} (${insight.risk_score}/100). Urgency: ${insight.urgency_hours}h.`,
        `Summary: ${insight.summary}`,
        ...insight.key_findings.map((f) => `• ${f}`),
        "Reasoning:",
        ...insight.reasoning.map((r) => `  – ${r.factor}: ${r.impact}`),
        "Recommendations:",
        ...insight.recommendations.map((r) => `  • ${r}`),
      ]);
    }

    doc.save(`medical-record-${animal.tag}.pdf`);
    await logAudit({
      action: "export.medical_pdf",
      target_table: "animals",
      target_id: animal.id,
      summary: `Exported medical PDF for ${animal.tag}`,
    });
  };

  // Tiny progression chart from events with severity
  const chartData = [...events]
    .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
    .map((e) => ({
      date: new Date(e.occurred_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      severity: { info: 1, low: 2, medium: 3, high: 4, critical: 5 }[e.severity ?? "info"] ?? 1,
    }));

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-white px-6 py-5 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link to="/animals" className="inline-flex items-center gap-1 text-white/70 text-xs hover:text-white">
              <ArrowLeft className="w-3 h-3" /> All animals
            </Link>
            <h1 className="font-display font-bold text-xl mt-1">Animal {animal.tag}</h1>
            <p className="text-white/70 text-xs capitalize">
              {animal.species} · {animal.breed || "—"} · {animal.pen} · DOB {fmtDate(animal.date_of_birth)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={generateInsight} disabled={loadingInsight} className="gap-2">
              {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Insight
            </Button>
            <Button variant="secondary" size="sm" onClick={downloadPDF} className="gap-2">
              <Download className="w-4 h-4" /> Medical PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Vitals strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <VitalCard label="Body Temp" value={`${animal.body_temp ?? "—"} °C`} />
          <VitalCard label="Skin Index" value={`${animal.skin_color_index ?? "—"}`} />
          <VitalCard label="Activity" value={`${animal.activity_score ?? "—"} / 100`} />
          <VitalCard label="Weight" value={`${animal.current_weight_kg ?? "—"} kg`} />
        </div>

        {insight && (
          <Card className="border-primary/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> AI Health Assessment
                <Badge variant={insight.risk_level === "critical" || insight.risk_level === "high" ? "destructive" : "secondary"} className="ml-auto capitalize">
                  {insight.risk_level} · {insight.risk_score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>{insight.summary}</p>
              {insight.key_findings.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Key findings</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {insight.key_findings.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {insight.reasoning.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Why (Explainable AI)</p>
                  <ul className="space-y-1">
                    {insight.reasoning.map((r, i) => (
                      <li key={i} className="text-muted-foreground"><span className="text-foreground font-medium">{r.factor}:</span> {r.impact}</li>
                    ))}
                  </ul>
                </div>
              )}
              {insight.recommendations.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Recommended actions</p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
                    {insight.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ol>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Suggested vet review window: within {insight.urgency_hours} hours.</p>
            </CardContent>
          </Card>
        )}

        {chartData.length > 1 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Severity progression</CardTitle></CardHeader>
            <CardContent className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis domain={[0, 5]} fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="severity" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline ({timeline.length})</TabsTrigger>
            <TabsTrigger value="vaccinations">Vaccinations ({vaccinations.length})</TabsTrigger>
            <TabsTrigger value="treatments">Treatments ({treatments.length})</TabsTrigger>
            <TabsTrigger value="mortality">Mortality ({mortality.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-3 pt-3">
            <div className="flex justify-end">
              {can(role, "events.observe") && <AddEventDialog animalId={animal.id} animalTag={animal.tag} role={role} />}
            </div>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No medical history recorded yet.</p>
            ) : (
              <ol className="relative border-l-2 border-muted pl-6 space-y-4">
                {timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-background ${
                      t.severity === "critical" ? "bg-destructive" : t.severity === "high" ? "bg-orange-500" : t.severity === "medium" ? "bg-yellow-500" : "bg-primary"
                    }`} />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-sm">{t.title}</p>
                      <span className="text-xs text-muted-foreground">{fmtDateTime(t.ts)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{t.type} · {t.severity}</p>
                    {t.description && <p className="text-sm mt-1">{t.description}</p>}
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-3 pt-3">
            <div className="flex justify-end">
              {can(role, "vaccinations.write") && <AddVaccinationDialog animalId={animal.id} animalTag={animal.tag} />}
            </div>
            <RecordTable
              empty="No vaccinations recorded."
              rows={vaccinations.map((v) => ({
                id: v.id,
                cells: [v.vaccine_name, v.dose ?? "—", v.batch_number ?? "—", fmtDate(v.administered_at), fmtDate(v.next_due_at), v.vet_name ?? "—"],
              }))}
              headers={["Vaccine", "Dose", "Batch", "Given", "Next due", "Vet"]}
            />
          </TabsContent>

          <TabsContent value="treatments" className="space-y-3 pt-3">
            <div className="flex justify-end">
              {can(role, "treatments.write") && <AddTreatmentDialog animalId={animal.id} animalTag={animal.tag} />}
            </div>
            <RecordTable
              empty="No treatments recorded."
              rows={treatments.map((t) => ({
                id: t.id,
                cells: [t.diagnosis, t.medication ?? "—", t.dosage ?? "—", t.frequency ?? "—", fmtDate(t.started_at), fmtDate(t.ended_at), t.status],
              }))}
              headers={["Diagnosis", "Medication", "Dosage", "Frequency", "Start", "End", "Status"]}
            />
          </TabsContent>

          <TabsContent value="mortality" className="space-y-3 pt-3">
            <div className="flex justify-end">
              {can(role, "mortality.write") && animal.status !== "deceased" && (
                <RecordMortalityDialog animalId={animal.id} animalTag={animal.tag} />
              )}
            </div>
            <RecordTable
              empty="No mortality record."
              rows={mortality.map((m) => ({ id: m.id, cells: [fmtDate(m.died_at), m.cause, m.post_mortem_notes ?? "—"] }))}
              headers={["Date", "Cause", "Post-mortem notes"]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function VitalCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-display text-xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function RecordTable({ headers, rows, empty }: { headers: string[]; rows: { id: string; cells: (string | number)[] }[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>{headers.map((h) => <th key={h} className="text-left px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              {r.cells.map((c, i) => <td key={i} className="px-3 py-2">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Dialogs ----------
function AddVaccinationDialog({ animalId, animalTag }: { animalId: string; animalTag: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vaccine_name: "", dose: "", batch_number: "", administered_at: new Date().toISOString().slice(0, 10), next_due_at: "", vet_name: "", notes: "" });
  const mut = useAddVaccination();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gap-2"><Syringe className="w-4 h-4" />Add Vaccination</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Record Vaccination</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Vaccine name *"><Input value={form.vaccine_name} onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dose"><Input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} placeholder="2 ml" /></Field>
            <Field label="Batch #"><Input value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Administered"><Input type="date" value={form.administered_at} onChange={(e) => setForm({ ...form, administered_at: e.target.value })} /></Field>
            <Field label="Next due"><Input type="date" value={form.next_due_at} onChange={(e) => setForm({ ...form, next_due_at: e.target.value })} /></Field>
          </div>
          <Field label="Vet"><Input value={form.vet_name} onChange={(e) => setForm({ ...form, vet_name: e.target.value })} /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!form.vaccine_name || mut.isPending}
            onClick={async () => {
              try {
                await mut.mutateAsync({ animal_id: animalId, animal_tag: animalTag, ...form, next_due_at: form.next_due_at || null } as any);
                toast.success("Vaccination recorded");
                setOpen(false);
              } catch (e: any) { toast.error(e.message); }
            }}
          >
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTreatmentDialog({ animalId, animalTag }: { animalId: string; animalTag: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ diagnosis: "", medication: "", dosage: "", frequency: "", started_at: new Date().toISOString().slice(0, 10), ended_at: "", status: "ongoing" as any, prescribing_vet: "", recovery_notes: "" });
  const mut = useAddTreatment();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gap-2"><Pill className="w-4 h-4" />Add Treatment</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Start / Record Treatment</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Diagnosis *"><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Medication"><Input value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} /></Field>
            <Field label="Dosage"><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="20 mg/kg" /></Field>
            <Field label="Frequency"><Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="2x daily" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Start"><Input type="date" value={form.started_at} onChange={(e) => setForm({ ...form, started_at: e.target.value })} /></Field>
            <Field label="End"><Input type="date" value={form.ended_at} onChange={(e) => setForm({ ...form, ended_at: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Prescribing vet"><Input value={form.prescribing_vet} onChange={(e) => setForm({ ...form, prescribing_vet: e.target.value })} /></Field>
          <Field label="Recovery notes"><Textarea value={form.recovery_notes} onChange={(e) => setForm({ ...form, recovery_notes: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!form.diagnosis || mut.isPending}
            onClick={async () => {
              try {
                await mut.mutateAsync({ animal_id: animalId, animal_tag: animalTag, ...form, ended_at: form.ended_at || null } as any);
                toast.success("Treatment recorded");
                setOpen(false);
              } catch (e: any) { toast.error(e.message); }
            }}
          >
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddEventDialog({ animalId, animalTag, role }: { animalId: string; animalTag: string; role?: Role }) {
  const [open, setOpen] = useState(false);
  const isWorker = role === "farm_worker";
  const [form, setForm] = useState({ event_type: isWorker ? "observation" : "exam", title: "", description: "", severity: "info" as any, occurred_at: new Date().toISOString().slice(0, 16) });
  const mut = useAddMedicalEvent();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-2"><Plus className="w-4 h-4" />Add Event</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Medical Event</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })} disabled={isWorker}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="observation">Observation</SelectItem>
                  {!isWorker && <SelectItem value="exam">Examination</SelectItem>}
                  {!isWorker && <SelectItem value="surgery">Surgery</SelectItem>}
                  {!isWorker && <SelectItem value="quarantine">Quarantine</SelectItem>}
                  {!isWorker && <SelectItem value="recovery">Recovery</SelectItem>}
                  {!isWorker && <SelectItem value="isolation">Isolation</SelectItem>}
                  {!isWorker && <SelectItem value="release">Release</SelectItem>}
                  {!isWorker && <SelectItem value="injury">Injury</SelectItem>}
                  {!isWorker && <SelectItem value="other">Other</SelectItem>}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Severity">
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Title *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Occurred at"><Input type="datetime-local" value={form.occurred_at} onChange={(e) => setForm({ ...form, occurred_at: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!form.title || mut.isPending}
            onClick={async () => {
              try {
                await mut.mutateAsync({ animal_id: animalId, animal_tag: animalTag, ...form, occurred_at: new Date(form.occurred_at).toISOString() } as any);
                toast.success("Event added");
                setOpen(false);
              } catch (e: any) { toast.error(e.message); }
            }}
          >
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordMortalityDialog({ animalId, animalTag }: { animalId: string; animalTag: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ died_at: new Date().toISOString().slice(0, 10), cause: "", post_mortem_notes: "" });
  const mut = useRecordMortality();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="destructive" className="gap-2"><Skull className="w-4 h-4" />Record Mortality</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Record Mortality — {animalTag}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Date *"><Input type="date" value={form.died_at} onChange={(e) => setForm({ ...form, died_at: e.target.value })} /></Field>
          <Field label="Cause *"><Input value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} /></Field>
          <Field label="Post-mortem notes"><Textarea value={form.post_mortem_notes} onChange={(e) => setForm({ ...form, post_mortem_notes: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!form.cause || mut.isPending}
            onClick={async () => {
              try {
                await mut.mutateAsync({ animal_id: animalId, animal_tag: animalTag, ...form } as any);
                toast.success("Mortality recorded");
                setOpen(false);
              } catch (e: any) { toast.error(e.message); }
            }}
          >
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
