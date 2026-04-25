import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Edit,
  Baby,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type DbService = Tables<"services">;
type DbDoctor = Tables<"doctors">;

const sessions = [
  { label: "Morning Session 1", value: "8:00 AM – 10:00 AM", endHour: 10 },
  { label: "Morning Session 2", value: "10:00 AM – 12:00 PM", endHour: 12 },
  { label: "Afternoon Session 1", value: "2:00 PM – 4:00 PM", endHour: 16 },
  { label: "Afternoon Session 2", value: "4:00 PM – 6:00 PM", endHour: 18 },
];

const BookAppointment = () => {
  const today = new Date().toISOString().split("T")[0];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAppointment } = useAppointments();

  const prefilledService = searchParams.get("service") || "";
  const prefilledDoctorId = searchParams.get("doctorId") || "";

  const [step, setStep] = useState(0);
  const [bookingFor, setBookingFor] = useState<"myself" | "dependent">(
    "myself",
  );

  const { data: dependents = [] } = useQuery({
    queryKey: ["dependents", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("dependents")
        .select("*")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user && bookingFor === "dependent",
  });

  const [selectedDependentId, setSelectedDependentId] = useState("");
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Data from DB
  const [dbServices, setDbServices] = useState<DbService[]>([]);
  const [dbDoctors, setDbDoctors] = useState<DbDoctor[]>([]);

  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(prefilledDoctorId);

  // Patient details (dependent only)
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("Male");

  // Details
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch services and doctors
  useEffect(() => {
    const fetchData = async () => {
      const [sRes, dRes] = await Promise.all([
        supabase.from("services").select("*"),
        supabase.from("doctors").select("*"),
      ]);
      if (sRes.data) {
        setDbServices(sRes.data);
        // Pre-select service if prefilled
        if (prefilledService) {
          const match = sRes.data.find((s) => s.name === prefilledService);
          if (match) setSelectedServiceId(match.id);
        }
      }
      if (dRes.data) setDbDoctors(dRes.data);
    };
    fetchData();
  }, [prefilledService]);

  const selectedService = dbServices.find((s) => s.id === selectedServiceId);
  const selectedDoctor = dbDoctors.find((d) => d.id === selectedDoctorId);

  const filteredDoctors = useMemo(() => {
    if (!selectedServiceId) return dbDoctors;
    return dbDoctors.filter((d) => d.service_id === selectedServiceId);
  }, [selectedServiceId, dbDoctors]);

  const totalSteps = bookingFor === "myself" ? 5 : 6;
  const getConfirmStep = () => (bookingFor === "myself" ? 4 : 5);
  const getDetailsStep = () => (bookingFor === "myself" ? 3 : 4);

  const handleNext = () => setStep(step + 1);

  const handleSubmit = () => {
    if (!user) return;
    addAppointment.mutate(
      {
        patient_id: user.id,
        patient_name: getPatientName(),
        service_id: selectedServiceId || null,
        doctor_id: selectedDoctorId || null,
        appointment_date: date,
        appointment_time: time,
        notes,
        mode: "In-person",
        status: "Pending",
        dependent_id: bookingFor === "dependent"
          ? selectedDependentId || null
          : null,
      },
      {
        onSuccess: () => setShowSuccess(true),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const goBack = () => {
    if (step === 0) navigate(-1);
    else setStep(step - 1);
  };

  const getPatientName = () => {
    if (bookingFor === "myself") return "Self";
    const dep = dependents.find(
      (d: Tables<"dependents">) => d.id === selectedDependentId
    );
    return dep?.full_name || "Dependent";
  };

  const progressDots = (
    <div className="flex justify-center gap-2 mt-4 mb-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i === step ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </div>
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter((w) => w[0]?.match(/[A-Z]/))
      .map((w) => w[0])
      .join("")
      .slice(0, 2) || "DR";

  return (
    <div className="px-5 pt-4 pb-24">
      <button
        onClick={goBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-foreground"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Step 0: Choose who */}
      {step === 0 && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-bold text-foreground mb-1">
            Book an Appointment
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Book an appointment for yourself or a dependent.
          </p>
          <div className="flex flex-col gap-3 mb-6">
            <Button
              variant={bookingFor === "myself" ? "default" : "outline"}
              className="rounded-full font-semibold"
              onClick={() => setBookingFor("myself")}
            >
              I'm booking for myself
            </Button>
            <Button
              variant={bookingFor === "dependent" ? "default" : "outline"}
              className="rounded-full font-semibold"
              onClick={() => setBookingFor("dependent")}
            >
              I'm booking for a dependent
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              className="rounded-full px-10 font-semibold"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">
            Select a Service
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Choose the service you need.
          </p>
          <div className="space-y-2">
            {dbServices.map((s) => (
              <Card
                key={s.id}
                className={cn(
                  "border cursor-pointer transition-colors",
                  selectedServiceId === s.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50",
                )}
                onClick={() => {
                  setSelectedServiceId(s.id);
                  setSelectedDoctorId("");
                }}
              >
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button
              className="rounded-full px-10 font-semibold"
              onClick={handleNext}
              disabled={!selectedServiceId}
            >
              Next
            </Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">
            Select a Doctor
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Showing doctors for {selectedService?.name}.
          </p>
          <div className="space-y-3">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className={cn(
                  "border cursor-pointer transition-colors",
                  selectedDoctorId === doctor.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setSelectedDoctorId(doctor.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.specialty}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-muted-foreground">
                  No doctors are currently assigned to this service.
                </p>
                <p className="text-xs text-muted-foreground">
                  You can still proceed — our team will assign a practitioner
                  after reviewing your booking.
                </p>
                <Button
                  className="rounded-full px-10 font-semibold"
                  onClick={handleNext}
                >
                  Continue Anyway
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <Button
              className="rounded-full px-10 font-semibold"
              onClick={handleNext}
              disabled={filteredDoctors.length > 0 && !selectedDoctorId}
            >
              Next
            </Button>
          </div>
          {progressDots}
        </div>
      )}

  {bookingFor === "dependent" && step === 3 && (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-primary mb-1">
        Select Dependent
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Choose the family member this appointment is for.
      </p>

      {dependents.length === 0 ? (
        /* No dependents registered — gate the flow */
        <div className="flex flex-col items-center justify-center
          py-10 gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center
            rounded-full bg-muted">
            <Baby size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-1">
              No dependents found
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed
              max-w-xs mx-auto">
              You need to add a dependent in your Account page before
              booking for a family member.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full font-semibold gap-2"
            onClick={() => navigate("/account")}
          >
            <Users size={15} />
            Go to Account to add a dependent
          </Button>
          <button
            className="text-xs text-muted-foreground underline"
            onClick={() => { setBookingFor("myself"); setStep(0); }}
          >
            Book for myself instead
          </button>
        </div>
      ) : (
        /* Dependent picker */
        <div className="space-y-2">
          {dependents.map((dep: Tables<"dependents">) => {
            const age = dep.date_of_birth
              ? Math.floor(
                  (Date.now() -
                    new Date(dep.date_of_birth + "T12:00:00").getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000)
                )
              : null;
            const isSelected = selectedDependentId === dep.id;
            return (
              <Card
                key={dep.id}
                className={cn(
                  "border cursor-pointer transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:bg-muted/50"
                )}
                onClick={() => setSelectedDependentId(dep.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center",
                    "rounded-full transition-colors",
                    isSelected ? "bg-primary" : "bg-primary/10"
                  )}>
                    <Baby
                      size={18}
                      className={isSelected
                        ? "text-primary-foreground"
                        : "text-primary"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {dep.full_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {dep.relationship}
                      {age !== null && ` · ${age} yrs`}
                      {dep.gender && ` · ${dep.gender}`}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {dependents.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            className="rounded-full px-10 font-semibold"
            onClick={handleNext}
            disabled={!selectedDependentId}
          >
            Next
          </Button>
        </div>
      )}
      {progressDots}
    </div>
  )}

      {/* Appointment Details */}
      {step === getDetailsStep() && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">
            Appointment Details
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Select your preferred date and time.
          </p>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Choose a Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Clinic open Monday – Saturday. Closed Sundays.
              </p>
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Choose Preferred Time
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label} ({s.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Each session is approximately 2 hours. Please arrive 10 minutes
                early.
              </p>
            </div>
            <div>
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              className="rounded-full px-10 font-semibold"
              onClick={handleNext}
              disabled={!date || !time}
            >
              Next
            </Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Confirmation */}
      {step === getConfirmStep() && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary text-center mb-1">
            Details Confirmation
          </h2>
          <p className="text-xs text-muted-foreground text-center mb-6">
            Review everything before submitting.
          </p>

          {bookingFor === "dependent" && (
            <div className="mb-5">
              <h4 className="text-sm font-bold text-foreground mb-3">
                Patient Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-primary">
                    {getPatientName()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Sex:</span>
                  <span className="font-medium text-primary">{sex}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-primary">
                    {phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-sm font-bold text-foreground mb-3">
              Appointment Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-primary">
                  {selectedService?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-medium text-primary">
                  {selectedDoctor?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium text-primary">
                  {date
                    ? new Date(date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium text-primary">{time}</span>
              </div>
              {notes && (
                <div className="flex items-center gap-2 text-sm">
                  <Edit size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Notes:</span>
                  <span className="font-medium text-primary">{notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              className="rounded-full px-10 font-semibold"
              onClick={handleSubmit}
              disabled={addAppointment.isPending}
            >
              {addAppointment.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-primary">
              Submitted Successfully!
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-xs text-muted-foreground">
            You will receive a notification once your appointment is approved.
          </p>
          <div className="flex justify-center gap-3 mt-2">
            <Button
              variant="outline"
              className="rounded-full font-semibold"
              onClick={() => navigate("/appointments")}
            >
              Check Status
            </Button>
            <Button
              variant="outline"
              className="rounded-full font-semibold"
              onClick={() => {
                setShowSuccess(false);
                navigate("/home");
              }}
            >
              Go Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookAppointment;
