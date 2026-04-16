import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const tabs = ["All", "Consultation", "Laboratory Results"];
const stages = [
  "Consultation",
  "X-rays & Assessment",
  "Braces Fitted",
  "Active Treatment",
  "Final Adjustment",
  "Braces Removed",
  "Retainer Phase",
];

const formatDate = (value?: string) => {
  if (!value) return "TBD";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Records = () => {
  const [activeTab, setActiveTab] = useState("All");
  const { user, loading: authLoading } = useAuth();

  const {
    data: treatmentProgress,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["treatment-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treatment_progress")
        .select("*")
        .eq("patient_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    retry: false,
  });

  const treatmentValues = useMemo(() => {
    if (!treatmentProgress) {
      return {
        currentMonth: 0,
        totalMonths: 0,
        progressPercent: 0,
        currentStageIndex: 0,
      };
    }

    const startDate = treatmentProgress.start_date
      ? new Date(treatmentProgress.start_date)
      : null;
    const endDate = treatmentProgress.expected_end_date
      ? new Date(treatmentProgress.expected_end_date)
      : null;
    const today = new Date();

    const totalMs =
      startDate && endDate ? endDate.getTime() - startDate.getTime() : 0;
    const elapsedMs = startDate ? today.getTime() - startDate.getTime() : 0;
    const progressPercent =
      totalMs > 0
        ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)))
        : 0;
    const totalDays =
      totalMs > 0 ? Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24))) : 1;
    const currentDays = startDate
      ? Math.min(
          totalDays,
          Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))),
        )
      : 1;
    const totalMonths = Math.max(1, Math.ceil(totalDays / 30));
    const currentMonth = Math.min(
      totalMonths,
      Math.max(1, Math.ceil(currentDays / 30)),
    );
    const requestedStage = treatmentProgress.current_stage || "Consultation";
    const currentStageIndex = Math.max(0, stages.indexOf(requestedStage));

    return {
      currentMonth,
      totalMonths,
      progressPercent,
      currentStageIndex,
    };
  }, [treatmentProgress]);

  const isEmptyState = !treatmentProgress && !isLoading;

  return (
    <div className="px-5 pt-8 pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">Treatment Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your orthodontic journey from consultation to your final smile.
        </p>
      </div>

      <div className="mb-8 flex gap-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {authLoading || isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : isError ? (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-destructive">
          Unable to load treatment progress. Please try again later.
        </div>
      ) : isEmptyState ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-background/80 p-8 text-center">
          <h3 className="text-base font-bold text-primary">
            No active treatment found
          </h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Once your orthodontist starts your treatment, your progress will
            appear here.
          </p>
          <Button asChild variant="secondary">
            <Link to="/doctors">Book a Consultation</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Active treatment
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">
                    {treatmentProgress.service_name || "Orthodontic Care"}
                  </h2>
                </div>
                <Badge className="rounded-full px-3 py-1 text-sm">
                  {treatmentProgress.current_stage || "Consultation"}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Start date
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {formatDate(treatmentProgress.start_date)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Expected end date
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {formatDate(treatmentProgress.expected_end_date)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{treatmentValues.progressPercent}%</span>
                </div>
                <Progress value={treatmentValues.progressPercent} />
                <p className="text-xs text-muted-foreground">
                  Month {treatmentValues.currentMonth} of{" "}
                  {treatmentValues.totalMonths}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Treatment stages
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Follow your treatment milestones from consultation to
                    retainer.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {stages.map((stage, index) => {
                  const isComplete = index < treatmentValues.currentStageIndex;
                  const isCurrent = index === treatmentValues.currentStageIndex;

                  return (
                    <div key={stage} className="relative pl-10">
                      <div className="absolute left-0 top-2 flex h-full w-6 items-start justify-center">
                        <div className="relative flex h-6 w-6 items-center justify-center">
                          {isComplete ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                              <Check size={14} />
                            </span>
                          ) : isCurrent ? (
                            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                              <span className="absolute inset-0 animate-pulse rounded-full bg-primary/30" />
                              <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
                            </span>
                          ) : (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                              <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/40 p-4">
                        <h3 className="text-sm font-semibold text-foreground">
                          {stage}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isComplete
                            ? "Completed"
                            : isCurrent
                              ? "Current stage"
                              : "Up next"}
                        </p>
                      </div>
                      {index < stages.length - 1 && (
                        <span className="absolute left-2 top-8 h-[calc(100%_-_1.5rem)] w-px bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent>
              <h3 className="text-sm font-semibold text-foreground">
                {activeTab}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Coming soon: medical document uploads will be available here for{" "}
                {activeTab.toLowerCase()}.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Records;
