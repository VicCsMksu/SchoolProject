import {
  Users, Calendar, Activity, Clock,
  TrendingUp, TrendingDown, ChevronRight,
  CheckCircle2, RotateCw, Stethoscope,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const CHART_COLORS = [
  "#185FA5","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4",
];

const STATUS_COLORS: Record<string, string> = {
  Pending:              "#f59e0b",
  Approved:             "#3b82f6",
  Completed:            "#10b981",
  Cancelled:            "#ef4444",
  Rescheduled:          "#8b5cf6",
  "Pending Reschedule": "#f97316",
  "Reschedule Offered": "#06b6d4",
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const SESSION_LABELS: Record<string, string> = {
  "8:00 AM – 10:00 AM":  "8–10 AM",
  "10:00 AM – 12:00 PM": "10–12 PM",
  "2:00 PM – 4:00 PM":   "2–4 PM",
  "4:00 PM – 6:00 PM":   "4–6 PM",
};

const getMonthKey = (dateStr: string) => {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
};

const getLast6Months = () => {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,
      label: MONTHS[d.getMonth()],
    });
  }
  return result;
};

const trendPct = (curr: number, prev: number) => {
  if (prev === 0) return { pct: 0, up: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
};

// ── section toggle ────────────────────────────────────────────────────────────
const SectionToggle = ({
  title, subtitle, open, onToggle,
}: {
  title: string; subtitle: string;
  open: boolean; onToggle: () => void;
}) => (
  <button
    className="flex w-full items-center justify-between py-1"
    onClick={onToggle}
  >
    <div className="text-left">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="text-[10px] text-muted-foreground">{subtitle}</p>
    </div>
    {open
      ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
      : <ChevronDown size={16} className="text-muted-foreground shrink-0" />
    }
  </button>
);

// ── component ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const months = getLast6Months();
  const thisMonthKey = months[5].key;
  const lastMonthKey = months[4].key;

  const [openAppt,    setOpenAppt]    = useState(true);
  const [openService, setOpenService] = useState(false);
  const [openDoctor,  setOpenDoctor]  = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics-v2"],
    queryFn: async () => {
      const [profilesRes, appointmentsRes, doctorsRes] =
        await Promise.all([
          supabase.from("profiles").select("id, created_at", { count: "exact" }),
          supabase.from("appointments").select("*, services(name), doctors(name)"),
          supabase.from("doctors").select("id, name, status, specialty, service_id, services(name)"),
        ]);

      const appts    = appointmentsRes.data || [];
      const profiles = profilesRes.data    || [];
      const doctors  = doctorsRes.data     || [];

      // ── KPI ──────────────────────────────────────────────────────────────
      const thisMonthAppts   = appts.filter(a => getMonthKey(a.appointment_date) === thisMonthKey);
      const lastMonthAppts   = appts.filter(a => getMonthKey(a.appointment_date) === lastMonthKey);
      const thisMonthPts     = profiles.filter(p => p.created_at &&
        getMonthKey(p.created_at.split("T")[0]) === thisMonthKey).length;
      const completedAll     = appts.filter(a => a.status === "Completed");
      const completionRate   = appts.length > 0
        ? Math.round((completedAll.length / appts.length) * 100) : 0;
      const lastMonthRate    = lastMonthAppts.length > 0
        ? Math.round(
            lastMonthAppts.filter(a => a.status === "Completed").length /
            lastMonthAppts.length * 100
          ) : 0;
      const pendingReschedule = appts.filter(a => a.status === "Pending Reschedule").length;

      // ── APPOINTMENT section ───────────────────────────────────────────────

      // Monthly bar chart
      const monthlyData = months.map(m => ({
        month: m.label,
        Total:     appts.filter(a => getMonthKey(a.appointment_date) === m.key).length,
        Completed: appts.filter(a => getMonthKey(a.appointment_date) === m.key && a.status === "Completed").length,
        Cancelled: appts.filter(a => getMonthKey(a.appointment_date) === m.key && a.status === "Cancelled").length,
      }));

      // Status donut
      const statusCounts: Record<string, number> = {};
      appts.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
      const statusData = Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Session slot popularity
      const sessionCounts: Record<string, number> = {};
      appts.forEach(a => {
        const slot = SESSION_LABELS[a.appointment_time] || a.appointment_time || "Unknown";
        sessionCounts[slot] = (sessionCounts[slot] || 0) + 1;
      });
      const sessionData = Object.entries(sessionCounts)
        .map(([slot, count]) => ({ slot, count }))
        .sort((a, b) => b.count - a.count);

      // Day of week distribution
      const dayCounts = Array(7).fill(0);
      appts.forEach(a => {
        if (a.appointment_date) {
          const day = new Date(a.appointment_date + "T12:00:00").getDay();
          dayCounts[day] += 1;
        }
      });
      const dayData = DAYS.map((d, i) => ({ day: d, count: dayCounts[i] }));

      // Lead time average (days between created_at and appointment_date)
      const leadTimes = appts
        .filter(a => a.created_at && a.appointment_date)
        .map(a => {
          const created  = new Date(a.created_at!).getTime();
          const apptDate = new Date(a.appointment_date + "T12:00:00").getTime();
          return Math.max(0, Math.round((apptDate - created) / 86400000));
        });
      const avgLeadTime = leadTimes.length > 0
        ? Math.round(leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length) : 0;

      // Reschedule rate
      const rescheduleRate = appts.length > 0
        ? Math.round(
            appts.filter(a =>
              a.status === "Rescheduled" ||
              a.status === "Pending Reschedule" ||
              a.status === "Reschedule Offered"
            ).length / appts.length * 100
          ) : 0;

      // ── SERVICE section ──────────────────────────────────────────────────

      // Bookings per service with % share
      const svcCounts: Record<string, number> = {};
      appts.forEach(a => {
        const svc = a.services?.name || "Unknown";
        svcCounts[svc] = (svcCounts[svc] || 0) + 1;
      });
      const totalAppts   = appts.length || 1;
      const serviceData  = Object.entries(svcCounts)
        .map(([name, value]) => ({
          name,
          value,
          pct: Math.round((value / totalAppts) * 100),
        }))
        .sort((a, b) => b.value - a.value);

      // Cancellation rate per service
      const svcCancelled: Record<string, number> = {};
      appts.filter(a => a.status === "Cancelled").forEach(a => {
        const svc = a.services?.name || "Unknown";
        svcCancelled[svc] = (svcCancelled[svc] || 0) + 1;
      });
      const svcCancelRate = serviceData.map(s => ({
        name: s.name,
        rate: s.value > 0
          ? Math.round(((svcCancelled[s.name] || 0) / s.value) * 100) : 0,
      }));

      // Consultation → treatment conversion
      const consultations = appts.filter(a =>
        a.services?.name?.toLowerCase().includes("consultation")
      ).length;
      const treatments = appts.filter(a =>
        !a.services?.name?.toLowerCase().includes("consultation") &&
        !a.services?.name?.toLowerCase().includes("retainer")
      ).length;
      const conversionRate = consultations > 0
        ? Math.round((treatments / consultations) * 100) : 0;

      // ── DOCTOR section ───────────────────────────────────────────────────

      // Per-doctor table
      const docMap: Record<string, {
        name: string; service: string; specialty: string;
        total: number; completed: number;
        pending: number; cancelled: number;
      }> = {};

      doctors.forEach((d) => {
        docMap[d.name] = {
          name: d.name,
          service: d.services?.name || "—",
          specialty: d.specialty || "—",
          total: 0, completed: 0, pending: 0, cancelled: 0,
        };
      });

      appts.forEach(a => {
        const doc = a.doctors?.name;
        if (!doc) return;
        if (!docMap[doc]) {
          docMap[doc] = {
            name: doc, service: "—", specialty: "—",
            total: 0, completed: 0, pending: 0, cancelled: 0,
          };
        }
        docMap[doc].total += 1;
        if (a.status === "Completed") docMap[doc].completed += 1;
        if (a.status === "Pending")   docMap[doc].pending   += 1;
        if (a.status === "Cancelled") docMap[doc].cancelled += 1;
      });

      const doctorTableData = Object.values(docMap)
        .filter(d => d.total > 0 || doctors.find((x) => x.name === d.name))
        .sort((a, b) => b.total - a.total);

      // Doctor workload radar (top 5)
      const radarData = doctorTableData.slice(0, 5).map(d => ({
        doctor: d.name.split(" ").slice(-1)[0],
        Appointments: d.total,
        Completed:    d.completed,
      }));

      // Recent activity
      const recent = [...appts]
        .sort((a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        )
        .slice(0, 5);

      return {
        // KPI
        totalPatients: profilesRes.count || 0,
        activeDoctors: doctors.filter((d) => d.status === "On Duty").length,
        thisMonthCount: thisMonthAppts.length,
        lastMonthCount: lastMonthAppts.length,
        thisMonthPts,
        completionRate,
        lastMonthRate,
        pendingReschedule,
        avgLeadTime,
        rescheduleRate,
        // Appointment
        monthlyData,
        statusData,
        sessionData,
        dayData,
        // Service
        serviceData,
        svcCancelRate,
        conversionRate,
        consultations,
        treatments,
        // Doctor
        doctorTableData,
        radarData,
        // Recent
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

  const apptTrend   = trendPct(data.thisMonthCount, data.lastMonthCount);
  const rateTrend   = trendPct(data.completionRate,  data.lastMonthRate);

  // ── KPI cards ──────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: "This month",
      value: data.thisMonthCount,
      sub: `${apptTrend.up ? "+" : "-"}${apptTrend.pct}% vs last month`,
      up: apptTrend.up,
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total patients",
      value: data.totalPatients,
      sub: `+${data.thisMonthPts} this month`,
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

  // ── shared tooltip style ───────────────────────────────────────────────────
  const ttStyle = {
    fontSize: 11, borderRadius: 8,
    border: "1px solid #e5e7eb", padding: "6px 10px",
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          MaxxDental Nairobi · live data · auto-refreshes every 60 s
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="border shadow-sm">
            <CardContent className="p-3.5 space-y-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl", k.color
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

      {/* ── APPOINTMENTS SECTION ─────────────────────────────────────────── */}
      <Card className="border shadow-sm">
        <CardContent className="px-4 pt-4 pb-3 space-y-4">
          <SectionToggle
            title="Appointments"
            subtitle="Trends, sessions, lead time, reschedule rate"
            open={openAppt}
            onToggle={() => setOpenAppt(p => !p)}
          />

          {openAppt && (
            <>
              {/* Quick stat row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Avg lead time", value: `${data.avgLeadTime}d`, note: "booking → visit" },
                  { label: "Reschedule rate", value: `${data.rescheduleRate}%`, note: "of all bookings" },
                  { label: "Active doctors", value: data.activeDoctors, note: "on duty" },
                ].map(s => (
                  <div key={s.label}
                    className="rounded-xl bg-muted/50 border border-border p-2.5 text-center">
                    <p className="text-base font-extrabold text-foreground">{s.value}</p>
                    <p className="text-[9px] font-semibold text-muted-foreground leading-tight">
                      {s.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{s.note}</p>
                  </div>
                ))}
              </div>

              {/* Monthly bar */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Monthly trend — last 6 months
                </p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart
                    data={data.monthlyData}
                    margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
                    barSize={9}
                  >
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }}
                      axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="Total"     fill="#185FA5" radius={[4,4,0,0]} />
                    <Bar dataKey="Completed" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="Cancelled" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-1 justify-center">
                  {[
                    { color: "#185FA5", label: "Total" },
                    { color: "#10b981", label: "Completed" },
                    { color: "#ef4444", label: "Cancelled" },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full"
                        style={{ background: l.color }} />
                      <span className="text-[10px] text-muted-foreground">
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status donut */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Status breakdown — all time
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.statusData} cx="50%" cy="50%"
                      innerRadius={50} outerRadius={75}
                      paddingAngle={3} dataKey="value">
                      {data.statusData.map((entry, i) => (
                        <Cell key={entry.name}
                          fill={STATUS_COLORS[entry.name] ||
                                CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} />
                    <Legend iconSize={8}
                      wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Session slot popularity */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Session slot popularity
                </p>
                <div className="space-y-2.5">
                  {data.sessionData.map((s, i) => {
                    const max = data.sessionData[0]?.count || 1;
                    return (
                      <div key={s.slot} className="space-y-1">
                        <div className="flex justify-between">
                          <p className="text-xs font-medium text-foreground">
                            {s.slot}
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {s.count}
                          </p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${Math.round((s.count / max) * 100)}%`,
                              background: CHART_COLORS[i % CHART_COLORS.length],
                            }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day of week */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Bookings by day of week
                </p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={data.dayData}
                    margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
                    barSize={18}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#888" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }}
                      axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="count" name="Bookings"
                      fill="#185FA5" radius={[4,4,0,0]}>
                      {data.dayData.map((entry, i) => (
                        <Cell key={i}
                          fill={entry.count === Math.max(
                            ...data.dayData.map(d => d.count)
                          ) ? "#10b981" : "#185FA5"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  Green = busiest day
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── SERVICES SECTION ─────────────────────────────────────────────── */}
      <Card className="border shadow-sm">
        <CardContent className="px-4 pt-4 pb-3 space-y-4">
          <SectionToggle
            title="Services"
            subtitle="Popularity, cancellation rates, conversion"
            open={openService}
            onToggle={() => setOpenService(p => !p)}
          />

          {openService && (
            <>
              {/* Conversion stat */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Consultations",
                    value: data.consultations,
                    note: "total booked",
                  },
                  {
                    label: "Treatments",
                    value: data.treatments,
                    note: "followed up",
                  },
                  {
                    label: "Conversion",
                    value: `${data.conversionRate}%`,
                    note: "consult → treat",
                  },
                ].map(s => (
                  <div key={s.label}
                    className="rounded-xl bg-muted/50 border border-border p-2.5 text-center">
                    <p className="text-base font-extrabold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-[9px] font-semibold text-muted-foreground leading-tight">
                      {s.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{s.note}</p>
                  </div>
                ))}
              </div>

              {/* Service bookings with % share */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Bookings by service
                </p>
                <div className="space-y-3">
                  {data.serviceData.map((s, i) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground truncate pr-2">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-[10px] text-muted-foreground">
                            {s.pct}%
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {s.value}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${s.pct}%`,
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation rate per service */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Cancellation rate per service
                </p>
                <div className="space-y-2.5">
                  {data.svcCancelRate.map((s, i) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground truncate pr-2">
                          {s.name}
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {s.rate}%
                        </p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${s.rate}%`,
                            background: s.rate > 30
                              ? "#ef4444"
                              : s.rate > 15
                              ? "#f59e0b"
                              : "#10b981",
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Green = healthy · Amber = watch · Red = high cancellation
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── DOCTORS SECTION ──────────────────────────────────────────────── */}
      <Card className="border shadow-sm">
        <CardContent className="px-4 pt-4 pb-3 space-y-4">
          <SectionToggle
            title="Doctors"
            subtitle="Workload distribution, performance table"
            open={openDoctor}
            onToggle={() => setOpenDoctor(p => !p)}
          />

          {openDoctor && (
            <>
              {/* Radar chart — top 5 doctors */}
              {data.radarData.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Workload overview — top practitioners
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={data.radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="doctor"
                        tick={{ fontSize: 10, fill: "#888" }}
                      />
                      <Radar name="Appointments" dataKey="Appointments"
                        stroke="#185FA5" fill="#185FA5" fillOpacity={0.25} />
                      <Radar name="Completed" dataKey="Completed"
                        stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                      <Tooltip contentStyle={ttStyle} />
                      <Legend iconSize={8}
                        wrapperStyle={{ fontSize: 10 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Doctor table */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Full practitioner breakdown
                </p>
                {data.doctorTableData.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    No appointment data yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.doctorTableData.map(d => (
                      <div key={d.name}
                        className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {d.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {d.specialty} · {d.service}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-primary">
                              {d.total}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              total appts
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            {
                              label: "Completed",
                              value: d.completed,
                              color: "text-emerald-600",
                            },
                            {
                              label: "Pending",
                              value: d.pending,
                              color: "text-amber-600",
                            },
                            {
                              label: "Cancelled",
                              value: d.cancelled,
                              color: "text-red-500",
                            },
                          ].map(stat => (
                            <div key={stat.label}
                              className="rounded-lg bg-background border border-border p-2 text-center">
                              <p className={cn(
                                "text-sm font-bold", stat.color
                              )}>
                                {stat.value}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {stat.label}
                              </p>
                            </div>
                          ))}
                        </div>
                        {/* Completion rate bar */}
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <p className="text-[10px] text-muted-foreground">
                              Completion rate
                            </p>
                            <p className="text-[10px] font-bold text-foreground">
                              {d.total > 0
                                ? Math.round((d.completed / d.total) * 100)
                                : 0}%
                            </p>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${d.total > 0
                                  ? Math.round((d.completed / d.total) * 100)
                                  : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── RECENT ACTIVITY ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent activity</h2>
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
                              month: "short", day: "numeric",
                            })
                        : ""}
                    </p>
                    <p className="text-[10px] font-bold"
                      style={{ color: STATUS_COLORS[appt.status] || "#888" }}>
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
