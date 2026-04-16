
-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users can read their own, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  county TEXT,
  district TEXT,
  division TEXT,
  location TEXT,
  po_box TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  blood_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access to profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  hero_description TEXT,
  insurance_title TEXT,
  insurance_description TEXT,
  duration TEXT,
  duration_note TEXT,
  cost TEXT,
  cost_note TEXT,
  next_slot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are publicly readable" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  phone TEXT,
  email TEXT,
  department TEXT,
  status TEXT DEFAULT 'On Duty',
  availability TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  patients_count INTEGER DEFAULT 0,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors are publicly readable" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  patient_name TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  notes TEXT,
  mode TEXT DEFAULT 'In-person',
  status TEXT NOT NULL DEFAULT 'Pending',
  cancel_reason TEXT,
  reschedule_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins full access to appointments" ON public.appointments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
