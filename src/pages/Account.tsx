import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Settings, LogOut, ChevronRight, Users,
  HeadsetIcon, Stethoscope, Plus, Trash2, Baby,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RELATIONSHIPS = ["Child", "Spouse", "Sibling", "Parent", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const calcAge = (dob: string | null) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob + "T12:00:00").getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

type Dependent = {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  relationship: string;
  created_at: string;
};

const Account = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();

  // Dialog states
  const [showAddDialog,    setShowAddDialog]    = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [deletingDependent,setDeletingDependent]= useState<Dependent | null>(null);

  // Form fields (shared between add and edit)
  const [depName,         setDepName]         = useState("");
  const [depDob,          setDepDob]          = useState("");
  const [depGender,       setDepGender]       = useState("");
  const [depRelationship, setDepRelationship] = useState("Child");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: dependents = [] } = useQuery({
    queryKey: ["dependents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dependents")
        .select("*")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Dependent[];
    },
    enabled: !!user,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addDependent = useMutation({
    mutationFn: async () => {
      if (!depName.trim()) throw new Error("Full name is required");
      const { error } = await supabase.from("dependents").insert({
        patient_id:   user!.id,
        full_name:    depName.trim(),
        date_of_birth: depDob || null,
        gender:       depGender || null,
        relationship: depRelationship,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", user?.id] });
      closeAddDialog();
      toast.success("Dependent added successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateDependent = useMutation({
    mutationFn: async () => {
      if (!editingDependent) return;
      if (!depName.trim()) throw new Error("Full name is required");
      const { error } = await supabase
        .from("dependents")
        .update({
          full_name:    depName.trim(),
          date_of_birth: depDob || null,
          gender:       depGender || null,
          relationship: depRelationship,
        })
        .eq("id", editingDependent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", user?.id] });
      closeEditDialog();
      toast.success("Dependent updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteDependent = useMutation({
    mutationFn: async () => {
      if (!deletingDependent) return;
      const { error } = await supabase
        .from("dependents")
        .delete()
        .eq("id", deletingDependent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", user?.id] });
      setDeletingDependent(null);
      toast.success("Dependent removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setDepName(""); setDepDob("");
    setDepGender(""); setDepRelationship("Child");
  };

  const closeAddDialog = () => {
    setShowAddDialog(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setEditingDependent(null);
    resetForm();
  };

  const openEditDialog = (dep: Dependent) => {
    setEditingDependent(dep);
    setDepName(dep.full_name);
    setDepDob(dep.date_of_birth || "");
    setDepGender(dep.gender || "");
    setDepRelationship(dep.relationship);
  };

  const displayName = profile?.full_name || user?.email || "User";
  const initials = displayName
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const menuItems = [
    { label: "Edit Profile", icon: User,
      action: () => navigate("/edit-profile") },
    { label: "Settings", icon: Settings,
      action: () => navigate("/settings") },
    { label: "Our Doctors", icon: Users,
      action: () => navigate("/doctors") },
    { label: "Our Services", icon: Stethoscope,
      action: () => navigate("/services") },
    { label: "Support & FAQ", icon: HeadsetIcon,
      action: () => navigate("/support") },
    {
      label: "Log Out", icon: LogOut, destructive: true,
      action: async () => { await logout(); navigate("/"); },
    },
  ];



  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-5 pt-8 pb-24">

      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarFallback className="bg-secondary text-primary text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-bold text-foreground">{displayName}</h1>
          <p className="text-xs text-muted-foreground">
            {profile?.email || user?.email}
          </p>
          {profile?.phone && (
            <p className="text-xs text-muted-foreground">{profile.phone}</p>
          )}
        </div>
      </div>

      {/* ── My Dependents ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              My Dependents
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Family members you book appointments for
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1 rounded-full"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus size={13} /> Add
          </Button>
        </div>

        {dependents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border
            p-5 text-center">
            <Baby size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              No dependents added yet
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Add a family member here first, then you can book appointments
              for them from the Appointments tab.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dependents.map(dep => {
              const age = calcAge(dep.date_of_birth);
              return (
                <Card key={dep.id} className="border shadow-sm">
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center
                          justify-center rounded-full bg-primary/10">
                          <Baby size={16} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {dep.full_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {dep.relationship}
                            {age !== null && ` · ${age} yrs`}
                            {dep.gender && ` · ${dep.gender}`}
                          </p>
                          {dep.date_of_birth && (
                            <p className="text-[10px] text-muted-foreground">
                              DOB:{" "}
                              {new Date(dep.date_of_birth + "T12:00:00")
                                .toLocaleDateString("en-US", {
                                  month: "short", day: "numeric",
                                  year: "numeric",
                                })}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Edit + Delete actions */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => openEditDialog(dep)}
                          className="flex h-8 w-8 items-center justify-center
                            rounded-full text-muted-foreground
                            hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingDependent(dep)}
                          className="flex h-8 w-8 items-center justify-center
                            rounded-full text-muted-foreground
                            hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Account menu ──────────────────────────────────────────────────── */}
      <h2 className="text-sm font-bold text-foreground mb-3">Account</h2>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {menuItems.map(({ label, icon: Icon, destructive, action }, i) => (
            <button
              key={label}
              onClick={() => { void action?.(); }}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3.5",
                "text-sm transition-colors hover:bg-muted/50",
                i < menuItems.length - 1 ? "border-b border-border" : "",
                destructive ? "text-destructive" : "text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} />
                <span className="font-medium">{label}</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      {/* ── Add Dependent Dialog ──────────────────────────────────────────── */}
      <Dialog open={showAddDialog}
        onOpenChange={open => { if (!open) closeAddDialog(); }}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Add a dependent</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This person will appear in your dependent list when booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold">Full name *</Label>
              <Input
                value={depName}
                onChange={e => setDepName(e.target.value)}
                placeholder="e.g. James Kariuki"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Relationship to you</Label>
              <Select value={depRelationship} onValueChange={setDepRelationship}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Date of birth{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                type="date"
                value={depDob}
                onChange={e => setDepDob(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Gender{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={depGender} onValueChange={setDepGender}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full rounded-full font-semibold mt-2"
            disabled={!depName.trim() || addDependent.isPending}
            onClick={() => addDependent.mutate()}
          >
            {addDependent.isPending ? "Adding..." : "Add Dependent"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dependent Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!editingDependent}
        onOpenChange={open => { if (!open) closeEditDialog(); }}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Edit dependent</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update {editingDependent?.full_name}'s details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold">Full name *</Label>
              <Input
                value={depName}
                onChange={e => setDepName(e.target.value)}
                placeholder="e.g. James Kariuki"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Relationship to you</Label>
              <Select value={depRelationship} onValueChange={setDepRelationship}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Date of birth{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                type="date"
                value={depDob}
                onChange={e => setDepDob(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Gender{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={depGender} onValueChange={setDepGender}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full rounded-full font-semibold mt-2"
            disabled={!depName.trim() || updateDependent.isPending}
            onClick={() => updateDependent.mutate()}
          >
            {updateDependent.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────── */}
      <Dialog open={!!deletingDependent}
        onOpenChange={open => { if (!open) setDeletingDependent(null); }}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Remove dependent?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {deletingDependent?.full_name}
              </span>{" "}
              from your dependents? This will not affect existing appointments
              already booked for them, but they will no longer appear in the
              booking flow.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full font-semibold"
              onClick={() => setDeletingDependent(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full font-semibold"
              disabled={deleteDependent.isPending}
              onClick={() => deleteDependent.mutate()}
            >
              {deleteDependent.isPending ? "Removing..." : "Yes, remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Account;