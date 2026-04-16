import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Account = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const displayName = profile?.full_name || user?.email || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const menuItems = [
    { label: "Edit Profile", icon: User, action: () => navigate("/edit-profile") },
    { label: "Settings", icon: Settings, action: () => navigate("/settings") },
    { label: "Log Out", icon: LogOut, destructive: true, action: () => { logout(); navigate("/"); } },
  ];

  return (
    <div className="px-5 pt-8 pb-4">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarFallback className="bg-secondary text-primary text-xl font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-bold text-foreground">{displayName}</h1>
          <p className="text-xs text-muted-foreground">{profile?.email || user?.email}</p>
          {profile?.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
        </div>
      </div>

      <h2 className="text-sm font-bold text-foreground mb-3">Account</h2>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {menuItems.map(({ label, icon: Icon, destructive, action }, i) => (
            <button
              key={label}
              onClick={action}
              className={`flex w-full items-center justify-between px-4 py-3.5 text-sm transition-colors hover:bg-muted/50 ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              } ${destructive ? "text-destructive" : "text-foreground"}`}
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
    </div>
  );
};

export default Account;
