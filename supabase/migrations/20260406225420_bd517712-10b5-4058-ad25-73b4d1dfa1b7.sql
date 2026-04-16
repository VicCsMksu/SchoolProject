INSERT INTO public.user_roles (user_id, role)
VALUES ('37739b6d-7816-4102-9b15-6836533ecbd4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;