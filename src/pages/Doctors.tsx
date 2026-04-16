import { useState } from "react";
import { Search, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Doctors = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty || "").toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").filter(w => w[0]?.match(/[A-Z]/)).map(w => w[0]).join("").slice(0, 2) || "DR";

  if (isLoading) {
    return <div className="px-5 pt-6 text-center text-sm text-muted-foreground">Loading doctors...</div>;
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="mb-1 text-center text-xl font-bold text-primary">Doctors & Specialists</h1>
      <p className="mb-5 text-center text-xs text-muted-foreground">
        View qualified doctors and specialists. Check their schedules and choose who best fits your needs.
      </p>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search by name or specialty"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9 rounded-lg border-border"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      {doctors.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">No doctors available yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((doctor) => (
            <Card key={doctor.id} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-primary">{doctor.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {doctor.specialty}{doctor.department ? ` | ${doctor.department}` : ""}
                    </p>
                  </div>
                </div>

                {doctor.availability && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground">Availability</p>
                    <p className="text-xs text-muted-foreground">{doctor.availability}</p>
                  </div>
                )}

                <Button
                  className="w-full rounded-full font-semibold"
                  onClick={() => navigate(isAuthenticated ? `/appointment/book?doctorId=${doctor.id}` : "/signin")}
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-10">
              No doctors found matching "{search}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Doctors;
