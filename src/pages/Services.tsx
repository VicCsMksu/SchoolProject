import { useNavigate } from "react-router-dom";
import { ChevronRight, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Services = () => {
  const navigate = useNavigate();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="px-5 pt-8 text-center text-sm text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="px-5 pt-8">
      <h1 className="mb-1 text-2xl font-extrabold text-foreground">Our Services</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Quality general medicine services for you and your family.
      </p>

      {services.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">No services available yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service, i) => (
            <Card
              key={service.id}
              className="cursor-pointer border-0 shadow-sm transition-shadow hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => navigate(`/services/${service.id}`)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Stethoscope className="text-primary" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{service.description}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
