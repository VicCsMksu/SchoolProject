import {
  Users, Calendar, Activity, Clock,
  TrendingUp, TrendingDown, Stethoscope,
  CheckCircle2, XCircle, RotateCw, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"];

const getMonthKey = (dateStr: string) => {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getLast6Months = () => {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MONTHS[d.getMonth()],
    });
  }
  return result;
};

const STATUS_COLORS: Record<string, string> = {
  Pending:              "#f59e0b",
  Approved:             "#3b82f6",
  Completed:            "#10b981",
  Cancelled:            "#ef4444",
  Rescheduled:          "#8b5cf6",
  "Pending Reschedule": "#f97316",
  "Reschedule Offered": "#06b6d4",
};

const CHART_COLORS = [
  "#185FA5","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4",
];

const trend = (current: number, previous: number) => {
  if (previous === 0) return { pct: 0, up: true };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
};

// ── component ────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const months = getLast6Months();
  const thisMonthKey = months[5].key;
  const lastMonthKey = months[4].key;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [profilesRes, appointmentsRes, doctorsRes, servicesRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, created_at", { count: "exact" }),
          supabase
            .from("appointments")
            .select("*, services(name), doctors(name)"),
          supabase
            .from("doctors")
            .select("id, name, status"),
          supabase
            .from("services")
            .select("id, name"),
        ]);

      const appts = appointmentsRes.data || [];
      const profiles = profilesRes.data || [];

      // ── KPI counts ──
      const thisMonthAppts = appts.filter(
        a => getMonthKey(a.appointment_date) === thisMonthKey
      );
      const lastMonthAppts = appts.filter(
        a => getMonthKey(a.appointment_date) === lastMonthKey
      );
      const thisMonthPatients = profiles.filter(
        p => p.created_at &&
             getMonthKey(p.created_at.split("T")[0]) === thisMonthKey
      );
      const lastMonthPatients = profiles.filter(
        p => p.created_at &&
             getMonthKey(p.created_at.split("T")[0]) === lastMonthKey
      );

      const completedAll = appts.filter(a => a.status === "Completed");
      const completionRate = appts.length > 0
        ? Math.round((completedAll.length / appts.length) * 100) : 0;
      const lastMonthCompleted = lastMonthAppts.filter(
        a => a.status === "Completed"
      ).length;
      const lastMonthRate = lastMonthAppts.length > 0
        ? Math.round((lastMonthCompleted / lastMonthAppts.length) * 100) : 0;

      const pendingReschedule = appts.filter(
        a => a.status === "Pending Reschedule"
      ).length;

      // ── Monthly bar chart ──
      const monthlyData = months.map(m => ({
        month: m.label,
        total: appts.filter(
          a => getMonthKey(a.appointment_date) === m.key
        ).length,
        completed: appts.filter(
          a => getMonthKey(a.appointment_date) === m.key &&
               a.status === "Completed"
        ).length,
        cancelled: appts.filter(
          a => getMonthKey(a.appointment_date) === m.key &&
               a.status === "Cancelled"
        ).length,
      }));

      // ── Status breakdown donut ──
      const statusCounts: Record<string, number> = {};
      appts.forEach(a => {
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });
      const statusData = Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // ── Service breakdown ──
      const serviceCounts: Record<string, number> = {};
      appts.forEach(a => {
        const svc = a.services?.name || "Unknown";
        serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
      });
      const serviceData = Object.entries(serviceCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // ── Doctor workload ──
      const doctorCounts: Record<string, {
        total: number; completed: number; name: string;
      }> = {};
      appts.forEach(a => {
        const doc = a.doctors?.name || "Unassigned";
        if (!doctorCounts[doc])
          doctorCounts[doc] = { total: 0, completed: 0, name: doc };
        doctorCounts[doc].total += 1;
        if (a.status === "Completed") doctorCounts[doc].completed += 1;
      });
      const doctorData = Object.values(doctorCounts)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

      // ── Recent appointments ──
      const recent = [...appts]
        .sort((a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        )
        .slice(0, 5);

      return {
        totalPatients: profilesRes.count || 0,
        activeDoctors: (doctorsRes.data || []).filter(
          d => d.status === "On Duty"
        ).length,
        thisMonthCount: thisMonthAppts.length,
        lastMonthCount: lastMonthAppts.length,
        thisMonthPatients: thisMonthPatients.length,
        lastMonthPatients: lastMonthPatients.length,
        completionRate,
        lastMonthRate,
        pendingReschedule,
        monthlyData,
        statusData,
        serviceData,
        doctorData,
        recent,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading || !data) {
    return (
      <div className="px-5 pt-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const apptTrend = trend(data.thisMonthCount, data.lastMonthCount);
  const patientTrend = trend(data.thisMonthPatients, data.lastMonthPatients);
  const rateTrend = trend(data.completionRate, data.lastMonthRate);

  // ── KPI cards ──
  const kpis = [
    {
      label: "Appointments this month",
      value: data.thisMonthCount,
      sub: `${apptTrend.up ? "+" : "-"}${apptTrend.pct}% vs last month`,
      up: apptTrend.up,
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total patients",
      value: data.totalPatients,
      sub: `+${data.thisMonthPatients} this month`,
      up: true,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Completion rate",
      value: `${data.completionRate}%`,
      sub: `${rateTrend.up ? "+" : "-"}${rateTrend.pct}% vs last month`,
      up: rateTrend.up,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending reschedule",
      value: data.pendingReschedule,
      sub: "Awaiting admin action",
      up: false,
      icon: RotateCw,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="px-4 pt-6 pb-28 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          MaxxDental Nairobi · live data
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="border shadow-sm">
            <CardContent className="p-3.5 space-y-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                k.color
              )}>
                <k.icon size={16} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                  {k.label}
                </p>
                <p className="text-xl font-extrabold text-foreground mt-0.5">
                  {k.value}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {k.up
                  ? <TrendingUp size={11} className="text-emerald-500 shrink-0" />
                  : <TrendingDown size={11} className="text-red-400 shrink-0" />
                }
                <p className={cn(
                  "text-[10px] font-semibold",
                  k.up ? "text-emerald-600" : "text-red-500"
                )}>
                  {k.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly appointments bar chart */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-3 px-3">
          <p className="text-sm font-bold text-foreground mb-1">
            Appointments — last 6 months
          </p>
          <p className="text-[10px] text-muted-foreground mb-4">
            Total booked, completed, and cancelled per month
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data.monthlyData}
              margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
              barSize={10}
            >
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  padding: "6px 10px",
                }}
              />
              <Bar
                dataKey="total"
                name="Total"
                fill="#185FA5"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cancelled"
                name="Cancelled"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[
              { color: "#185FA5", label: "Total" },
              { color: "#10b981", label: "Completed" },
              { color: "#ef4444", label: "Cancelled" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: l.color }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status breakdown donut */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-3 px-3">
          <p className="text-sm font-bold text-foreground mb-1">
            Appointment status breakdown
          </p>
          <p className="text-[10px] text-muted-foreground mb-2">
            All-time distribution across all statuses
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.statusData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  padding: "6px 10px",
                }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service popularity */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-3 px-3">
          <p className="text-sm font-bold text-foreground mb-1">
            Bookings by service
          </p>
          <p className="text-[10px] text-muted-foreground mb-4">
            Which services are booked most often
          </p>
          {data.serviceData.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {data.serviceData.map((s, i) => {
                const max = data.serviceData[0]?.value || 1;
                const pct = Math.round((s.value / max) * 100);
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground truncate pr-2">
                        {s.name}
                      </p>
                      <p className="text-xs font-bold text-foreground shrink-0">
                        {s.value}
                      </p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor workload */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-3 px-3">
          <p className="text-sm font-bold text-foreground mb-1">
            Doctor workload
          </p>
          <p className="text-[10px] text-muted-foreground mb-4">
            Total appointments and completions per practitioner
          </p>
          {data.doctorData.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              No data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={data.doctorData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barSize={8}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  tickFormatter={v =>
                    v.length > 10 ? v.split(" ").slice(-1)[0] : v
                  }
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    padding: "6px 10px",
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#185FA5"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Active doctors",
            value: data.activeDoctors,
            icon: Activity,
            color: "text-violet-600",
          },
          {
            label: "Total appointments",
            value: data.thisMonthCount + data.lastMonthCount,
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            label: "All patients",
            value: data.totalPatients,
            icon: Users,
            color: "text-emerald-600",
          },
        ].map(s => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-3 text-center">
              <s.icon size={16} className={cn("mx-auto mb-1", s.color)} />
              <p className="text-base font-extrabold text-foreground">
                {s.value}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight">
                {s.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">
            Recent activity
          </h2>
          <button
            className="flex items-center gap-0.5 text-[11px] font-semibold text-primary"
            onClick={() => navigate("/admin/appointments")}
          >
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-2">
          {data.recent.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No appointments yet
            </p>
          ) : (
            data.recent.map(appt => (
              <Card key={appt.id} className="border shadow-sm">
                <CardContent className="flex items-center justify-between p-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {appt.patient_name || "Self"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {appt.services?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[11px] text-muted-foreground">
                      {appt.appointment_date
                        ? new Date(appt.appointment_date + "T12:00:00")
                            .toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                        : ""}
                    </p>
                    <p
                      className="text-[10px] font-bold"
                      style={{
                        color: STATUS_COLORS[appt.status] || "#888",
                      }}
                    >
                      {appt.status}
                    </p>
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
