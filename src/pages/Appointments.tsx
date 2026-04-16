import { CalendarPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Rescheduled: "bg-blue-100 text-blue-700 border-blue-200",
};

const Appointments = () => {
  const navigate = useNavigate();
  const { appointments, isLoading } = useAppointments();

  if (isLoading) {
    return <div className="px-5 pt-6 text-center text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Appointments</h1>
          <p className="text-xs text-muted-foreground">View and manage your upcoming and past appointments.</p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <h3 className="mb-1 text-base font-bold text-foreground">No appointments yet</h3>
          <p className="mb-6 text-center text-xs text-muted-foreground">
            You have not booked any appointments yet.
          </p>
          <Button className="rounded-full font-semibold" onClick={() => navigate("/doctors")}>
            <CalendarPlus size={18} /> Book Appointment
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-4">
            {appointments.map((appt) => (
              <Card key={appt.id} className="border shadow-sm cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/appointment/${appt.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-bold text-foreground">{appt.patient_name || "Self"}</h3>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold", statusColors[appt.status])}>
                      {appt.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-primary">{appt.services?.name}</p>
                  <p className="text-xs text-muted-foreground">{appt.doctors?.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""} · {appt.appointment_time}
                    </p>
                    <span className="text-xs text-muted-foreground">{appt.mode}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="w-full rounded-full font-semibold" onClick={() => navigate("/doctors")}>
            <Plus size={18} /> Book Appointment
          </Button>
        </>
      )}
    </div>
  );
};

export default Appointments;
