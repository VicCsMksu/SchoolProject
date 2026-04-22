import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Stethoscope,
  BadgePercent,
  Smartphone,
  Banknote,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { serviceGuides, serviceOrder } from "@/lib/serviceGuides";

type PaymentOption = "installment" | "full" | "staged";
type RepaymentPeriod = 6 | 12 | 18 | 24;

const formatKES = (amount: number) =>
  "KES " + amount.toLocaleString("en-KE", { maximumFractionDigits: 0 });

const paymentMethodIcons: Record<string, React.ReactNode> = {
  "M-Pesa": <Smartphone size={14} />,
  Cash: <Banknote size={14} />,
  Card: <Building2 size={14} />,
};

const PaymentPlans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("cost");
  const [paymentOption, setPaymentOption] =
    useState<PaymentOption>("installment");
  const [repaymentMonths, setRepaymentMonths] = useState<RepaymentPeriod>(12);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);

  // Check for active treatment
  const { data: treatmentProgress } = useQuery({
    queryKey: ["treatment-progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatment_progress")
        .select("service_name")
        .eq("patient_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Check for active appointment
  const { data: activeAppointment } = useQuery({
    queryKey: ["active-appointment", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, services(name)")
        .eq("patient_id", user?.id || "")
        .in("status", ["Pending", "Approved"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Derive active service name
  const activeServiceName = useMemo(() => {
    if (
      treatmentProgress?.service_name &&
      serviceGuides[treatmentProgress.service_name]
    ) {
      return treatmentProgress.service_name;
    }
    const apptService = activeAppointment?.services?.name;
    if (apptService && serviceGuides[apptService]) return apptService;
    return null;
  }, [treatmentProgress, activeAppointment]);

  const currentServiceName = selectedService ?? activeServiceName;
  const guide = currentServiceName ? serviceGuides[currentServiceName] : null;
  const paymentOptions = [
    "installment",
    "full",
    ...(guide?.stagedAvailable ? ["staged"] : []),
  ] as PaymentOption[];

  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam && serviceGuides[serviceParam]) {
      setSelectedService(serviceParam);
      setSliderValue([50]);
    }
  }, [searchParams]);

  // Calculator logic
  const midPrice = guide
    ? Math.round((guide.priceRange.min + guide.priceRange.max) / 2)
    : 0;
  const selectedPrice = guide
    ? guide.priceRange.min +
      Math.round(
        (sliderValue[0] / 100) * (guide.priceRange.max - guide.priceRange.min),
      )
    : 0;

  const depositAmount = Math.round(
    (selectedPrice * (guide?.depositPercent ?? 30)) / 100,
  );
  const remainder = selectedPrice - depositAmount;
  const monthlyPayment =
    repaymentMonths > 0 ? Math.round(remainder / repaymentMonths) : 0;
  const fullPayDiscount = guide
    ? Math.round(selectedPrice * (guide.uptrontDiscount / 100))
    : 0;
  const fullPayTotal = selectedPrice - fullPayDiscount;

  const stagedPerJaw = guide ? Math.round(selectedPrice / 2) : 0;
  const stagedDeposit = Math.round(
    (stagedPerJaw * (guide?.depositPercent ?? 30)) / 100,
  );
  const stagedMonthly =
    repaymentMonths > 0
      ? Math.round((stagedPerJaw - stagedDeposit) / repaymentMonths)
      : 0;

  const toggleSection = (key: string) =>
    setExpandedSection((prev) => (prev === key ? null : key));

  const SectionHeader = ({
    title,
    sectionKey,
    icon,
  }: {
    title: string;
    sectionKey: string;
    icon: React.ReactNode;
  }) => (
    <button
      className="flex w-full items-center justify-between py-3 text-left"
      onClick={() => toggleSection(sectionKey)}
    >
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {expandedSection === sectionKey ? (
        <ChevronUp size={16} className="text-muted-foreground" />
      ) : (
        <ChevronDown size={16} className="text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">Payment Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Transparent pricing, flexible payments, and a full treatment guide for
          every service.
        </p>
      </div>

      {/* Active service banner */}
      {activeServiceName && !selectedService && (
        <div className="mb-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-primary mb-0.5">
            Your active service
          </p>
          <p className="text-sm font-bold text-foreground">
            {activeServiceName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing your personalised payment guide below
          </p>
        </div>
      )}

      {/* Service selector */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          {activeServiceName ? "Switch to another service" : "Select a service"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {serviceOrder.map((name) => (
            <button
              key={name}
              onClick={() => {
                setSelectedService(
                  name === activeServiceName && !selectedService ? null : name,
                );
                setSliderValue([50]);
                setExpandedSection("cost");
                setPaymentOption("installment");
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                currentServiceName === name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* No service selected state */}
      {!guide && (
        <div
          className="flex min-h-[40vh] flex-col items-center justify-center 
          gap-4 rounded-3xl border border-border bg-background/80 p-8 text-center"
        >
          <Stethoscope size={32} className="text-muted-foreground" />
          <h3 className="text-base font-bold text-primary">
            Select a service above
          </h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Tap any service to see its full payment breakdown, treatment
            timeline, and care guide.
          </p>
        </div>
      )}

      {/* Full guide */}
      {guide && (
        <div className="space-y-3">
          {/* Hero card */}
          <Card className="border-0 shadow-sm bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="pt-5 pb-5">
              <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">
                {guide.duration}
              </p>
              <h2 className="text-lg font-extrabold mb-2">{guide.name}</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                {guide.tagline}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold">
                  {formatKES(guide.priceRange.min)}
                </span>
                <span className="text-sm opacity-80">
                  – {formatKES(guide.priceRange.max)}
                </span>
              </div>
              <p className="text-[11px] opacity-70 mt-1">{guide.priceNote}</p>
            </CardContent>
          </Card>

          {/* SECTION 1: Cost breakdown */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-2">
              <SectionHeader
                title="What's included"
                sectionKey="cost"
                icon={<CheckCircle2 size={16} />}
              />
              {expandedSection === "cost" && (
                <div className="pb-3 space-y-4">
                  <div className="space-y-2">
                    {guide.included.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  {guide.excluded.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Not included
                      </p>
                      <div className="space-y-2">
                        {guide.excluded.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <XCircle
                              size={14}
                              className="text-muted-foreground shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-muted-foreground">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2: Payment calculator */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-2">
              <SectionHeader
                title="Payment calculator"
                sectionKey="calculator"
                icon={<CreditCard size={16} />}
              />
              {expandedSection === "calculator" && (
                <div className="pb-4 space-y-5">
                  {/* Price slider */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Treatment cost</span>
                      <span className="font-bold text-primary">
                        {formatKES(selectedPrice)}
                      </span>
                    </div>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{formatKES(guide.priceRange.min)}</span>
                      <span>{formatKES(guide.priceRange.max)}</span>
                    </div>
                  </div>

                  {/* Payment option selector */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Payment option
                    </p>
                    <div className="grid gap-2">
                      {paymentOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setPaymentOption(opt)}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                            paymentOption === opt
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40",
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                              paymentOption === opt
                                ? "border-primary bg-primary"
                                : "border-muted-foreground",
                            )}
                          >
                            {paymentOption === opt && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {opt === "installment" &&
                                "Deposit + monthly instalments"}
                              {opt === "full" && "Pay in full (save 5%)"}
                              {opt === "staged" && "Staged — one jaw at a time"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {opt === "installment" &&
                                `${guide.depositPercent}% deposit upfront, rest spread over your treatment`}
                              {opt === "full" &&
                                `Single payment of ${formatKES(fullPayTotal)} — save ${formatKES(fullPayDiscount)}`}
                              {opt === "staged" && guide.stagedNote}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Repayment period (installment and staged only) */}
                  {(paymentOption === "installment" ||
                    paymentOption === "staged") && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Repayment period
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {([6, 12, 18, 24] as RepaymentPeriod[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => setRepaymentMonths(m)}
                            className={cn(
                              "rounded-xl border py-2 text-xs font-semibold transition-colors",
                              repaymentMonths === m
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:border-primary",
                            )}
                          >
                            {m}mo
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result card */}
                  <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4 space-y-3">
                    {paymentOption === "installment" && (
                      <>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Deposit (due at start)
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatKES(depositAmount)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Monthly × {repaymentMonths}
                          </p>
                          <p className="text-lg font-extrabold text-primary">
                            {formatKES(monthlyPayment)}/mo
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-2">
                          <p className="text-xs text-muted-foreground">
                            Total cost
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {formatKES(selectedPrice)}
                          </p>
                        </div>
                      </>
                    )}
                    {paymentOption === "full" && (
                      <>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Full payment
                          </p>
                          <p className="text-lg font-extrabold text-primary">
                            {formatKES(fullPayTotal)}
                          </p>
                        </div>
                        {fullPayDiscount > 0 && (
                          <div
                            className="flex items-center gap-2 rounded-lg bg-emerald-50 
                            border border-emerald-200 px-3 py-2"
                          >
                            <BadgePercent
                              size={14}
                              className="text-emerald-600 shrink-0"
                            />
                            <p className="text-xs text-emerald-700 font-medium">
                              You save {formatKES(fullPayDiscount)} with upfront
                              payment
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {paymentOption === "staged" && (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Per jaw
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Deposit per jaw
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatKES(stagedDeposit)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Monthly × {repaymentMonths}
                          </p>
                          <p className="text-lg font-extrabold text-primary">
                            {formatKES(stagedMonthly)}/mo
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-2">
                          <p className="text-xs text-muted-foreground">
                            Cost per jaw
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {formatKES(stagedPerJaw)}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Payment methods */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {guide.paymentMethods.map((method) => (
                        <Badge
                          key={method}
                          variant="secondary"
                          className="text-[10px] gap-1 font-medium"
                        >
                          {paymentMethodIcons[method]}
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    * These figures are estimates based on the price range you
                    selected. Your exact cost and payment plan are confirmed at
                    your initial consultation with MaxxDental.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 3: Timeline */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-2">
              <SectionHeader
                title="Treatment timeline"
                sectionKey="timeline"
                icon={<CalendarDays size={16} />}
              />
              {expandedSection === "timeline" && (
                <div className="pb-3 space-y-4">
                  {guide.timeline.map((phase, i) => (
                    <div key={i} className="relative pl-9">
                      <div
                        className="absolute left-0 top-1 flex h-6 w-6 items-center
                        justify-center rounded-full bg-primary/10"
                      >
                        <span className="text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                      </div>
                      {i < guide.timeline.length - 1 && (
                        <span
                          className="absolute left-2.5 top-7 h-[calc(100%+4px)]
                          w-px bg-border"
                        />
                      )}
                      <div className="pb-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-foreground">
                            {phase.phase}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-medium"
                          >
                            {phase.duration}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {phase.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: What to expect */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-2">
              <SectionHeader
                title="What to expect"
                sectionKey="expect"
                icon={<Clock size={16} />}
              />
              {expandedSection === "expect" && (
                <div className="pb-3 space-y-4">
                  {guide.whatToExpect.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-muted/50 p-3 space-y-1"
                    >
                      <p className="text-sm font-bold text-foreground">
                        {item.heading}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: Care and lifestyle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-2">
              <SectionHeader
                title="Care and lifestyle"
                sectionKey="care"
                icon={<Stethoscope size={16} />}
              />
              {expandedSection === "care" && (
                <div className="pb-3 space-y-4">
                  {guide.careAndLifestyle.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        {item.heading}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                      {i < guide.careAndLifestyle.length - 1 && (
                        <div className="pt-2 border-b border-border" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticky CTA */}
      {guide && (
        <div
          className="fixed bottom-16 left-0 right-0 z-40 bg-background 
          border-t border-border px-5 py-3"
        >
          <div className="mx-auto max-w-lg">
            <Button
              className="w-full rounded-xl py-6 text-sm font-bold"
              onClick={() =>
                navigate(
                  `/appointment/book?service=${encodeURIComponent(
                    currentServiceName || "",
                  )}`,
                )
              }
            >
              {guide.bookingCta}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPlans;
