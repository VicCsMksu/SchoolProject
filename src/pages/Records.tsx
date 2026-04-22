import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Calendar,
  FileText,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { isSessionPast } from "@/lib/sessionUtils";

const tabs = ["Treatment", "Visits", "Instructions"];

const stages = [
  "Consultation",
  "X-rays & Assessment",
  "Braces Fitted",
  "Active Treatment",
  "Final Adjustment",
  "Braces Removed",
  "Retainer Phase",
];

const formatDate = (value?: string | null) => {
  if (!value) return "TBD";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getVisitChecklist = (serviceName: string): string[] => {
  const base = [
    "Bring your National ID or passport for registration",
    "Arrive at least 10 minutes before your session time",
    "Submit your details at the reception desk on arrival",
    "Inform the receptionist of any allergies or current medications",
  ];

  if (serviceName.toLowerCase().includes("consultation")) {
    return [
      ...base,
      "Bring any previous dental X-rays or records if available",
      "Prepare to discuss your dental concerns and treatment goals",
      "The doctor will perform a full oral examination and take X-rays",
      "You will receive a personalised treatment plan and cost estimate",
    ];
  }

  if (serviceName.toLowerCase().includes("metal") || 
      serviceName.toLowerCase().includes("ceramic") ||
      serviceName.toLowerCase().includes("self-ligating")) {
    return [
      ...base,
      "Brush and floss thoroughly before your appointment",
      "Avoid eating hard or sticky foods 24 hours before fitting",
      "The fitting session takes approximately 60–90 minutes",
      "Expect mild soreness for 3–5 days after fitting — paracetamol helps",
      "You will receive dietary guidelines and a cleaning kit after fitting",
    ];
  }

  if (serviceName.toLowerCase().includes("aligner")) {
    return [
      ...base,
      "Bring your current aligner tray if switching to a new set",
      "Ensure teeth are clean before the appointment",
      "Each tray review takes approximately 30–45 minutes",
      "You will receive your next set of trays and wear schedule",
    ];
  }

  if (serviceName.toLowerCase().includes("retainer")) {
    return [
      ...base,
      "Bring your current retainer if you have one",
      "Fitting takes approximately 20–30 minutes",
      "You will be shown how to clean and store your retainer",
      "Wear retainer as directed every night to maintain your results",
    ];
  }

  // Default for adjustment visits
  return [
    ...base,
    "Brush and floss thoroughly before your adjustment visit",
    "Each adjustment visit takes approximately 20–30 minutes",
    "Mild soreness for 1–3 days after adjustment is normal",
    "Avoid hard foods (nuts, raw carrots, hard sweets) for 48 hours",
    "Contact the clinic immediately if a bracket comes loose",
  ];
};

const Records = () => {
  const [activeTab, setActiveTab] = useState("Treatment");
  const { user, loading: authLoading } = useAuth();

  // Treatment progress query
  const { data: treatmentProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["treatment-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treatment_progress")
        .select("*")
        .eq("patient_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    retry: false,
  });

  // Completed visits query — appointments with status Completed or Approved with past sessions
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ["visit-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctors(name), services(name)")
        .eq("patient_id", user?.id || "")
        .in("status", ["Completed", "Approved"])
        .order("appointment_date", { ascending: false });
      if (error) throw error;

      // Filter client-side: include Completed OR (Approved + session past)
      return (data || []).filter(
        (v) =>
          v.status === "Completed" ||
          isSessionPast(v.appointment_date, v.appointment_time)
      );
    },
    enabled: !!user,
    retry: false,
  });

  // Patient instructions query
  const { data: instructions = [], isLoading: instructionsLoading } = useQuery({
    queryKey: ["patient-instructions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_instructions")
        .select("*, appointments(appointment_date, appointment_time, services(name))")
        .eq("patient_id", user?.id || "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });

  // Treatment progress calculations
  const startDate = treatmentProgress?.start_date
    ? new Date(treatmentProgress.start_date)
    : null;
  const endDate = treatmentProgress?.expected_end_date
    ? new Date(treatmentProgress.expected_end_date)
    : null;
  const today = new Date();

  const totalMs =
    startDate && endDate ? endDate.getTime() - startDate.getTime() : 0;
  const elapsedMs = startDate ? today.getTime() - startDate.getTime() : 0;
  const progressPercent =
    totalMs > 0
      ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)))
      : 0;
  const totalMonths =
    totalMs > 0
      ? Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24 * 30)))
      : 0;
  const currentMonth = startDate
    ? Math.min(
        totalMonths,
        Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24 * 30))),
      )
    : 0;

  const currentStageIndex = treatmentProgress?.current_stage
    ? Math.max(0, stages.indexOf(treatmentProgress.current_stage))
    : 0;

  const isLoading = authLoading || progressLoading;

  return (
    <div className="px-5 pt-8 pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">My Records</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your treatment, visit history, and clinic instructions.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "Treatment" && <ClipboardList size={14} />}
            {tab === "Visits" && <Calendar size={14} />}
            {tab === "Instructions" && <BookOpen size={14} />}
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: Treatment Summary */}
      {activeTab === "Treatment" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !treatmentProgress ? (
            <div
              className="flex min-h-[50vh] flex-col items-center justify-center gap-4 
              rounded-3xl border border-border bg-background/80 p-8 text-center"
            >
              <ClipboardList size={32} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-primary">
                No active treatment
              </h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Once your orthodontist starts your treatment plan, your progress
                will appear here.
              </p>
              <Button asChild variant="secondary">
                <Link to="/doctors">Book a Consultation</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Active treatment card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="space-y-5 pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Active treatment
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-foreground">
                        {treatmentProgress.service_name || "Orthodontic Care"}
                      </h2>
                    </div>
                    <Badge className="rounded-full px-3 text-xs">
                      {treatmentProgress.current_stage || "Consultation"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-muted/40 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Started
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatDate(treatmentProgress.start_date)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/40 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Expected end
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatDate(treatmentProgress.expected_end_date)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Overall progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} />
                    <p className="text-xs text-muted-foreground">
                      Month {currentMonth} of {totalMonths}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stage timeline */}
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-foreground mb-4">
                    Treatment stages
                  </p>
                  <div className="space-y-5">
                    {stages.map((stage, index) => {
                      const isComplete = index < currentStageIndex;
                      const isCurrent = index === currentStageIndex;
                      return (
                        <div key={stage} className="relative pl-10">
                          <div className="absolute left-0 top-1 flex h-full w-6 items-start justify-center">
                            <div className="relative flex h-6 w-6 items-center justify-center">
                              {isComplete ? (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                                  <Check size={13} />
                                </span>
                              ) : isCurrent ? (
                                <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                  <span className="absolute inset-0 animate-pulse rounded-full bg-primary/30" />
                                  <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
                                </span>
                              ) : (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-background" />
                              )}
                            </div>
                          </div>
                          <div className="rounded-xl border border-border bg-muted/40 p-3">
                            <p className="text-sm font-semibold text-foreground">
                              {stage}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {isComplete
                                ? "Completed"
                                : isCurrent
                                  ? "In progress"
                                  : "Upcoming"}
                            </p>
                          </div>
                          {index < stages.length - 1 && (
                            <span className="absolute left-2.5 top-7 h-[calc(100%-0.5rem)] w-px bg-border" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Visit History */}
      {activeTab === "Visits" && (
        <div className="space-y-3">
          {visitsLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : visits.length === 0 ? (
            <div
              className="flex min-h-[50vh] flex-col items-center justify-center gap-4 
              rounded-3xl border border-border bg-background/80 p-8 text-center"
            >
              <Calendar size={32} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-primary">
                No visits yet
              </h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Your completed appointment visits will appear here, including
                any notes from your practitioner.
              </p>
            </div>
          ) : (
            visits.map((visit) => (
              <Card key={visit.id} className="border-0 shadow-sm overflow-hidden">
                {/* Visit header */}
                <div className="bg-primary/5 border-b border-border px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {visit.services?.name || "Dental Visit"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {visit.doctors?.name || "MaxxDental Clinic"}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 
                      text-[10px] font-semibold rounded-full shrink-0">
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(visit.appointment_date)}
                    </span>
                    <span>{visit.appointment_time}</span>
                  </div>
                </div>

                <CardContent className="pt-4 pb-4 space-y-4">
                  {/* Pre-visit checklist — shown for all visits */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Appointment guide
                    </p>
                    <div className="space-y-2">
                      {getVisitChecklist(visit.services?.name || "").map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center 
                            rounded-full bg-primary/10 mt-0.5">
                            <Check size={11} className="text-primary" />
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practitioner note — only if admin added one */}
                  {visit.visit_note && (
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1.5">
                        Practitioner note
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {visit.visit_note}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Instructions */}
      {activeTab === "Instructions" && (
        <div className="space-y-3">
          {instructionsLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : instructions.length === 0 ? (
            <div
              className="flex min-h-[50vh] flex-col items-center justify-center gap-4 
              rounded-3xl border border-border bg-background/80 p-8 text-center"
            >
              <BookOpen size={32} className="text-muted-foreground" />
              <h3 className="text-base font-bold text-primary">
                No instructions yet
              </h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Care instructions and guidance from your clinic will appear
                here.
              </p>
            </div>
          ) : (
            instructions.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center 
                      rounded-full bg-primary/10">
                      <FileText size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Linked appointment context */}
                      {item.appointments && (
                        <p className="text-[10px] uppercase tracking-widest 
                          text-muted-foreground mb-1">
                          {item.appointments.services?.name || "Your appointment"} · {" "}
                          {formatDate(item.appointments.appointment_date)}
                        </p>
                      )}
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Sent by clinic · {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Records;
