import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";

export type AnimalRow = {
  id: string;
  tag: string;
  species: string;
  breed: string | null;
  pen: string;
  sex: string | null;
  date_of_birth: string | null;
  current_weight_kg: number | null;
  body_temp: number | null;
  skin_color_index: number | null;
  activity_score: number | null;
  health_status: "low" | "medium" | "high" | null;
  is_isolated: boolean;
  status: "active" | "sold" | "deceased" | "transferred";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Vaccination = {
  id: string;
  animal_id: string;
  vaccine_name: string;
  dose: string | null;
  batch_number: string | null;
  administered_at: string;
  next_due_at: string | null;
  vet_name: string | null;
  notes: string | null;
  created_at: string;
};

export type Treatment = {
  id: string;
  animal_id: string;
  diagnosis: string;
  medication: string | null;
  dosage: string | null;
  frequency: string | null;
  started_at: string;
  ended_at: string | null;
  status: "ongoing" | "completed" | "discontinued" | "recovered";
  prescribing_vet: string | null;
  recovery_notes: string | null;
};

export type MedicalEvent = {
  id: string;
  animal_id: string;
  event_type: string;
  title: string;
  description: string | null;
  severity: "info" | "low" | "medium" | "high" | "critical" | null;
  occurred_at: string;
};

export type MortalityRecord = {
  id: string;
  animal_id: string;
  died_at: string;
  cause: string;
  post_mortem_notes: string | null;
};

// ---------------- Queries ----------------
export const useAnimalsList = () =>
  useQuery({
    queryKey: ["animals-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .order("tag", { ascending: true });
      if (error) throw error;
      return data as AnimalRow[];
    },
  });

export const useAnimal = (id: string | undefined) =>
  useQuery({
    enabled: !!id,
    queryKey: ["animal", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("animals").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as AnimalRow | null;
    },
  });

export const useAnimalVaccinations = (id: string | undefined) =>
  useQuery({
    enabled: !!id,
    queryKey: ["vaccinations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("animal_id", id!)
        .order("administered_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Vaccination[];
    },
  });

export const useAnimalTreatments = (id: string | undefined) =>
  useQuery({
    enabled: !!id,
    queryKey: ["treatments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("animal_id", id!)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Treatment[];
    },
  });

export const useAnimalEvents = (id: string | undefined) =>
  useQuery({
    enabled: !!id,
    queryKey: ["events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_events")
        .select("*")
        .eq("animal_id", id!)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MedicalEvent[];
    },
  });

export const useAnimalMortality = (id: string | undefined) =>
  useQuery({
    enabled: !!id,
    queryKey: ["mortality", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mortality_records")
        .select("*")
        .eq("animal_id", id!)
        .order("died_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MortalityRecord[];
    },
  });

// ---------------- Mutations ----------------
export const useAddVaccination = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Vaccination, "id" | "created_at"> & { animal_tag?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("vaccinations")
        .insert({
          animal_id: input.animal_id,
          vaccine_name: input.vaccine_name,
          dose: input.dose ?? "",
          batch_number: input.batch_number ?? "",
          administered_at: input.administered_at,
          next_due_at: input.next_due_at,
          vet_name: input.vet_name ?? "",
          notes: input.notes ?? "",
          administered_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      await logAudit({
        action: "vaccination.create",
        target_table: "vaccinations",
        target_id: data.id,
        summary: `Recorded vaccination "${input.vaccine_name}" for animal ${input.animal_tag ?? input.animal_id}`,
      });
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["vaccinations", vars.animal_id] }),
  });
};

export const useAddTreatment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<Treatment, "id" | "ended_at"> & { ended_at?: string | null; animal_tag?: string },
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("treatments")
        .insert({
          animal_id: input.animal_id,
          diagnosis: input.diagnosis,
          medication: input.medication ?? "",
          dosage: input.dosage ?? "",
          frequency: input.frequency ?? "",
          started_at: input.started_at,
          ended_at: input.ended_at ?? null,
          status: input.status,
          prescribing_vet: input.prescribing_vet ?? "",
          recovery_notes: input.recovery_notes ?? "",
          recorded_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      await logAudit({
        action: "treatment.create",
        target_table: "treatments",
        target_id: data.id,
        summary: `Started treatment "${input.diagnosis}" for animal ${input.animal_tag ?? input.animal_id}`,
      });
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["treatments", vars.animal_id] }),
  });
};

export const useAddMedicalEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<MedicalEvent, "id"> & { animal_tag?: string },
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("medical_events")
        .insert({
          animal_id: input.animal_id,
          event_type: input.event_type,
          title: input.title,
          description: input.description ?? "",
          severity: input.severity ?? "info",
          occurred_at: input.occurred_at,
          recorded_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      await logAudit({
        action: "medical_event.create",
        target_table: "medical_events",
        target_id: data.id,
        summary: `Logged ${input.event_type} "${input.title}" for animal ${input.animal_tag ?? input.animal_id}`,
      });
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["events", vars.animal_id] }),
  });
};

export const useRecordMortality = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<MortalityRecord, "id"> & { animal_tag?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("mortality_records")
        .insert({
          animal_id: input.animal_id,
          died_at: input.died_at,
          cause: input.cause,
          post_mortem_notes: input.post_mortem_notes ?? "",
          recorded_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      // also flip animal status
      await supabase.from("animals").update({ status: "deceased" }).eq("id", input.animal_id);
      await logAudit({
        action: "mortality.record",
        target_table: "mortality_records",
        target_id: data.id,
        summary: `Recorded mortality for animal ${input.animal_tag ?? input.animal_id} — cause: ${input.cause}`,
      });
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["mortality", vars.animal_id] });
      qc.invalidateQueries({ queryKey: ["animal", vars.animal_id] });
      qc.invalidateQueries({ queryKey: ["animals-list"] });
    },
  });
};

// AI insight via edge function
export async function fetchMedicalInsight(animalId: string) {
  const { data, error } = await supabase.functions.invoke("medical-insight", {
    body: { animalId },
  });
  if (error) throw error;
  return data as {
    insight: {
      summary: string;
      risk_level: "low" | "medium" | "high" | "critical";
      risk_score: number;
      key_findings: string[];
      reasoning: { factor: string; impact: string }[];
      recommendations: string[];
      urgency_hours: number;
    };
    generated_at: string;
  };
}
