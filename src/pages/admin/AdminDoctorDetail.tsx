import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Phone, Mail, Building2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;

const statusBadge: Record<string, string> = {
  "On Duty": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "Off Duty": "bg-muted text-muted-foreground",
  "On Leave": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const AdminDoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({ name: "", specialty: "", phone: "", email: "", department: "", status: "", bio: "" });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("doctors").select("*").eq("id", id!).single();
      if (data) {
        setDoctor(data);
        setFormData({
          name: data.name, specialty: data.specialty || "", phone: data.phone || "",
          email: data.email || "", department: data.department || "", status: data.status || "",
          bio: data.bio || "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="px-5 pt-6 text-center text-muted-foreground text-sm">Loading...</div>;
  if (!doctor) return (
    <div className="px-5 pt-6 text-center">
      <p className="text-muted-foreground">Doctor not found</p>
      <Button variant="link" onClick={() => navigate("/admin/doctors")}>Back to Doctors</Button>
    </div>
  );

  const getInitials = (name: string) => name.split(" ").filter(w => w[0]?.match(/[A-Z]/)).map(w => w[0]).join("").slice(0, 2) || "DR";

  const handleSave = async () => {
    const { error } = await supabase.from("doctors").update({
      name: formData.name, specialty: formData.specialty, phone: formData.phone,
      email: formData.email, department: formData.department, status: formData.status, bio: formData.bio,
    }).eq("id", doctor.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Doctor details updated successfully");
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("doctors").delete().eq("id", doctor.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${doctor.name} has been removed`);
    navigate("/admin/doctors");
  };

  return (
    <div className="px-5 pt-6 space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/admin/doctors")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{doctor.name}</h1>
          <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{getInitials(doctor.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusBadge[doctor.status || "Off Duty"]}`}>{doctor.status}</Badge>
                {doctor.rating && (
                  <div className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-foreground font-medium">{doctor.rating}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{doctor.patients_count} patients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1 text-xs">Profile</TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 text-xs">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Bio</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{doctor.bio || "No bio available."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5"><Phone size={14} className="text-muted-foreground shrink-0" /><span className="text-xs text-foreground">{doctor.phone}</span></div>
                <div className="flex items-center gap-2.5"><Mail size={14} className="text-muted-foreground shrink-0" /><span className="text-xs text-foreground">{doctor.email}</span></div>
                <div className="flex items-center gap-2.5"><Building2 size={14} className="text-muted-foreground shrink-0" /><span className="text-xs text-foreground">{doctor.department}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Availability</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock size={12} />{doctor.availability}</div>
            </CardContent>
          </Card>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-9 text-sm gap-2"><Trash2 size={14} />Delete Doctor</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Caution</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to delete <span className="font-semibold text-foreground">{doctor.name}</span>? This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="edit" className="mt-3 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2"><Label className="text-xs">Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2"><Label className="text-xs">Specialty</Label><Input value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2"><Label className="text-xs">Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2"><Label className="text-xs">Email</Label><Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2"><Label className="text-xs">Department</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Duty">On Duty</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">Bio</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="text-sm min-h-[80px]" /></div>
              <Button onClick={handleSave} className="w-full h-9 text-sm">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDoctorDetail;
