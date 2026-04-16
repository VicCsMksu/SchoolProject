import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type AppointmentData = Tables<"appointments"> & {
  doctors?: { name: string } | null;
  services?: { name: string } | null;
};

export function useAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctors(name), services(name)")
        .eq("patient_id", user.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data as AppointmentData[];
    },
    enabled: !!user,
  });

  const addAppointment = useMutation({
    mutationFn: async (appt: TablesInsert<"appointments">) => {
      const { data, error } = await supabase.from("appointments").insert(appt).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TablesInsert<"appointments">> }) => {
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return { appointments, isLoading, addAppointment, updateAppointment };
}
