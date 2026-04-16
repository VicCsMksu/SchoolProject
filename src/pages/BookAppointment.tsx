import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Calendar, Clock, FileText, Stethoscope, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type DbService = Tables<"services">;
type DbDoctor = Tables<"doctors">;

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAppointment } = useAppointments();

  const prefilledService = searchParams.get("service") || "";
  const prefilledDoctorId = searchParams.get("doctorId") || "";

  const [step, setStep] = useState(0);
  const [bookingFor, setBookingFor] = useState<"myself" | "dependent">("myself");
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
          const match = sRes.data.find(s => s.name === prefilledService);
          if (match) setSelectedServiceId(match.id);
        }
      }
      if (dRes.data) setDbDoctors(dRes.data);
    };
    fetchData();
  }, [prefilledService]);

  const selectedService = dbServices.find(s => s.id === selectedServiceId);
  const selectedDoctor = dbDoctors.find(d => d.id === selectedDoctorId);

  const filteredDoctors = useMemo(() => {
    if (!selectedServiceId) return dbDoctors;
    return dbDoctors.filter(d => d.service_id === selectedServiceId);
  }, [selectedServiceId, dbDoctors]);

  const totalSteps = bookingFor === "myself" ? 5 : 6;

  const handleNext = () => setStep(step + 1);
  const goBack = () => {
    if (step === 0) navigate(-1);
    else setStep(step - 1);
  };

  const getPatientName = () => {
    if (bookingFor === "myself") return "Self";
    return [firstName, middleName, lastName].filter(Boolean).join(" ");
  };

  const getConfirmStep = () => (bookingFor === "myself" ? 4 : 5);
  const getDetailsStep = () => (bookingFor === "myself" ? 3 : 4);

  const handleSubmit = () => {
    if (!user) return;
    addAppointment.mutate({
      patient_id: user.id,
      patient_name: getPatientName(),
      service_id: selectedServiceId || null,
      doctor_id: selectedDoctorId || null,
      appointment_date: date,
      appointment_time: time,
      notes,
      mode: "In-person",
      status: "Pending",
    }, {
      onSuccess: () => setShowSuccess(true),
      onError: (err) => toast.error(err.message),
    });
  };

  const progressDots = (
    <div className="flex justify-center gap-2 mt-4 mb-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className={cn("h-2 w-2 rounded-full transition-colors", i === step ? "bg-primary" : "bg-border")} />
      ))}
    </div>
  );

  const getInitials = (name: string) => name.split(" ").filter(w => w[0]?.match(/[A-Z]/)).map(w => w[0]).join("").slice(0, 2) || "DR";

  return (
    <div className="px-5 pt-4 pb-24">
      <button onClick={goBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-foreground">
        <ArrowLeft size={20} />
      </button>

      {/* Step 0: Choose who */}
      {step === 0 && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-bold text-foreground mb-1">Book an Appointment</h3>
          <p className="text-xs text-muted-foreground mb-5">Book an appointment for yourself or a dependent.</p>
          <div className="flex flex-col gap-3 mb-6">
            <Button variant={bookingFor === "myself" ? "default" : "outline"} className="rounded-full font-semibold" onClick={() => setBookingFor("myself")}>I'm booking for myself</Button>
            <Button variant={bookingFor === "dependent" ? "default" : "outline"} className="rounded-full font-semibold" onClick={() => setBookingFor("dependent")}>I'm booking for a dependent</Button>
          </div>
          <div className="flex justify-center">
            <Button className="rounded-full px-10 font-semibold" onClick={handleNext}>Next</Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">Select a Service</h2>
          <p className="text-xs text-muted-foreground mb-5">Choose the service you need.</p>
          <div className="space-y-2">
            {dbServices.map((s) => (
              <Card key={s.id} className={cn("border cursor-pointer transition-colors", selectedServiceId === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/50")} onClick={() => { setSelectedServiceId(s.id); setSelectedDoctorId(""); }}>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button className="rounded-full px-10 font-semibold" onClick={handleNext} disabled={!selectedServiceId}>Next</Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">Select a Doctor</h2>
          <p className="text-xs text-muted-foreground mb-5">Showing doctors for {selectedService?.name}.</p>
          <div className="space-y-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className={cn("border cursor-pointer transition-colors", selectedDoctorId === doctor.id ? "border-primary bg-primary/5" : "hover:bg-muted/50")} onClick={() => setSelectedDoctorId(doctor.id)}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{getInitials(doctor.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDoctors.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No doctors available for this service yet.</p>}
          </div>
          <div className="flex justify-center mt-6">
            <Button className="rounded-full px-10 font-semibold" onClick={handleNext} disabled={!selectedDoctorId}>Next</Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Patient Details (dependent only, step 3) */}
      {bookingFor === "dependent" && step === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">Patient Details</h2>
          <p className="text-xs text-muted-foreground mb-5">Provide the dependent's information.</p>
          <div className="space-y-4">
            <div><Label className="text-xs font-semibold">First Name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div><Label className="text-xs font-semibold">Middle Name <span className="text-muted-foreground font-normal">(Optional)</span></Label><Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} /></div>
            <div><Label className="text-xs font-semibold">Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div><Label className="text-xs font-semibold">Date of Birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
            <div><Label className="text-xs font-semibold">Phone Number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" /></div>
            <div>
              <Label className="text-xs font-semibold mb-2 block">Sex</Label>
              <RadioGroup value={sex} onValueChange={setSex} className="flex gap-6">
                <div className="flex items-center gap-2"><RadioGroupItem value="Male" id="male" /><Label htmlFor="male" className="text-sm">Male</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="Female" id="female" /><Label htmlFor="female" className="text-sm">Female</Label></div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button className="rounded-full px-10 font-semibold" onClick={handleNext} disabled={!firstName || !lastName}>Next</Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Appointment Details */}
      {step === getDetailsStep() && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary mb-1">Appointment Details</h2>
          <p className="text-xs text-muted-foreground mb-5">Select your preferred date and time.</p>
          <div className="space-y-4">
            <div><Label className="text-xs font-semibold">Choose a Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div>
              <Label className="text-xs font-semibold">Choose Preferred Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                <SelectContent>{timeSlots.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information..." rows={3} />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button className="rounded-full px-10 font-semibold" onClick={handleNext} disabled={!date || !time}>Next</Button>
          </div>
          {progressDots}
        </div>
      )}

      {/* Confirmation */}
      {step === getConfirmStep() && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-primary text-center mb-1">Details Confirmation</h2>
          <p className="text-xs text-muted-foreground text-center mb-6">Review everything before submitting.</p>

          {bookingFor === "dependent" && (
            <div className="mb-5">
              <h4 className="text-sm font-bold text-foreground mb-3">Patient Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><User size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Name:</span><span className="font-medium text-primary">{getPatientName()}</span></div>
                <div className="flex items-center gap-2 text-sm"><User size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Sex:</span><span className="font-medium text-primary">{sex}</span></div>
                <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Phone:</span><span className="font-medium text-primary">{phone || "N/A"}</span></div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-sm font-bold text-foreground mb-3">Appointment Details</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><FileText size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Service:</span><span className="font-medium text-primary">{selectedService?.name}</span></div>
              <div className="flex items-center gap-2 text-sm"><Stethoscope size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Doctor:</span><span className="font-medium text-primary">{selectedDoctor?.name}</span></div>
              <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Date:</span><span className="font-medium text-primary">{date ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}</span></div>
              <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Time:</span><span className="font-medium text-primary">{time}</span></div>
              {notes && <div className="flex items-center gap-2 text-sm"><Edit size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Notes:</span><span className="font-medium text-primary">{notes}</span></div>}
            </div>
          </div>

          <div className="flex justify-center">
            <Button className="rounded-full px-10 font-semibold" onClick={handleSubmit} disabled={addAppointment.isPending}>
              {addAppointment.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader><DialogTitle className="text-center text-primary">Submitted Successfully!</DialogTitle></DialogHeader>
          <p className="text-center text-xs text-muted-foreground">You will receive a notification once your appointment is approved.</p>
          <div className="flex justify-center gap-3 mt-2">
            <Button variant="outline" className="rounded-full font-semibold" onClick={() => navigate("/appointments")}>Check Status</Button>
            <Button variant="outline" className="rounded-full font-semibold" onClick={() => { setShowSuccess(false); navigate("/home"); }}>Go Home</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookAppointment;
