import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Stethoscope,
  Clock,
  DollarSign,
  ShieldCheck,
  Trash2,
  Info,
  Plus,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;
type ServiceProcedure = Tables<"service_procedures">;

const AdminServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [procedures, setProcedures] = useState<ServiceProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    duration: "",
    cost_note: "",
    duration_note: "",
    hero_description: "",
    insurance_title: "",
    insurance_description: "",
  });
  const [editingProcedure, setEditingProcedure] = useState<string | null>(null);
  const [newProcedure, setNewProcedure] = useState({
    title: "",
    description: "",
    duration: "",
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("id", id!)
        .single();
      const { data: proceduresData } = await supabase
        .from("service_procedures")
        .select("*")
        .eq("service_id", id!)
        .order("step_number");

      if (serviceData) {
        setService(serviceData);
        setFormData({
          name: serviceData.name,
          description: serviceData.description || "",
          cost: serviceData.cost || "",
          duration: serviceData.duration || "",
          cost_note: serviceData.cost_note || "",
          duration_note: serviceData.duration_note || "",
          hero_description: serviceData.hero_description || "",
          insurance_title: serviceData.insurance_title || "",
          insurance_description: serviceData.insurance_description || "",
        });
      }

      if (proceduresData) {
        setProcedures(proceduresData);
      }

      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading)
    return (
      <div className="px-5 pt-6 text-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  if (!service)
    return (
      <div className="px-5 pt-6 text-center">
        <p className="text-muted-foreground">Service not found</p>
        <Button variant="link" onClick={() => navigate("/admin/services")}>
          Back to Services
        </Button>
      </div>
    );

  const handleSave = async () => {
    const { error } = await supabase
      .from("services")
      .update({
        name: formData.name,
        description: formData.description,
        cost: formData.cost,
        duration: formData.duration,
        cost_note: formData.cost_note,
        duration_note: formData.duration_note,
        hero_description: formData.hero_description,
        insurance_title: formData.insurance_title,
        insurance_description: formData.insurance_description,
      })
      .eq("id", service.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Service details updated successfully");
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${service.name} has been removed`);
    navigate("/admin/services");
  };

  const handleAddProcedure = async () => {
    if (!newProcedure.title.trim() || !newProcedure.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const nextStepNumber = procedures.length + 1;
    const { data, error } = await supabase
      .from("service_procedures")
      .insert({
        service_id: service!.id,
        step_number: nextStepNumber,
        title: newProcedure.title.trim(),
        description: newProcedure.description.trim(),
        duration: newProcedure.duration.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setProcedures([...procedures, data]);
    setNewProcedure({ title: "", description: "", duration: "" });
    toast.success("Procedure step added successfully");
  };

  const handleUpdateProcedure = async (
    procedureId: string,
    updates: Partial<ServiceProcedure>,
  ) => {
    const { error } = await supabase
      .from("service_procedures")
      .update(updates)
      .eq("id", procedureId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setProcedures(
      procedures.map((proc) =>
        proc.id === procedureId ? { ...proc, ...updates } : proc,
      ),
    );
    setEditingProcedure(null);
    toast.success("Procedure step updated successfully");
  };

  const handleDeleteProcedure = async (procedureId: string) => {
    const { error } = await supabase
      .from("service_procedures")
      .delete()
      .eq("id", procedureId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setProcedures(procedures.filter((proc) => proc.id !== procedureId));
    toast.success("Procedure step deleted successfully");
  };

  const handleReorderProcedures = async () => {
    // Update step numbers after reordering
    const updates = procedures.map((proc, index) => ({
      id: proc.id,
      step_number: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from("service_procedures")
        .update({ step_number: update.step_number })
        .eq("id", update.id);
    }

    setProcedures(
      procedures.map((proc, index) => ({ ...proc, step_number: index + 1 })),
    );
  };

  return (
    <div className="px-5 pt-6 space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => navigate("/admin/services")}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">
            {service.name}
          </h1>
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
              <h3 className="text-sm font-bold text-foreground">
                {service.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  {service.cost || "Free"}
                </Badge>
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
          <TabsTrigger value="overview" className="flex-1 text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 text-xs">
            Edit
          </TabsTrigger>
          <TabsTrigger value="procedures" className="flex-1 text-xs">
            Procedures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Info size={14} className="text-primary" /> Description
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {service.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign size={12} /> Pricing
                </h3>
                <p className="text-sm font-bold text-foreground">
                  {service.cost || "Free"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {service.cost_note}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} /> Duration
                </h3>
                <p className="text-sm font-bold text-foreground">
                  {service.duration || "N/A"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {service.duration_note}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> Insurance
                info
              </h3>
              <p className="text-[11px] font-bold text-foreground">
                {service.insurance_title || "Standard Insurance"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {service.insurance_description ||
                  "Standard insurance policies apply."}
              </p>
            </CardContent>
          </Card>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full h-9 text-sm gap-2 mt-2"
              >
                <Trash2 size={14} />
                Delete Service
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Caution</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {service.name}
                  </span>
                  ? This will affect existing doctor associations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="edit" className="mt-3 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Service Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Short Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Cost (e.g. KES 1500)</Label>
                  <Input
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Duration (e.g. 45 mins)</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Detailed Hero Description</Label>
                <Textarea
                  value={formData.hero_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero_description: e.target.value,
                    })
                  }
                  className="text-sm min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Insurance Provider Title</Label>
                <Input
                  value={formData.insurance_title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_title: e.target.value,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Insurance Detail</Label>
                <Textarea
                  value={formData.insurance_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_description: e.target.value,
                    })
                  }
                  className="text-sm min-h-[60px]"
                />
              </div>
              <Button onClick={handleSave} className="w-full h-9 text-sm">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="mt-3 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Procedure Steps
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {procedures.length} steps
                </Badge>
              </div>

              {/* Existing Procedures */}
              <div className="space-y-3">
                {procedures.map((procedure) => (
                  <Card key={procedure.id} className="border">
                    <CardContent className="p-3">
                      {editingProcedure === procedure.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Step {procedure.step_number}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const title = (
                                    document.querySelector(
                                      `#edit-title-${procedure.id}`,
                                    ) as HTMLInputElement
                                  )?.value;
                                  const description = (
                                    document.querySelector(
                                      `#edit-description-${procedure.id}`,
                                    ) as HTMLTextAreaElement
                                  )?.value;
                                  const duration = (
                                    document.querySelector(
                                      `#edit-duration-${procedure.id}`,
                                    ) as HTMLInputElement
                                  )?.value;
                                  handleUpdateProcedure(procedure.id, {
                                    title: title?.trim() || procedure.title,
                                    description:
                                      description?.trim() ||
                                      procedure.description,
                                    duration:
                                      duration?.trim() || procedure.duration,
                                  });
                                }}
                              >
                                <Save size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => setEditingProcedure(null)}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          </div>
                          <Input
                            id={`edit-title-${procedure.id}`}
                            defaultValue={procedure.title}
                            placeholder="Step title"
                            className="h-8 text-sm"
                          />
                          <Textarea
                            id={`edit-description-${procedure.id}`}
                            defaultValue={procedure.description}
                            placeholder="Step description"
                            className="text-sm min-h-[60px]"
                          />
                          <Input
                            id={`edit-duration-${procedure.id}`}
                            defaultValue={procedure.duration || ""}
                            placeholder="Duration (optional)"
                            className="h-8 text-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-primary">
                                Step {procedure.step_number}
                              </span>
                              {procedure.duration && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {procedure.duration}
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-foreground mb-1">
                              {procedure.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {procedure.description}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingProcedure(procedure.id)}
                            >
                              <Edit2 size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive"
                              onClick={() =>
                                handleDeleteProcedure(procedure.id)
                              }
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add New Procedure */}
              <Card className="border-dashed">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Plus size={14} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Add New Step
                      </span>
                    </div>
                    <Input
                      value={newProcedure.title}
                      onChange={(e) =>
                        setNewProcedure({
                          ...newProcedure,
                          title: e.target.value,
                        })
                      }
                      placeholder="Step title (e.g., Initial Consultation)"
                      className="h-8 text-sm"
                    />
                    <Textarea
                      value={newProcedure.description}
                      onChange={(e) =>
                        setNewProcedure({
                          ...newProcedure,
                          description: e.target.value,
                        })
                      }
                      placeholder="Step description"
                      className="text-sm min-h-[60px]"
                    />
                    <Input
                      value={newProcedure.duration}
                      onChange={(e) =>
                        setNewProcedure({
                          ...newProcedure,
                          duration: e.target.value,
                        })
                      }
                      placeholder="Duration (optional, e.g., 15 min)"
                      className="h-8 text-sm"
                    />
                    <Button
                      onClick={handleAddProcedure}
                      className="w-full h-8 text-sm"
                      disabled={
                        !newProcedure.title.trim() ||
                        !newProcedure.description.trim()
                      }
                    >
                      Add Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminServiceDetail;
