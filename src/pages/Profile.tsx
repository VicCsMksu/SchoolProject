import { useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const Profile = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const { user } = useAuth();

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

  const { data: recentNotifications = [] } = useQuery({
    queryKey: ["recent-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadNotifications = recentNotifications.filter((n) => !n.read);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    approved: appointments.filter((a) => a.status === "Approved").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
    rescheduled: appointments.filter((a) => a.status === "Rescheduled").length,
  };

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Rescheduled",
      value: stats.rescheduled,
      icon: RefreshCw,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  const quickActions = [
    {
      label: "Book Appointment",
      icon: Calendar,
      action: () => navigate("/doctors"),
    },
    { label: "My Records", icon: FileText, action: () => navigate("/records") },
  ];

  const displayName = profile?.full_name || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-4 mb-6">
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
          {profile?.county && (
            <p className="text-xs text-muted-foreground">
              {profile.county}
              {profile.district ? `, ${profile.district}` : ""}
            </p>
          )}
        </div>
      </div>

      <h2 className="text-sm font-bold text-foreground mb-3">
        Appointment Overview
      </h2>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center gap-1 p-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${color}`}
              >
                <Icon size={14} />
              </div>
              <span className="text-lg font-bold text-foreground">{value}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-sm font-bold text-foreground mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(({ label, icon: Icon, action }) => (
          <Button
            key={label}
            variant="outline"
            className="h-auto flex-col gap-2 py-4 rounded-xl border-border"
            onClick={action}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon size={18} className="text-primary" />
            </div>
            <span className="text-xs font-semibold">{label}</span>
          </Button>
        ))}
      </div>

      {recentNotifications.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Notifications
              </h2>
              {unreadNotifications.length > 0 && (
                <Badge
                  className="bg-red-500 text-white text-[9px] 
                  h-4 px-1.5 rounded-full"
                >
                  {unreadNotifications.length}
                </Badge>
              )}
            </div>
            <button
              onClick={() => navigate("/records?tab=updates")}
              className="flex items-center gap-0.5 text-xs text-primary font-semibold"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentNotifications.map((n) => (
              <Card
                key={n.id}
                className={cn(
                  "border-0 shadow-sm cursor-pointer transition-colors",
                  !n.read && "border-l-4 border-l-primary",
                )}
                onClick={() =>
                  navigate(
                    n.appointment_id
                      ? `/appointment/${n.appointment_id}`
                      : "/notifications",
                  )
                }
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      !n.read ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    <Bell
                      size={14}
                      className={
                        !n.read ? "text-primary" : "text-muted-foreground"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {n.created_at
                        ? formatDistanceToNow(new Date(n.created_at), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
