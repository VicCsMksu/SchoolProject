import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, Clock, DollarSign, ShieldCheck, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const AdminServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({ 
    name: "", description: "", cost: "", duration: "", 
    cost_note: "", duration_note: "", hero_description: "",
    insurance_title: "", insurance_description: "" 
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("services").select("*").eq("id", id!).single();
      if (data) {
        setService(data);
        setFormData({
          name: data.name, 
          description: data.description || "", 
          cost: data.cost || "", 
          duration: data.duration || "",
          cost_note: data.cost_note || "",
          duration_note: data.duration_note || "",
          hero_description: data.hero_description || "",
          insurance_title: data.insurance_title || "",
          insurance_description: data.insurance_description || ""
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="px-5 pt-6 text-center text-muted-foreground text-sm">Loading...</div>;
  if (!service) return (
    <div className="px-5 pt-6 text-center">
      <p className="text-muted-foreground">Service not found</p>
      <Button variant="link" onClick={() => navigate("/admin/services")}>Back to Services</Button>
    </div>
  );

  const handleSave = async () => {
    const { error } = await supabase.from("services").update({
      name: formData.name, 
      description: formData.description, 
      cost: formData.cost, 
      duration: formData.duration,
      cost_note: formData.cost_note,
      duration_note: formData.duration_note,
      hero_description: formData.hero_description,
      insurance_title: formData.insurance_title,
      insurance_description: formData.insurance_description
    }).eq("id", service.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Service details updated successfully");
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("services").delete().eq("id", service.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${service.name} has been removed`);
    navigate("/admin/services");
  };

  return (
    <div className="px-5 pt-6 space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/admin/services")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{service.name}</h1>
          <p className="text-xs text-muted-foreground">Service Management</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{service.cost || "Free"}</Badge>
                {service.duration && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{service.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 text-xs">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Info size={14} className="text-primary" /> Description</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{service.description || "No description available."}</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><DollarSign size={12} /> Pricing</h3>
                <p className="text-sm font-bold text-foreground">{service.cost || "Free"}</p>
                <p className="text-[10px] text-muted-foreground">{service.cost_note}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Duration</h3>
                <p className="text-sm font-bold text-foreground">{service.duration || "N/A"}</p>
                <p className="text-[10px] text-muted-foreground">{service.duration_note}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Insurance info</h3>
              <p className="text-[11px] font-bold text-foreground">{service.insurance_title || "Standard Insurance"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{service.insurance_description || "Standard insurance policies apply."}</p>
            </CardContent>
          </Card>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-9 text-sm gap-2 mt-2"><Trash2 size={14} />Delete Service</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Caution</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to delete <span className="font-semibold text-foreground">{service.name}</span>? This will affect existing doctor associations.</AlertDialogDescription>
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
              <div className="space-y-2"><Label className="text-xs">Service Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2"><Label className="text-xs">Short Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-9 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label className="text-xs">Cost (e.g. KES 1500)</Label><Input value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Duration (e.g. 45 mins)</Label><Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="h-9 text-sm" /></div>
              </div>
              <div className="space-y-2"><Label className="text-xs">Detailed Hero Description</Label><Textarea value={formData.hero_description} onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })} className="text-sm min-h-[80px]" /></div>
              <div className="space-y-2"><Label className="text-xs">Insurance Provider Title</Label><Input value={formData.insurance_title} onChange={(e) => setFormData({ ...formData, insurance_title: e.target.value })} className="h-9 text-sm" /></div>
              <div className="space-y-2"><Label className="text-xs">Insurance Detail</Label><Textarea value={formData.insurance_description} onChange={(e) => setFormData({ ...formData, insurance_description: e.target.value })} className="text-sm min-h-[60px]" /></div>
              <Button onClick={handleSave} className="w-full h-9 text-sm">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminServiceDetail;
