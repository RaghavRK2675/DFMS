-- Helper: any of these roles?
CREATE OR REPLACE FUNCTION public.has_any_role(_uid uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid AND role = ANY(_roles)
  )
$$;

-- =================== ANIMALS ===================
CREATE TABLE public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL UNIQUE,
  species text NOT NULL CHECK (species IN ('pig','poultry','cattle','goat','sheep','other')),
  breed text DEFAULT '',
  pen text NOT NULL DEFAULT '',
  sex text CHECK (sex IN ('male','female','unknown')) DEFAULT 'unknown',
  date_of_birth date,
  current_weight_kg numeric(8,2),
  body_temp numeric(4,2),
  skin_color_index int CHECK (skin_color_index BETWEEN 0 AND 100),
  activity_score int CHECK (activity_score BETWEEN 0 AND 100),
  health_status text CHECK (health_status IN ('low','medium','high')) DEFAULT 'low',
  is_isolated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','deceased','transferred')),
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_animals_status ON public.animals(status);
CREATE INDEX idx_animals_pen ON public.animals(pen);
CREATE INDEX idx_animals_species ON public.animals(species);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view animals"
  ON public.animals FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Managers can insert animals"
  ON public.animals FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin']::app_role[]));

CREATE POLICY "Managers can update animals"
  ON public.animals FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Admins can delete animals"
  ON public.animals FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_animals_updated
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =================== VACCINATIONS ===================
CREATE TABLE public.vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  dose text DEFAULT '',
  batch_number text DEFAULT '',
  administered_at date NOT NULL DEFAULT CURRENT_DATE,
  next_due_at date,
  administered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  vet_name text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vacc_animal ON public.vaccinations(animal_id);
CREATE INDEX idx_vacc_due ON public.vaccinations(next_due_at);

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view vaccinations"
  ON public.vaccinations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Clinical roles can insert vaccinations"
  ON public.vaccinations FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Clinical roles can update vaccinations"
  ON public.vaccinations FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Admins can delete vaccinations"
  ON public.vaccinations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =================== TREATMENTS ===================
CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  diagnosis text NOT NULL,
  medication text DEFAULT '',
  dosage text DEFAULT '',
  frequency text DEFAULT '',
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  ended_at date,
  status text NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing','completed','discontinued','recovered')),
  prescribing_vet text DEFAULT '',
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recovery_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_treat_animal ON public.treatments(animal_id);
CREATE INDEX idx_treat_status ON public.treatments(status);

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view treatments"
  ON public.treatments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Clinical roles can insert treatments"
  ON public.treatments FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Clinical roles can update treatments"
  ON public.treatments FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Admins can delete treatments"
  ON public.treatments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_treatments_updated
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =================== MEDICAL EVENTS (timeline) ===================
CREATE TABLE public.medical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('observation','exam','surgery','quarantine','recovery','isolation','release','injury','other')),
  title text NOT NULL,
  description text DEFAULT '',
  severity text CHECK (severity IN ('info','low','medium','high','critical')) DEFAULT 'info',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_animal ON public.medical_events(animal_id, occurred_at DESC);

ALTER TABLE public.medical_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view events"
  ON public.medical_events FOR SELECT TO authenticated USING (true);

-- workers can add observations only; clinical roles can add anything
CREATE POLICY "Workers can add observations"
  ON public.medical_events FOR INSERT TO authenticated
  WITH CHECK (
    (event_type = 'observation' AND public.has_any_role(auth.uid(), ARRAY['farm_worker','farmer','supervisor','admin','veterinarian']::app_role[]))
    OR public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[])
  );

CREATE POLICY "Clinical roles can update events"
  ON public.medical_events FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Admins can delete events"
  ON public.medical_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =================== MORTALITY ===================
CREATE TABLE public.mortality_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  died_at date NOT NULL DEFAULT CURRENT_DATE,
  cause text NOT NULL,
  post_mortem_notes text DEFAULT '',
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mort_animal ON public.mortality_records(animal_id);

ALTER TABLE public.mortality_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view mortality"
  ON public.mortality_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Clinical roles can record mortality"
  ON public.mortality_records FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['farmer','supervisor','admin','veterinarian']::app_role[]));

CREATE POLICY "Admins can delete mortality"
  ON public.mortality_records FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =================== AUDIT LOGS ===================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  target_table text,
  target_id text,
  summary text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Users see their own audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (actor_id = auth.uid());

CREATE POLICY "Admins see all audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage user_roles (to enable role assignment from UI)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can assign roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can revoke roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles (for user management)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));