import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { KENYAN_COUNTIES } from "@/lib/constants";

const countyOptions = KENYAN_COUNTIES.map((c) => ({ value: c, label: c }));

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");
  const [location, setLocation] = useState("");
  const [poBox, setPoBox] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!county) { toast.error("Please select a county."); return; }
    if (!fullName.trim()) { toast.error("Please enter your full name."); return; }
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone || null,
        county, district: district || null, division: division || null,
        location: location || null, po_box: poBox || null,
      })
      .eq("user_id", user!.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      await queryClient.invalidateQueries({ queryKey: ["profile-complete-check"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile completed!");
      navigate("/home");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-8 bg-background">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-xl font-bold text-primary">Complete Your Profile</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Please fill in your details to continue using the app.</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label>County <span className="text-destructive">*</span></Label>
              <Combobox options={countyOptions} value={county} onValueChange={setCounty} placeholder="Select County" searchPlaceholder="Search county..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>District</Label>
                <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Division</Label>
                <Input value={division} onChange={(e) => setDivision(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>P.O Box</Label>
                <Input value={poBox} onChange={(e) => setPoBox(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="mt-2 w-full rounded-full font-semibold" size="lg" disabled={submitting}>
              {submitting ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
