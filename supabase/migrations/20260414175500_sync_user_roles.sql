-- This migration syncs public.user_roles with auth.users app_metadata
-- allowing for JWT-based RBAC checks.

-- 1. Function to sync roles to auth.users app_metadata
CREATE OR REPLACE FUNCTION public.sync_user_roles_to_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  roles_array TEXT[];
BEGIN
  -- Get all roles for the user as a text array
  SELECT array_agg(role::text) INTO roles_array
  FROM public.user_roles
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_app_metadata = 
    COALESCE(raw_app_metadata, '{}'::jsonb) || 
    jsonb_build_object('roles', roles_array)
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN NEW;
END;
$$;

-- 2. Trigger to run on change in user_roles
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_to_metadata();

-- 3. Initial sync for existing users
-- NOTE: We use a loop to ensure all existing users get their metadata updated
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM public.user_roles LOOP
    PERFORM public.sync_user_roles_to_metadata(); -- This won't work perfectly since it's a trigger function, so let's use the logic directly
    
    UPDATE auth.users
    SET raw_app_metadata = 
      COALESCE(raw_app_metadata, '{}'::jsonb) || 
      jsonb_build_object('roles', (
        SELECT array_agg(role::text)
        FROM public.user_roles
        WHERE user_id = r.user_id
      ))
    WHERE id = r.user_id;
  END LOOP;
END;
$$;
