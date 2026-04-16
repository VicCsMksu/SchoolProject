import { Users, Calendar, Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  Pending: "text-amber-600",
  Approved: "text-blue-600",
  Completed: "text-emerald-600",
  Cancelled: "text-red-600",
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profilesRes, appointmentsRes, doctorsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("*"),
        supabase.from("doctors").select("id", { count: "exact", head: true }).eq("status", "On Duty"),
      ]);
      const appointments = appointmentsRes.data || [];
      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointments.filter(a => a.appointment_date === today);
      const pending = appointments.filter(a => a.status === "Pending");
      return {
        totalPatients: profilesRes.count || 0,
        appointmentsToday: todayAppointments.length,
        activeDoctors: doctorsRes.count || 0,
        pendingAppointments: pending.length,
        recentAppointments: appointments.slice(0, 5),
      };
    },
  });

  const { data: recentWithRelations = [] } = useQuery({
    queryKey: ["admin-recent-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctors(name), services(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statsCards = [
    { label: "Total Patients", value: stats?.totalPatients ?? "–", change: "Users", icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
    { label: "Appointments Today", value: stats?.appointmentsToday ?? "–", change: "Today", icon: Calendar, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
    { label: "Active Doctors", value: stats?.activeDoctors ?? "–", change: "On duty", icon: Activity, color: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
    { label: "Appointments Pending", value: stats?.pendingAppointments ?? "–", change: "Awaiting", icon: Clock, color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  ];

  return (
    <div className="px-5 pt-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Good Morning, Admin</h1>
        <p className="text-xs text-muted-foreground">Here's your facility overview for today</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-3.5">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] font-semibold text-primary">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent Appointments</h2>
          <button className="text-[11px] font-semibold text-primary" onClick={() => navigate("/admin/appointments")}>View All</button>
        </div>
        <div className="space-y-2">
          {recentWithRelations.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No appointments yet</p>
          ) : (
            recentWithRelations.map((appt) => (
              <Card key={appt.id} className="border shadow-sm">
                <CardContent className="flex items-center justify-between p-3.5">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{appt.patient_name || "Self"}</p>
                    <p className="text-[11px] text-muted-foreground">{appt.services?.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={12} />
                      {appt.appointment_time}
                    </div>
                    <p className={`text-[10px] font-semibold ${statusColors[appt.status] || "text-muted-foreground"}`}>{appt.status}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};

export default AdminDashboard;
