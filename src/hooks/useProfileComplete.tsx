import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useProfileComplete = () => {
  const { user, isAuthenticated } = useAuth();

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["user-is-admin", user?.id],
    queryFn: async () => {
      // 1. Check JWT claims first
      const roles = user?.app_metadata?.roles as string[] | undefined;
      if (roles?.includes("admin")) return true;

      // 2. Fallback to DB check
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (error) {
        console.error("Error checking role in useProfileComplete:", error);
      }
      return !!data;
    },
    enabled: !!user && isAuthenticated,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-complete-check", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("county, full_name")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAuthenticated && !isAdmin,
  });

  // Admins bypass profile completion
  const isProfileComplete = isAdmin || (!!profile?.county && !!profile?.full_name);

  return { isProfileComplete, isLoading: adminLoading || profileLoading, isAdmin: !!isAdmin };
};
