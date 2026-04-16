import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, ShieldCheck, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["service-doctors", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").eq("service_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const doctor = doctors[0];

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!service) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Service not found</h2>
          <Button variant="link" onClick={() => navigate("/services")}>Back to Services</Button>
        </div>
      </div>
    );
  }

  const initials = doctor
    ? doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
    : "DR";

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/90 to-primary px-5 pb-10 pt-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 text-primary-foreground">
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-primary-foreground">Service Details</span>
          <div className="w-8" />
        </div>
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-background/20">
            <Stethoscope className="text-primary-foreground" size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-primary-foreground">{service.name}</h1>
          <p className="mt-2 text-xs leading-relaxed text-primary-foreground/80">{service.hero_description}</p>
        </div>
      </div>

      {/* Insurance Card */}
      {service.insurance_title && (
        <div className="px-5 mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <ShieldCheck className="text-primary" size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">{service.insurance_title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{service.insurance_description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Doctor Section */}
      {doctor && (
        <div className="px-5 mt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">The Doctor</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-secondary text-primary font-bold text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-foreground">{doctor.name}</h3>
              <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
              <div className="mt-1.5 flex gap-2">
                {doctor.department && (
                  <Badge variant="secondary" className="text-[10px] font-medium">{doctor.department}</Badge>
                )}
                {doctor.rating && (
                  <Badge variant="secondary" className="text-[10px] font-medium">⭐ {doctor.rating}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duration & Costs */}
      <div className="px-5 mt-6 grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center p-4">
            <Clock className="text-primary mb-1" size={18} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</p>
            <p className="mt-1 text-sm font-bold text-foreground">{service.duration || "N/A"}</p>
            <p className="text-[10px] text-muted-foreground">{service.duration_note}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center p-4">
            <DollarSign className="text-primary mb-1" size={18} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Costs</p>
            <p className="mt-1 text-sm font-bold text-foreground">{service.cost || "N/A"}</p>
            <p className="text-[10px] text-muted-foreground">{service.cost_note}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="h-24" />
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border px-5 py-3">
        <div className="mx-auto max-w-lg">
          <Button
            className="w-full rounded-xl py-6 text-sm font-bold"
            onClick={() => navigate(isAuthenticated ? `/appointment/book?service=${encodeURIComponent(service.name)}` : "/signin")}
          >
            Book Consultation
          </Button>
          {service.next_slot && (
            <p className="mt-1 text-center text-[10px] text-muted-foreground">Next available slot: {service.next_slot}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
