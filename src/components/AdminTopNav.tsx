import { ShieldCheck, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminTopNav = () => {
  const navigate = useNavigate();

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin-pending-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .in("status", ["Pending", "Pending Reschedule"]);
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck size={18} className="text-primary-foreground" />
        </div>
        <span className="text-base font-bold text-foreground">
          Admin Portal
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/appointments")}
          className="relative rounded-md p-1.5 text-muted-foreground 
            hover:bg-muted"
        >
          <Bell size={20} />
          {pendingCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center
              justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
        <Avatar
          className="h-8 w-8 cursor-pointer"
          onClick={() => navigate("/admin/profile")}
        >
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AdminTopNav;
