import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const iconByType = (type?: string, title?: string) => {
  if (type === "appointment") {
    if (title?.includes("Approved")) return CheckCircle2;
    if (title?.includes("Cancelled")) return XCircle;
    if (title?.includes("Completed")) return Clock;
    return Bell;
  }
  return Bell;
};

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id || "")
        .eq("read", false);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const handleClick = (appointmentId?: string) => {
    if (appointmentId) {
      navigate(`/appointment/${appointmentId}`);
    }
  };

  const isEmpty = !isLoading && notifications.length === 0;

  return (
    <div className="px-5 pt-8 pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated with the latest alerts about your appointments, test
            results, and reminders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
            Unread: {unreadCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={
              unreadCount === 0 || markAllReadMutation.status === "pending"
            }
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {authLoading || isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : isError ? (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-destructive">
          Unable to load notifications. Please try again later.
        </div>
      ) : isEmpty ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-background/80 p-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell size={24} />
          </span>
          <h3 className="text-base font-bold text-primary">
            You're all caught up!
          </h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            You don't have any new notifications right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = iconByType(
              notification.type ?? "",
              notification.title ?? "",
            );
            const relativeTime = notification.created_at
              ? formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })
              : "Just now";

            return (
              <div
                key={notification.id}
                onClick={() =>
                  handleClick(notification.appointment_id || undefined)
                }
                className={`cursor-pointer rounded-3xl border px-4 py-4 transition-colors sm:px-6 ${
                  notification.read
                    ? "border-border bg-background"
                    : "border-l-4 border-primary/80 bg-primary/5"
                } ${notification.appointment_id ? "hover:bg-primary/10" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="truncate text-base font-semibold text-foreground">
                        {notification.title}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {relativeTime}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
