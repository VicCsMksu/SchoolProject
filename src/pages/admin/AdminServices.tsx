import { useState, useEffect } from "react";
import { Search, Stethoscope, Clock, Plus, ChevronRight, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const AdminServices = () => {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ 
    name: "", 
    description: "", 
    cost: "", 
    duration: "", 
    cost_note: "Standard fee", 
    duration_note: "Typical duration" 
  });
  const navigate = useNavigate();

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("name");
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const filtered = services.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAddService = async () => {
    if (!newService.name) {
      toast.error("Please fill in at least the service name");
      return;
    }
    const { error } = await supabase.from("services").insert({
      name: newService.name,
      description: newService.description || null,
      cost: newService.cost || null,
      duration: newService.duration || null,
      cost_note: newService.cost_note || null,
      duration_note: newService.duration_note || null,
    });
    if (error) { toast.error(error.message); return; }
    setNewService({ 
      name: "", 
      description: "", 
      cost: "", 
      duration: "", 
      cost_note: "Standard fee", 
      duration_note: "Typical duration" 
    });
    setDialogOpen(false);
    toast.success("Service added successfully");
    fetchServices();
  };

  if (loading) return <div className="px-5 pt-6 text-center text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="px-5 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Services</h1>
          <p className="text-xs text-muted-foreground">{services.length} total services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1 h-8"><Plus size={14} /> Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Add New Service</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Service Name *</Label>
                <Input placeholder="e.g. General Consultation" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Input placeholder="Brief overview of the service" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Cost</Label>
                  <Input placeholder="e.g. KES 1,500" value={newService.cost} onChange={(e) => setNewService({ ...newService, cost: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration</Label>
                  <Input placeholder="e.g. 30 mins" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} className="h-9 text-sm" />
                </div>
              </div>
              <Button onClick={handleAddService} className="w-full h-9 text-sm">Add Service</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No services found</div>}
        {filtered.map((svc) => (
          <Card key={svc.id} className="border shadow-sm cursor-pointer transition-colors hover:bg-muted/50 hover:shadow-md" onClick={() => navigate(`/admin/services/${svc.id}`)}>
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Stethoscope size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{svc.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{svc.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 flex items-center gap-1">
                      <DollarSign size={8} /> {svc.cost || "Free"}
                    </Badge>
                    {svc.duration && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock size={10} />{svc.duration}
                      </div>
                    )}
                  </div>
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

export default AdminServices;
