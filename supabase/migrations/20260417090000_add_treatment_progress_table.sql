CREATE TABLE public.treatment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT,
  start_date DATE,
  expected_end_date DATE,
  current_stage TEXT DEFAULT 'Consultation',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.treatment_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own progress" ON public.treatment_progress
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Admins full access" ON public.treatment_progress
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
