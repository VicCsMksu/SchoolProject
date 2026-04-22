import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";
import { getAdminDerivedStatus, isSessionPast } from "@/lib/sessionUtils";
import { cn } from "@/lib/utils";

type Appointment = Tables<"appointments"> & {
  doctors?: { name: string } | null;
  services?: { name: string } | null;
};

type FilterStatus =
  | "all"
  | "pending"
  | "approved"
  | "pending_reschedule"
  | "reschedule_offered"
  | "completed"
  | "cancelled";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
  Rescheduled: "bg-violet-100 text-violet-700",
  "Pending Reschedule": "bg-orange-100 text-orange-700",
  "Reschedule Offered": "bg-cyan-100 text-cyan-700",
};

const sessions = [
  { label: "Morning Session 1", value: "8:00 AM – 10:00 AM" },
  { label: "Morning Session 2", value: "10:00 AM – 12:00 PM" },
  { label: "Afternoon Session 1", value: "2:00 PM – 4:00 PM" },
  { label: "Afternoon Session 2", value: "4:00 PM – 6:00 PM" },
];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitNote, setVisitNote] = useState("");
  const [showInstructionForm, setShowInstructionForm] = useState(false);
  const [showRescheduleOffer, setShowRescheduleOffer] = useState(false);
  const [instructionTitle, setInstructionTitle] = useState("");
  const [instructionBody, setInstructionBody] = useState("");
  const [offerDate, setOfferDate] = useState("");
  const [offerTime, setOfferTime] = useState("");
  const [offerNote, setOfferNote] = useState("");

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctors(name), services(name)")
      .order("created_at", { ascending: false });
    if (!error && data) setAppointments(data as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (
    id: string,
    status: string,
    note?: string,
    offerData?: { date: string; time: string; note: string },
  ) => {
    const updates: Record<string, string> = { status };
    if (note) updates.visit_note = note;
    if (offerData) {
      updates.reschedule_offer_date = offerData.date;
      updates.reschedule_offer_time = offerData.time;
      updates.reschedule_offer_note = offerData.note;
    }
    const { error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, ...updates } : a)),
    );
    closeDialog();
    const messages: Record<string, string> = {
      Approved: "Appointment approved",
      Cancelled: "Appointment declined",
      Completed: "Visit completed and note saved",
      "Reschedule Offered": "Reschedule offer sent to patient",
    };
    toast.success(messages[status] || `Status updated to ${status}`);
  };

  const sendInstruction = async (patientId: string, appointmentId: string) => {
    if (!instructionTitle.trim() || !instructionBody.trim()) {
      toast.error("Please fill in both title and instruction");
      return;
    }
    const { error } = await supabase.from("patient_instructions").insert({
      patient_id: patientId,
      title: instructionTitle.trim(),
      body: instructionBody.trim(),
      appointment_id: appointmentId,
      service_name: selectedAppt?.services?.name || null,
      appointment_date: selectedAppt?.appointment_date || null,
    });
    if (error) {
      toast.error("Failed to send: " + error.message);
      return;
    }
    setInstructionTitle("");
    setInstructionBody("");
    setShowInstructionForm(false);
    toast.success("Instruction sent to patient");
  };

  const closeDialog = () => {
    setSelectedAppt(null);
    setVisitNote("");
    setShowInstructionForm(false);
    setShowRescheduleOffer(false);
    setInstructionTitle("");
    setInstructionBody("");
    setOfferDate("");
    setOfferTime("");
    setOfferNote("");
  };

  // Counts per status
  const counts: Record<FilterStatus, number> = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    approved: appointments.filter((a) => a.status === "Approved").length,
    pending_reschedule: appointments.filter(
      (a) => a.status === "Pending Reschedule",
    ).length,
    reschedule_offered: appointments.filter(
      (a) => a.status === "Reschedule Offered",
    ).length,
    completed: appointments.filter(
      (a) =>
        getAdminDerivedStatus(
          a.status,
          a.appointment_date,
          a.appointment_time,
        ) === "Completed",
    ).length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
  };

  const filterButtons: { key: FilterStatus; label: string; color: string }[] = [
    { key: "all", label: "All", color: "bg-muted text-muted-foreground" },
    { key: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
    { key: "approved", label: "Approved", color: "bg-blue-100 text-blue-700" },
    {
      key: "pending_reschedule",
      label: "Reschedule Req.",
      color: "bg-orange-100 text-orange-700",
    },
    {
      key: "reschedule_offered",
      label: "Offer Sent",
      color: "bg-cyan-100 text-cyan-700",
    },
    {
      key: "completed",
      label: "Completed",
      color: "bg-emerald-100 text-emerald-700",
    },
    { key: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  ];

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      (a.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.services?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.doctors?.name || "").toLowerCase().includes(search.toLowerCase());

    const derivedStatus = getAdminDerivedStatus(
      a.status,
      a.appointment_date,
      a.appointment_time,
    );

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "pending" && a.status === "Pending") ||
      (activeFilter === "approved" && a.status === "Approved") ||
      (activeFilter === "pending_reschedule" &&
        a.status === "Pending Reschedule") ||
      (activeFilter === "reschedule_offered" &&
        a.status === "Reschedule Offered") ||
      (activeFilter === "completed" && derivedStatus === "Completed") ||
      (activeFilter === "cancelled" && a.status === "Cancelled");

    return matchesSearch && matchesFilter;
  });

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

      {/* Summary stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: counts.all, color: "text-foreground" },
          { label: "Pending", value: counts.pending, color: "text-amber-600" },
          {
            label: "Reschedule",
            value: counts.pending_reschedule,
            color: "text-orange-600",
          },
          {
            label: "Completed",
            value: counts.completed,
            color: "text-emerald-600",
          },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-2.5 text-center">
              <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] font-medium text-muted-foreground leading-tight">
                {s.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search patients, services, doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all border",
              activeFilter === f.key
                ? `${f.color} border-transparent ring-2 ring-primary/30`
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                  activeFilter === f.key ? "bg-white/40" : "bg-muted",
                )}
              >
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointment list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No appointments found
          </div>
        )}
        {filtered.map((appt) => {
          const derived = getAdminDerivedStatus(
            appt.status,
            appt.appointment_date,
            appt.appointment_time,
          );
          const isPendingReschedule = appt.status === "Pending Reschedule";
          return (
            <Card
              key={appt.id}
              className={cn(
                "border shadow-sm cursor-pointer transition-colors hover:bg-muted/50",
                isPendingReschedule && "border-orange-300 bg-orange-50/40",
              )}
              onClick={() => setSelectedAppt(appt)}
            >
              <CardContent className="p-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isPendingReschedule && (
                      <div className="flex items-center gap-1 mb-1">
                        <AlertCircle size={12} className="text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                          Reschedule request
                        </span>
                      </div>
                    )}
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
                  <div className="text-right shrink-0 ml-2 space-y-1">
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1.5 py-0.5 ${statusColors[derived] || statusColors[appt.status] || ""}`}
                    >
                      {derived}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                      <Clock size={10} />
                      {appt.appointment_time}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {appt.appointment_date
                        ? new Date(appt.appointment_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedAppt}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Appointment Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review and manage this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppt && (
            <div className="space-y-3">
              {/* Info rows */}
              <div className="space-y-2 rounded-xl bg-muted/40 p-3">
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
                    <span className="font-medium text-foreground text-right max-w-[60%]">
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm items-center pt-1">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${statusColors[selectedAppt.status] || ""}`}
                  >
                    {selectedAppt.status}
                  </Badge>
                </div>
              </div>

              {/* Patient notes */}
              {selectedAppt.notes && (
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Patient notes
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedAppt.notes}
                  </p>
                </div>
              )}

              {/* Reschedule request details */}
              {selectedAppt.status === "Pending Reschedule" && (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle size={14} className="text-orange-600" />
                    <p className="text-xs font-bold text-orange-700">
                      Patient requested reschedule
                    </p>
                  </div>
                  {selectedAppt.appointment_date && (
                    <p className="text-xs text-orange-700">
                      Requested date:{" "}
                      {new Date(
                        selectedAppt.appointment_date,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {selectedAppt.reschedule_reason && (
                    <p className="text-xs text-orange-700">
                      Reason: {selectedAppt.reschedule_reason}
                    </p>
                  )}
                </div>
              )}

              {/* Reschedule offer details */}
              {selectedAppt.reschedule_offer_date && (
                <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-3 space-y-1">
                  <p className="text-xs font-bold text-cyan-700">
                    Reschedule offer sent
                  </p>
                  <p className="text-xs text-cyan-700">
                    Offered:{" "}
                    {new Date(
                      selectedAppt.reschedule_offer_date,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at {selectedAppt.reschedule_offer_time}
                  </p>
                  {selectedAppt.reschedule_offer_note && (
                    <p className="text-xs text-cyan-700">
                      Note: {selectedAppt.reschedule_offer_note}
                    </p>
                  )}
                </div>
              )}

              {/* Cancel/reschedule reasons */}
              {selectedAppt.cancel_reason && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    Cancel reason
                  </p>
                  <p className="text-sm text-red-700">
                    {selectedAppt.cancel_reason}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {selectedAppt.status === "Pending" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Approved")}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Cancelled")}
                  >
                    <XCircle size={13} /> Decline
                  </Button>
                </div>
              )}

              {selectedAppt.status === "Pending Reschedule" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => updateStatus(selectedAppt.id, "Approved")}
                    >
                      <CheckCircle2 size={13} /> Approve Time
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs gap-1"
                      onClick={() => updateStatus(selectedAppt.id, "Cancelled")}
                    >
                      <XCircle size={13} /> Decline
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1 border-cyan-400 text-cyan-700 hover:bg-cyan-50"
                    onClick={() => setShowRescheduleOffer(true)}
                  >
                    <RotateCw size={13} /> Offer a different time
                  </Button>
                </div>
              )}

              {selectedAppt.status === "Reschedule Offered" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Approved")}
                  >
                    <CheckCircle2 size={13} /> Confirm Offer
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs gap-1"
                    onClick={() => updateStatus(selectedAppt.id, "Cancelled")}
                  >
                    <XCircle size={13} /> Cancel
                  </Button>
                </div>
              )}

              {selectedAppt.status === "Approved" &&
                !isSessionPast(
                  selectedAppt.appointment_date,
                  selectedAppt.appointment_time,
                ) && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Visit note (optional)
                    </Label>
                    <Textarea
                      value={visitNote}
                      onChange={(e) => setVisitNote(e.target.value)}
                      placeholder="e.g. Adjustment done. Next visit in 5 weeks."
                      rows={2}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      onClick={() =>
                        updateStatus(selectedAppt.id, "Completed", visitNote)
                      }
                    >
                      <CheckCircle2 size={13} /> Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1 border-cyan-400 text-cyan-700 hover:bg-cyan-50"
                      onClick={() => setShowRescheduleOffer(true)}
                    >
                      <RotateCw size={13} /> Offer reschedule to patient
                    </Button>
                  </div>
                )}

              {/* Reschedule offer form */}
              {showRescheduleOffer && (
                <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3 space-y-3">
                  <p className="text-xs font-bold text-cyan-800">
                    Propose a new time to patient
                  </p>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      New Date
                    </Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={offerDate}
                      onChange={(e) => setOfferDate(e.target.value)}
                      className="h-9 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      New Session
                    </Label>
                    <select
                      value={offerTime}
                      onChange={(e) => setOfferTime(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a session</option>
                      {sessions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label} ({s.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Note to patient (optional)
                    </Label>
                    <Textarea
                      value={offerNote}
                      onChange={(e) => setOfferNote(e.target.value)}
                      placeholder="e.g. Dr. Amina is unavailable on your chosen date. We can see you on this date instead."
                      rows={2}
                      className="text-sm mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      disabled={!offerDate || !offerTime}
                      onClick={() =>
                        updateStatus(
                          selectedAppt.id,
                          "Reschedule Offered",
                          undefined,
                          { date: offerDate, time: offerTime, note: offerNote },
                        )
                      }
                    >
                      Send Offer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setShowRescheduleOffer(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Send instruction */}
              {selectedAppt.status !== "Cancelled" && (
                <div className="border-t border-border pt-2">
                  {!showInstructionForm ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => setShowInstructionForm(true)}
                    >
                      <FileText size={13} className="mr-1" />
                      Send care instruction to patient
                    </Button>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-semibold">Send instruction</p>
                      <Input
                        placeholder="Title e.g. Post-adjustment care"
                        value={instructionTitle}
                        onChange={(e) => setInstructionTitle(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Textarea
                        placeholder="e.g. Avoid hard foods for 48 hours..."
                        value={instructionBody}
                        onChange={(e) => setInstructionBody(e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() =>
                            sendInstruction(
                              selectedAppt.patient_id,
                              selectedAppt.id,
                            )
                          }
                        >
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => setShowInstructionForm(false)}
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
