import { useMemo, useState } from "react";
import {
  CalendarDays, ChevronDown, ChevronUp,
  Clock, Stethoscope, CheckCircle2,
  XCircle, AlertTriangle, Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { serviceGuides } from "@/lib/serviceGuides";

interface Props {
  serviceName: string;
  appointmentDate: string;
}

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const discomfortLevels: Record<string, { label: string; level: number; color: string }[]> = {
  "Metal Braces": [
    { label: "Day 1–3", level: 90, color: "bg-red-400" },
    { label: "Day 4–7", level: 60, color: "bg-orange-400" },
    { label: "Week 2–3", level: 30, color: "bg-amber-400" },
    { label: "Month 2+", level: 10, color: "bg-emerald-400" },
  ],
  "Ceramic Braces": [
    { label: "Day 1–3", level: 85, color: "bg-red-400" },
    { label: "Day 4–7", level: 55, color: "bg-orange-400" },
    { label: "Week 2–3", level: 25, color: "bg-amber-400" },
    { label: "Month 2+", level: 10, color: "bg-emerald-400" },
  ],
  "Self-Ligating Braces": [
    { label: "Day 1–3", level: 70, color: "bg-orange-400" },
    { label: "Day 4–7", level: 45, color: "bg-amber-400" },
    { label: "Week 2–3", level: 20, color: "bg-yellow-400" },
    { label: "Month 2+", level: 8, color: "bg-emerald-400" },
  ],
  "Clear Aligners": [
    { label: "Tray 1–2", level: 50, color: "bg-amber-400" },
    { label: "Tray 3–5", level: 30, color: "bg-yellow-400" },
    { label: "Tray 6+", level: 15, color: "bg-emerald-400" },
  ],
  "Retainers": [
    { label: "Night 1–3", level: 30, color: "bg-amber-400" },
    { label: "Week 2+", level: 5, color: "bg-emerald-400" },
  ],
  "Orthodontic Consultation": [
    { label: "During visit", level: 5, color: "bg-emerald-400" },
  ],
};

const foodRules: Record<string, { avoid: string[]; safe: string[] }> = {
  "Metal Braces": {
    avoid: ["Nuts and seeds", "Hard sweets and candy", "Popcorn", "Gum and toffee", "Raw carrots", "Hard bread crusts", "Biting into whole apples"],
    safe: ["Soft bread and pasta", "Yoghurt and eggs", "Cooked vegetables", "Soft fruit (cut up)", "Rice and ugali", "Fish and soft meat"],
  },
  "Ceramic Braces": {
    avoid: ["All hard and sticky foods (same as metal)", "Coffee and tea (stains ties)", "Tomato sauce and curry", "Red wine and coloured drinks"],
    safe: ["Same soft foods as metal braces", "Water and clear fluids", "White or light-coloured foods where possible"],
  },
  "Self-Ligating Braces": {
    avoid: ["Hard and sticky foods (same as metal braces)", "Anything that risks breaking a bracket"],
    safe: ["Same soft foods as metal braces"],
  },
  "Clear Aligners": {
    avoid: ["Eating with aligners in", "Hot drinks with aligners in (warps plastic)", "Coloured drinks with aligners in"],
    safe: ["Any food — remove aligners first", "Water only with aligners in"],
  },
  "Retainers": {
    avoid: ["Eating with retainer in", "Hot drinks (warps retainer)"],
    safe: ["Any food — remove retainer before eating"],
  },
  "Orthodontic Consultation": {
    avoid: [],
    safe: ["No food restrictions — this is an assessment visit"],
  },
};

const emergencyActions: Record<string, { situation: string; action: string }[]> = {
  "Metal Braces": [
    { situation: "Bracket comes loose", action: "Call the clinic within 48 hours. Keep the bracket if it detaches. Do not try to reattach it yourself." },
    { situation: "Wire is poking your cheek", action: "Use orthodontic wax (from any pharmacy) to cover the sharp end. Call the clinic to schedule a wire trim." },
    { situation: "Severe pain after adjustment", action: "Take paracetamol or ibuprofen. Eat soft foods. If pain persists beyond 5 days, contact the clinic." },
    { situation: "Elastic band snaps off", action: "This is normal and not urgent. Bring the broken band to your next appointment." },
  ],
  "Ceramic Braces": [
    { situation: "Bracket chips or cracks", action: "Ceramic brackets are more brittle than metal. Call the clinic within 48 hours for replacement." },
    { situation: "Bracket discolours", action: "This is usually the elastic tie, not the bracket itself. Ties are replaced at each adjustment appointment." },
    { situation: "Wire is poking", action: "Use orthodontic wax. Call the clinic to schedule a trim." },
  ],
  "Self-Ligating Braces": [
    { situation: "Bracket clip opens or breaks", action: "Call the clinic. Self-ligating clips are precise mechanisms — do not attempt to close them yourself." },
    { situation: "Wire is poking", action: "Use orthodontic wax and call the clinic." },
  ],
  "Clear Aligners": [
    { situation: "Aligner is cracked or broken", action: "Switch to the previous tray immediately to hold tooth position. Call the clinic — a replacement tray will need to be ordered." },
    { situation: "Lost an aligner", action: "Move to the next tray if you are more than halfway through the current one. Call the clinic to advise. Replacement cost applies." },
    { situation: "Attachments fall off", action: "Call the clinic within a few days. Attachments help the aligner grip — missing ones can slow tooth movement." },
  ],
  "Retainers": [
    { situation: "Retainer cracks or breaks", action: "Stop wearing it immediately to avoid swallowing pieces. Call the clinic — a new retainer is needed urgently to prevent teeth shifting." },
    { situation: "Retainer feels loose or tight", action: "This indicates teeth may have shifted. Contact the clinic for a check before wearing it further." },
    { situation: "Lost retainer", action: "Contact the clinic immediately. Even a few weeks without a retainer can cause significant tooth movement." },
  ],
  "Orthodontic Consultation": [],
};

const AdvancedServiceGuide = ({ serviceName, appointmentDate }: Props) => {
  const guide = serviceGuides[serviceName];
  const [openSection, setOpenSection] = useState<string | null>("timeline");

  const projectedPhases = useMemo(() => {
    if (!guide || !appointmentDate) return [];
    return guide.timeline.map((phase, i) => ({
      ...phase,
      projectedDate: addDays(
        appointmentDate,
        guide.phaseOffsets?.[i] ?? 0,
      ),
      isFirst: i === 0,
    }));
  }, [guide, appointmentDate]);

  if (!guide) return null;

  const foods = foodRules[serviceName];
  const discomfort = discomfortLevels[serviceName] ?? [];
  const emergency = emergencyActions[serviceName] ?? [];

  const toggle = (key: string) =>
    setOpenSection(prev => (prev === key ? null : key));

  const SectionHeader = ({
    title, sectionKey, icon,
  }: { title: string; sectionKey: string; icon: React.ReactNode }) => (
    <button
      className="flex w-full items-center justify-between py-3.5 text-left"
      onClick={() => toggle(sectionKey)}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <span className="text-primary">{icon}</span>
        </div>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {openSection === sectionKey
        ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
        : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
    </button>
  );

  return (
    <div className="space-y-3 mt-2">

      {/* Header */}
      <div className="rounded-2xl bg-primary/5 border border-primary/15 px-4 py-4">
        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">
          Your treatment guide
        </p>
        <h3 className="text-base font-extrabold text-foreground">
          {serviceName}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {guide.tagline}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock size={10} /> {guide.duration}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {guide.adjustmentFrequency}
          </Badge>
        </div>
      </div>

      {/* SECTION 1 — Projected timeline */}
      <Card className="border-0 shadow-sm">
        <CardContent className="px-4 pt-2 pb-2">
          <SectionHeader
            title="Your treatment timeline"
            sectionKey="timeline"
            icon={<CalendarDays size={16} />}
          />
          {openSection === "timeline" && (
            <div className="pb-4 space-y-0">
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                Dates are projected from your appointment and are approximate.
                Your practitioner will confirm actual timings at each visit.
              </p>
              {projectedPhases.map((phase, i) => (
                <div key={i} className="relative pl-10 pb-5">
                  {/* Circle */}
                  <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {i + 1}
                  </div>
                  {/* Connector line */}
                  {i < projectedPhases.length - 1 && (
                    <span className="absolute left-3 top-7 h-[calc(100%-4px)] w-0.5 bg-border" />
                  )}
                  {/* Content */}
                  <div className={cn(
                    "rounded-xl border p-3 space-y-1.5",
                    i === 0
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30"
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground leading-tight">
                        {phase.phase}
                      </p>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-[10px] font-semibold",
                          i === 0 ? "text-primary" : "text-muted-foreground"
                        )}>
                          {i === 0 ? "Your appointment" : "approx."}
                        </p>
                        <p className={cn(
                          "text-[11px] font-bold",
                          i === 0 ? "text-primary" : "text-foreground"
                        )}>
                          {phase.projectedDate}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {phase.detail}
                    </p>
                    {phase.duration && (
                      <Badge variant="secondary" className="text-[9px] font-medium">
                        <Clock size={9} className="mr-1" />
                        {phase.duration}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2 — Discomfort curve */}
      {discomfort.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="px-4 pt-2 pb-2">
            <SectionHeader
              title="What to expect"
              sectionKey="expect"
              icon={<Clock size={16} />}
            />
            {openSection === "expect" && (
              <div className="pb-4 space-y-5">
                {/* Discomfort visual */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    Discomfort over time
                  </p>
                  <div className="space-y-2">
                    {discomfort.map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <p className="text-[11px] text-muted-foreground w-16 shrink-0 text-right">
                          {d.label}
                        </p>
                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", d.color)}
                            style={{ width: `${d.level}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground w-8 shrink-0">
                          {d.level >= 70 ? "High"
                            : d.level >= 40 ? "Mod"
                            : d.level >= 15 ? "Low"
                            : "None"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    Paracetamol or ibuprofen helps during high-discomfort periods.
                    Soreness is a sign the treatment is working.
                  </p>
                </div>
                {/* What to expect items */}
                <div className="space-y-3">
                  {guide.whatToExpect.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-muted/50 border border-border p-3 space-y-1"
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 3 — Food do/don't */}
      {foods && (
        <Card className="border-0 shadow-sm">
          <CardContent className="px-4 pt-2 pb-2">
            <SectionHeader
              title="Food and lifestyle"
              sectionKey="food"
              icon={<Stethoscope size={16} />}
            />
            {openSection === "food" && (
              <div className="pb-4 space-y-4">
                {foods.avoid.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-red-600 mb-2 font-semibold">
                      Avoid
                    </p>
                    <div className="space-y-1.5">
                      {foods.avoid.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {foods.safe.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-600 mb-2 font-semibold">
                      Safe to eat
                    </p>
                    <div className="space-y-1.5">
                      {foods.safe.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Care items */}
                <div className="border-t border-border pt-4 space-y-3">
                  {guide.careAndLifestyle.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-sm font-bold text-foreground">
                        {item.heading}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 4 — Emergency actions */}
      {emergency.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="px-4 pt-2 pb-2">
            <SectionHeader
              title="If something goes wrong"
              sectionKey="emergency"
              icon={<Shield size={16} />}
            />
            {openSection === "emergency" && (
              <div className="pb-4 space-y-3">
                {emergency.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-800">
                        {e.situation}
                      </p>
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed pl-5">
                      {e.action}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AdvancedServiceGuide;