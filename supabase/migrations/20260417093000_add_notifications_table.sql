CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'appointment',
  read BOOLEAN DEFAULT false,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.notify_on_appointment_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, body, type, appointment_id)
    VALUES (
      NEW.patient_id,
      CASE NEW.status
        WHEN 'Approved' THEN 'Appointment Approved'
        WHEN 'Cancelled' THEN 'Appointment Cancelled'
        WHEN 'Completed' THEN 'Treatment Visit Completed'
        WHEN 'Rescheduled' THEN 'Appointment Rescheduled'
        ELSE 'Appointment Update'
      END,
      CASE NEW.status
        WHEN 'Approved' THEN 'Your appointment on ' || NEW.appointment_date || ' at ' || NEW.appointment_time || ' has been approved. See you soon!'
        WHEN 'Cancelled' THEN 'Your appointment on ' || NEW.appointment_date || ' at ' || NEW.appointment_time || ' has been cancelled. Please contact us to reschedule.'
        WHEN 'Completed' THEN 'Your visit on ' || NEW.appointment_date || ' is marked as completed. Thank you for visiting MaxxDental!'
        WHEN 'Rescheduled' THEN 'Your appointment has been rescheduled. Please check your appointments for the new date.'
        ELSE 'Your appointment status has been updated to ' || NEW.status || '.'
      END,
      'appointment',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_appointment_status_change
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_appointment_status();
