import { CalendarPlus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";
import { getDerivedStatus, isSessionPast } from "@/lib/sessionUtils";

// Completed = green, Approved = blue, Rescheduled = purple
const statusColors: Record<string, string> = {
  Pending:              "bg-amber-100 text-amber-700 border-amber-200",
  Approved:             "bg-blue-100 text-blue-700 border-blue-200",
  Completed:            "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled:            "bg-red-100 text-red-700 border-red-200",
  Rescheduled:          "bg-violet-100 text-violet-700 border-violet-200",
  "Pending Reschedule": "bg-orange-100 text-orange-700 border-orange-200",
  "Reschedule Offered": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

type FilterTab = "upcoming" | "pending" | "completed" | "cancelled";

const Appointments = () => {
  const navigate = useNavigate();
  const { appointments, isLoading } = useAppointments();
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");

  const today = new Date().toISOString().split("T")[0];

  const getCount = (tab: FilterTab) => {
    return appointments.filter(a => {
      const d = getDerivedStatus(a.status, a.appointment_date, a.appointment_time);
      if (tab === "upcoming")
        return a.status === "Approved" && !isSessionPast(a.appointment_date, a.appointment_time);
      if (tab === "pending")
        return a.status === "Pending";
      if (tab === "completed") return d === "Completed";
      if (tab === "cancelled") return a.status === "Cancelled";
      return false;
    }).length;
  };

  const filtered = appointments.filter(a => {
    const d = getDerivedStatus(a.status, a.appointment_date, a.appointment_time);
    if (activeTab === "upcoming")
      return a.status === "Approved" && !isSessionPast(a.appointment_date, a.appointment_time);
    if (activeTab === "pending")
      return a.status === "Pending";
    if (activeTab === "completed") return d === "Completed";
    if (activeTab === "cancelled") return a.status === "Cancelled";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.appointment_date).getTime();
    const db = new Date(b.appointment_date).getTime();
    return activeTab === "upcoming" ? da - db : db - da;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "upcoming",   label: "Upcoming" },
    { key: "pending", label: "Pending" },
    { key: "completed",  label: "Completed" },
    { key: "cancelled",  label: "Cancelled" },
  ];

  const emptyMsg: Record<FilterTab, string> = {
    upcoming:   "No upcoming appointments",
    pending: "No pending appointments",
    completed:  "No completed appointments",
    cancelled:  "No cancelled appointments",
  };

  if (isLoading) {
    return (
      <div className="px-5 pt-6 text-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-primary">Appointments</h1>
        <p className="text-xs text-muted-foreground">
          View and manage your appointments.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {tabs.map(t => {
          const count = getCount(t.key);
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5",
                "text-[11px] font-semibold transition-all",
                activeTab === t.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              {t.label}
              {count > 0 && (
                <span className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                  activeTab === t.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <h3 className="mb-1 text-base font-bold text-foreground">
            {emptyMsg[activeTab]}
          </h3>
          <p className="mb-6 text-center text-xs text-muted-foreground">
            {activeTab === "upcoming" ? "Book an appointment to get started." : "Nothing here yet."}
          </p>
          {activeTab === "upcoming" && (
            <Button className="rounded-full font-semibold"
              onClick={() => navigate("/appointment/book")}>
              <CalendarPlus size={18} /> Book Appointment
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-4">
            {sorted.map(appt => {
              const derived = getDerivedStatus(
                appt.status, appt.appointment_date, appt.appointment_time
              );
              return (
                <Card
                  key={appt.id}
                  className={cn(
                    "border shadow-sm cursor-pointer transition-shadow hover:shadow-md",
                    appt.status === "Reschedule Offered" && "border-cyan-300 bg-cyan-50/30",
                    appt.status === "Pending Reschedule" && "border-orange-300 bg-orange-50/30",
                  )}
                  onClick={() => navigate(`/appointment/${appt.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-bold text-foreground">
                        {appt.patient_name || "Self"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold shrink-0 ml-2",
                          statusColors[derived] || statusColors[appt.status] || ""
                        )}
                      >
                        {derived}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      {appt.services?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appt.doctors?.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {appt.appointment_date
                          ? new Date(appt.appointment_date + "T12:00:00")
                              .toLocaleDateString("en-US", {
                                month: "long", day: "numeric", year: "numeric",
                              })
                          : ""}{" "}
                        · {appt.appointment_time}
                      </p>
                      <span className="text-xs text-muted-foreground">{appt.mode}</span>
                    </div>
                    {appt.status === "Reschedule Offered" && (
                      <p className="mt-2 text-[11px] font-semibold text-cyan-700">
                        Tap to review clinic's proposed new time
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button
            className="w-full rounded-full font-semibold"
            onClick={() => navigate("/appointment/book")}
          >
            <Plus size={18} /> Book Appointment
          </Button>
        </>
      )}
    </div>
  );
};

export default Appointments;