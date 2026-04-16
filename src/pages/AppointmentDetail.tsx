import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, Stethoscope, Info, RotateCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Rescheduled: "bg-blue-100 text-blue-700 border-blue-200",
};

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useAppointments();
  const appointment = appointments.find((a) => a.id === id);

  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  if (!appointment) {
    return (
      <div className="px-5 pt-8 text-center">
        <p className="text-muted-foreground">Appointment not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/appointments")}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const serviceName = appointment.services?.name || "";
  const doctorName = appointment.doctors?.name || "";

  const handleReschedule = () => {
    updateAppointment.mutate({
      id: appointment.id,
      updates: {
        appointment_date: newDate,
        appointment_time: newTime,
        status: "Rescheduled",
        reschedule_reason: rescheduleReason,
      },
    });
    setShowReschedule(false);
    toast.success("Appointment rescheduled");
  };

  const handleCancel = () => {
    updateAppointment.mutate({
      id: appointment.id,
      updates: {
        status: "Cancelled",
        cancel_reason: cancelReason,
      },
    });
    setShowCancel(false);
    toast.success("Appointment cancelled");
  };

  const isActive = appointment.status !== "Cancelled" && appointment.status !== "Completed";

  return (
    <div className="px-5 pt-4 pb-8">
      <div className="flex items-start gap-3 mb-4">
        <button onClick={() => navigate("/appointments")} className="mt-1">
          <ArrowLeft size={20} className="text-primary" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-primary">Appointment Details</h1>
          <p className="text-[11px] text-muted-foreground">
            View and manage your appointments easily.
          </p>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Patient Details */}
      <div className="flex items-center gap-2 mb-3">
        <User size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-primary">Patient Details</h3>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-3 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Full Name</p>
          <p className="text-sm text-foreground">{appointment.patient_name || "Self"}</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-primary">Appointment Info</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] font-semibold", statusColors[appointment.status])}>
          {appointment.status}
        </Badge>
      </div>
      <Separator className="mb-3" />

      <div className="space-y-3 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Service</p>
          <p className="text-sm font-medium text-primary">{serviceName}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</p>
          <p className="text-sm text-foreground">{formatDate(appointment.appointment_date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Time</p>
          <p className="text-sm text-foreground">{appointment.appointment_time}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Mode</p>
          <p className="text-sm text-foreground">{appointment.mode}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Practitioner</p>
          <p className="text-sm text-foreground">{doctorName}</p>
        </div>
      </div>

      {appointment.status === "Pending" && (
        <div className="mb-5 rounded-lg border border-primary/20 bg-secondary p-3 flex gap-2">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This appointment is still pending and under review.
          </p>
        </div>
      )}

      {appointment.status === "Rescheduled" && (
        <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-800">Appointment Rescheduled</p>
          </div>
          {appointment.reschedule_reason && (
            <p className="text-[11px] text-amber-700">
              <span className="font-semibold">Reason:</span> {appointment.reschedule_reason}
            </p>
          )}
        </div>
      )}

      {appointment.status === "Cancelled" && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-red-600" />
            <p className="text-xs font-semibold text-red-800">Appointment Cancelled</p>
          </div>
          {appointment.cancel_reason && (
            <p className="text-[11px] text-red-700">
              <span className="font-semibold">Reason:</span> {appointment.cancel_reason}
            </p>
          )}
        </div>
      )}

      {isActive && (
        <>
          <Separator className="mb-3" />
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-3">Manage Appointment</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full rounded-full font-semibold border-amber-400 text-amber-700 hover:bg-amber-50" onClick={() => setShowReschedule(true)}>
              <RotateCw size={16} /> Reschedule
            </Button>
            <Button variant="outline" className="w-full rounded-full font-semibold border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowCancel(true)}>
              <XCircle size={16} /> Cancel
            </Button>
          </div>
        </>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader><DialogTitle className="text-center">Reschedule Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">New Date</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">New Time</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Reason</Label>
              <Textarea value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="Reason for rescheduling..." rows={3} />
            </div>
            <Button className="w-full rounded-full font-semibold" disabled={!newDate || !newTime} onClick={handleReschedule}>Reschedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader><DialogTitle className="text-center">Cancel Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Reason</Label>
              <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3} />
            </div>
            <Button variant="destructive" className="w-full rounded-full font-semibold" onClick={handleCancel}>Cancel Appointment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentDetail;
