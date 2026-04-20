import { useState, useEffect } from "react";
import { Calendar, Clock, Search, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";
import { getAdminDerivedStatus, isSessionPast } from "@/lib/sessionUtils";

type Appointment = Tables<"appointments"> & {
  doctors?: { name: string } | null;
  services?: { name: string } | null;
};

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  Rescheduled:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitNote, setVisitNote] = useState("");
  const [showInstructionForm, setShowInstructionForm] = useState(false);
  const [instructionTitle, setInstructionTitle] = useState("");
  const [instructionBody, setInstructionBody] = useState("");

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctors(name), services(name)")
      .order("appointment_date", { ascending: false });
    if (!error && data) setAppointments(data as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id: string, status: string, note?: string) => {
    const updates: Record<string, string> = { status };
    if (note) updates.visit_note = note;
    const { error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, status, ...(note ? { visit_note: note } : {}) } : a
    ));
    setSelectedAppt(null);
    setVisitNote("");
    const message = status === "Completed" 
      ? "Visit completed and note saved" 
      : `Appointment ${status.toLowerCase()} successfully`;
    toast.success(message);
  };

  const sendInstruction = async (patientId: string, appointmentId: string) => {
    if (!instructionTitle.trim() || !instructionBody.trim()) {
      toast.error("Please fill in both title and instruction");
      return;
    }
    const { error } = await supabase
      .from("patient_instructions")
      .insert({
        patient_id: patientId,
        title: instructionTitle.trim(),
        body: instructionBody.trim(),
        appointment_id: appointmentId,
      });
    if (error) {
      toast.error("Failed to send instruction: " + error.message);
      return;
    }
    setInstructionTitle("");
    setInstructionBody("");
    setShowInstructionForm(false);
    toast.success("Instruction sent to patient");
  };

  const filtered = appointments.filter((a) => {
    const patientName = a.patient_name || "";
    const serviceName = a.services?.name || "";
    const doctorName = a.doctors?.name || "";
    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      serviceName.toLowerCase().includes(search.toLowerCase()) ||
      doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" || a.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    approved: appointments.filter((a) => a.status === "Approved").length,
    completed: appointments.filter(
      (a) =>
        getAdminDerivedStatus(
          a.status,
          a.appointment_date,
          a.appointment_time,
        ) === "Completed",
    ).length,
  };

  if (loading)
    return (
      <div className="px-5 pt-6 text-center text-muted-foreground text-sm">
        Loading...
      </div>
    );

  return (
    <div className="px-5 pt-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Appointments</h1>
        <p className="text-xs text-muted-foreground">
          Manage all patient appointments
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Total",
            value: counts.all,
            color:
              "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
          },
          {
            label: "Pending",
            value: counts.pending,
            color:
              "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
          },
          {
            label: "Completed",
            value: counts.completed,
            color:
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
          },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] font-medium text-muted-foreground">
                {s.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search patients, services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 h-9">
          <TabsTrigger value="all" className="text-[11px]">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-[11px]">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-[11px]">
            Approved
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-[11px]">
            Done
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No appointments found
          </div>
        )}
        {filtered.map((appt) => (
          <Card
            key={appt.id}
            className="border shadow-sm cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => setSelectedAppt(appt)}
          >
            <CardContent className="p-3.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {appt.patient_name || "Self"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {appt.services?.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {appt.doctors?.name}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <Badge
                    variant="secondary"
                    className={`text-[9px] px-1.5 py-0.5 ${statusColors[getAdminDerivedStatus(appt.status, appt.appointment_date, appt.appointment_time)]}`}
                  >
                    {getAdminDerivedStatus(
                      appt.status,
                      appt.appointment_date,
                      appt.appointment_time,
                    )}
                  </Badge>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground justify-end">
                    <Clock size={11} />
                    {appt.appointment_time}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {appt.appointment_date}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAppt} onOpenChange={(open) => {
        if (!open) {
          setSelectedAppt(null);
          setVisitNote("");
          setShowInstructionForm(false);
          setInstructionTitle("");
          setInstructionBody("");
        }
      }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Appointment Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review and manage this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-3">
              <div className="space-y-2">
                {[
                  {
                    label: "Patient",
                    value: selectedAppt.patient_name || "Self",
                  },
                  {
                    label: "Service",
                    value: selectedAppt.services?.name || "",
                  },
                  { label: "Doctor", value: selectedAppt.doctors?.name || "" },
                  {
                    label: "Date",
                    value: selectedAppt.appointment_date
                      ? new Date(
                          selectedAppt.appointment_date,
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A",
                  },
                  { label: "Time", value: selectedAppt.appointment_time },
                  { label: "Mode", value: selectedAppt.mode || "" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
                {selectedAppt.notes && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Patient notes
                    </p>
                    <p className="text-sm text-foreground bg-muted rounded-lg p-2">
                      {selectedAppt.notes}
                    </p>
                  </div>
                )}
                {selectedAppt.cancel_reason && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Cancel reason
                    </p>
                    <p className="text-sm text-foreground bg-red-50 text-red-700 rounded-lg p-2">
                      {selectedAppt.cancel_reason}
                    </p>
                  </div>
                )}
                {selectedAppt.reschedule_reason && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Reschedule reason
                    </p>
                    <p className="text-sm text-foreground bg-amber-50 text-amber-700 rounded-lg p-2">
                      {selectedAppt.reschedule_reason}
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${statusColors[selectedAppt.status]}`}
                  >
                    {selectedAppt.status}
                  </Badge>
                </div>
              </div>
              {selectedAppt.status === "Pending" && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Approved")}
                  >
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Cancelled")}
                  >
                    <XCircle size={14} /> Decline
                  </Button>
                </div>
              )}
              {selectedAppt.status === "Rescheduled" && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Approved")}
                  >
                    <CheckCircle2 size={14} /> Approve New Time
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Cancelled")}
                  >
                    <XCircle size={14} /> Decline
                  </Button>
                </div>
              )}
              {selectedAppt.status === "Approved" && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Visit note (optional)
                  </p>
                  <Textarea
                    value={visitNote}
                    onChange={(e) => setVisitNote(e.target.value)}
                    placeholder="e.g. Adjustment done. Next visit in 5 weeks. Avoid hard foods."
                    rows={3}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 border-emerald-500 text-emerald-600 
                      hover:bg-emerald-100 hover:text-emerald-700"
                    onClick={() => updateStatus(selectedAppt.id, "Completed", visitNote)}
                  >
                    <CheckCircle2 size={14} /> Mark as Completed
                  </Button>
                </div>
              )}
              {selectedAppt && selectedAppt.status !== "Cancelled" && (
                <div className="pt-2 border-t border-border">
                  {!showInstructionForm ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => setShowInstructionForm(true)}
                    >
                      <FileText size={13} className="mr-1" /> Send care instruction to patient
                    </Button>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-medium text-foreground">Send instruction</p>
                      <Input
                        placeholder="Title e.g. Post-adjustment care"
                        value={instructionTitle}
                        onChange={(e) => setInstructionTitle(e.target.value)}
                        className="text-sm h-9"
                      />
                      <Textarea
                        placeholder="e.g. Avoid hard and sticky foods for 48 hours. Use wax if any wire is irritating your cheek."
                        value={instructionBody}
                        onChange={(e) => setInstructionBody(e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => sendInstruction(
                            selectedAppt.patient_id, 
                            selectedAppt.id
                          )}
                        >
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => {
                            setShowInstructionForm(false);
                            setInstructionTitle("");
                            setInstructionBody("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="h-4" />
    </div>
  );
};

export default AdminAppointments;
