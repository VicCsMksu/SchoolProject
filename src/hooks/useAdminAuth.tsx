import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  user: null,
  loading: true,
  adminLogin: async () => ({ error: null }),
  adminLogout: async () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (user: User) => {
    // 1. Check JWT claims (app_metadata) first - this is the fastest way
    // even though the local JWT might be slightly out of sync until refreshed
    const roles = user.app_metadata?.roles as string[] | undefined;
    console.log("Checking admin role for user:", user.id);
    console.log("App metadata roles:", roles);
    
    if (roles?.includes("admin")) {
      console.log("Admin role confirmed via JWT metadata");
      return true;
    }

    // 2. Fallback to direct DB check in user_roles
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    if (roleError) {
      console.error("Database error checking user_roles:", roleError);
    }

    if (roleData) {
      console.log("Admin role confirmed via user_roles table");
      return true;
    }

    // 3. Fallback to profiles table check (per user's note)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role" as any)
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Database error checking profiles role:", profileError);
    }

    if ((profileData as any)?.role === "admin") {
      console.log("Admin role confirmed via profiles table");
      return true;
    }

    console.log("User does not have admin role in any source");
    return false;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state change event:", _event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const admin = await checkAdminRole(currentUser);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const admin = await checkAdminRole(currentUser);
        setIsAdmin(admin);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    
    const admin = await checkAdminRole(data.user);
    if (!admin) {
      await supabase.auth.signOut();
      return { error: "You do not have admin access." };
    }
    setIsAdmin(true);
    return { error: null };
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated: isAdmin, user, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
