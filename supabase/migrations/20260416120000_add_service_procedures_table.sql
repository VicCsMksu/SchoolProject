-- Create service_procedures table for storing customizable procedure steps
CREATE TABLE public.service_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, step_number)
);

ALTER TABLE public.service_procedures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service procedures are publicly readable" ON public.service_procedures
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage service procedures" ON public.service_procedures
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_service_procedures_updated_at
  BEFORE UPDATE ON public.service_procedures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default procedure steps for existing services
-- Note: This will be populated by the admin interface, but we can add some defaults

-- For Orthodontic Consultation
INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 1, 'Book Appointment', 'Schedule your consultation online or by phone', '5 min'
FROM public.services s WHERE s.name = 'Orthodontic Consultation';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 2, 'Initial Assessment', 'Doctor reviews your dental history and concerns', '15 min'
FROM public.services s WHERE s.name = 'Orthodontic Consultation';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 3, 'X-rays & Examination', 'Take necessary X-rays and perform orthodontic examination', '20 min'
FROM public.services s WHERE s.name = 'Orthodontic Consultation';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 4, 'Treatment Planning', 'Receive personalized treatment plan with options and costs', '15 min'
FROM public.services s WHERE s.name = 'Orthodontic Consultation';