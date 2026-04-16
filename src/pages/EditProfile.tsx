import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { KENYAN_COUNTIES } from "@/lib/constants";

const countyOptions = KENYAN_COUNTIES.map((c) => ({ value: c, label: c }));

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
    gender: "", county: "", district: "", division: "", location: "",
    poBox: "", emergencyContact: "", emergencyPhone: "", bloodType: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        const names = (data.full_name || "").split(" ");
        setForm({
          firstName: names[0] || "", lastName: names.slice(1).join(" ") || "",
          email: data.email || user.email || "", phone: data.phone || "",
          dateOfBirth: data.date_of_birth || "", gender: data.gender || "",
          county: data.county || "", district: data.district || "",
          division: data.division || "", location: data.location || "",
          poBox: data.po_box || "", emergencyContact: data.emergency_contact || "",
          emergencyPhone: data.emergency_phone || "", bloodType: data.blood_type || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user) return;
    if (!form.firstName.trim() || !form.lastName.trim()) { toast.error("First name and last name are required."); return; }
    if (!form.county) { toast.error("Please select a county."); return; }

    const { error } = await supabase.from("profiles").update({
      full_name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email, phone: form.phone,
      date_of_birth: form.dateOfBirth || null, gender: form.gender || null,
      county: form.county, district: form.district || null,
      division: form.division || null, location: form.location || null,
      po_box: form.poBox || null, emergency_contact: form.emergencyContact || null,
      emergency_phone: form.emergencyPhone || null, blood_type: form.bloodType || null,
    }).eq("user_id", user.id);

    if (error) { toast.error("Failed to update: " + error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile updated successfully!");
    navigate("/home");
  };

  if (loading) return <div className="px-5 pt-6 text-center text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Edit Profile</h1>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarFallback className="bg-secondary text-primary text-2xl font-bold">
              {form.firstName[0]}{form.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Camera size={14} />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Tap to change photo</p>
      </div>

      <PersonalInfoSection form={form} update={update} />
      <AddressSection form={form} update={update} />
      <EmergencySection form={form} update={update} />

      <Button onClick={handleSave} className="w-full rounded-xl font-semibold">Save Changes</Button>
    </div>
  );
};

const PersonalInfoSection = ({ form, update }: { form: Record<string, string>; update: (f: string, v: string) => void }) => (
  <section className="mb-6">
    <h2 className="text-sm font-bold text-foreground mb-3">Personal Information</h2>
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs text-muted-foreground">First Name</Label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs text-muted-foreground">Last Name</Label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="mt-1" /></div>
      </div>
      <div><Label className="text-xs text-muted-foreground">Email</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1" /></div>
      <div><Label className="text-xs text-muted-foreground">Phone Number</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs text-muted-foreground">Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="mt-1" /></div>
        <div>
          <Label className="text-xs text-muted-foreground">Gender</Label>
          <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Blood Type</Label>
        <Select value={form.bloodType} onValueChange={(v) => update("bloodType", v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
              <SelectItem key={bt} value={bt}>{bt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </section>
);

const AddressSection = ({ form, update }: { form: Record<string, string>; update: (f: string, v: string) => void }) => (
  <section className="mb-6">
    <h2 className="text-sm font-bold text-foreground mb-3">Address</h2>
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-muted-foreground">County <span className="text-destructive">*</span></Label>
        <div className="mt-1">
          <Combobox options={countyOptions} value={form.county} onValueChange={(v) => update("county", v)} placeholder="Select a county" searchPlaceholder="Search county..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs text-muted-foreground">District</Label><Input value={form.district} onChange={(e) => update("district", e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs text-muted-foreground">Division</Label><Input value={form.division} onChange={(e) => update("division", e.target.value)} className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs text-muted-foreground">Location</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs text-muted-foreground">P.O Box</Label><Input value={form.poBox} onChange={(e) => update("poBox", e.target.value)} className="mt-1" /></div>
      </div>
    </div>
  </section>
);

const EmergencySection = ({ form, update }: { form: Record<string, string>; update: (f: string, v: string) => void }) => (
  <section className="mb-8">
    <h2 className="text-sm font-bold text-foreground mb-3">Emergency Contact</h2>
    <div className="space-y-3">
      <div><Label className="text-xs text-muted-foreground">Contact Name</Label><Input value={form.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} className="mt-1" /></div>
      <div><Label className="text-xs text-muted-foreground">Contact Phone</Label><Input value={form.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} className="mt-1" /></div>
    </div>
  </section>
);

export default EditProfile;
