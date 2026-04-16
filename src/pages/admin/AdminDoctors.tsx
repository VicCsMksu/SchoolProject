import { useState, useEffect } from "react";
import { Search, Star, Clock, UserPlus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;

const statusBadge: Record<string, string> = {
  "On Duty": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "Off Duty": "bg-muted text-muted-foreground",
  "On Leave": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const AdminDoctors = () => {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "", phone: "", email: "", status: "On Duty", availability: "" });
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    const { data } = await supabase.from("doctors").select("*").order("name");
    if (data) setDoctors(data);
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const filtered = doctors.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || (d.specialty || "").toLowerCase().includes(search.toLowerCase())
  );

  const onDuty = doctors.filter((d) => d.status === "On Duty").length;

  const getInitials = (name: string) => name.split(" ").filter(w => w[0]?.match(/[A-Z]/)).map(w => w[0]).join("").slice(0, 2) || "DR";

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialty) {
      toast.error("Please fill in at least the name and specialty");
      return;
    }
    const { error } = await supabase.from("doctors").insert({
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      phone: newDoctor.phone || null,
      email: newDoctor.email || null,
      status: newDoctor.status,
      availability: newDoctor.availability || null,
    });
    if (error) { toast.error(error.message); return; }
    setNewDoctor({ name: "", specialty: "", phone: "", email: "", status: "On Duty", availability: "" });
    setDialogOpen(false);
    toast.success("Doctor added successfully");
    fetchDoctors();
  };

  if (loading) return <div className="px-5 pt-6 text-center text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="px-5 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Doctors</h1>
          <p className="text-xs text-muted-foreground">{doctors.length} doctors · {onDuty} on duty</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1 h-8"><UserPlus size={14} /> Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Add New Doctor</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <Input placeholder="Dr. Jane Doe" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Specialty *</Label>
                <Input placeholder="e.g. Cardiologist" value={newDoctor.specialty} onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input placeholder="+254 7XX XXX XXX" value={newDoctor.phone} onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input placeholder="doctor@multilab.co.ke" value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Availability</Label>
                <Input placeholder="Mon - Fri, 8AM - 5PM" value={newDoctor.availability} onChange={(e) => setNewDoctor({ ...newDoctor, availability: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={newDoctor.status} onValueChange={(v) => setNewDoctor({ ...newDoctor, status: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Duty">On Duty</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddDoctor} className="w-full h-9 text-sm">Add Doctor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No doctors found</div>}
        {filtered.map((doc) => (
          <Card key={doc.id} className="border shadow-sm cursor-pointer transition-colors hover:bg-muted/50 hover:shadow-md" onClick={() => navigate(`/admin/doctors/${doc.id}`)}>
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{getInitials(doc.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                  <p className="text-[11px] text-muted-foreground">{doc.specialty}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${statusBadge[doc.status || "Off Duty"]}`}>{doc.status}</Badge>
                    {doc.rating && (
                      <div className="flex items-center gap-0.5 text-[11px] text-amber-500">
                        <Star size={11} fill="currentColor" />
                        <span className="text-foreground font-medium">{doc.rating}</span>
                      </div>
                    )}
                    <span className="text-[11px] text-muted-foreground">{doc.patients_count} patients</span>
                  </div>
                  {doc.availability && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Clock size={10} />{doc.availability}
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
};

export default AdminDoctors;
