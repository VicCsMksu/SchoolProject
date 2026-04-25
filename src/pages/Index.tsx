import { Link } from "react-router-dom";
import { Stethoscope, Users, Smile, Sparkles, Zap, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const quickServices = [
  { icon: Stethoscope, label: "Orthodontic Consultation" },
  { icon: Smile, label: "Metal Braces" },
  { icon: Sparkles, label: "Ceramic Braces" },
  { icon: Zap, label: "Self-Ligating Braces" },
  { icon: EyeOff, label: "Clear Aligners" },
  { icon: ShieldCheck, label: "Retainers" },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero with blue gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary to-primary/40 px-6 pb-16 pt-12 text-center sm:text-left">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-medical-dark/20" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-medical-dark/10" />
        <div className="relative z-10">
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl">
            Your Perfect Smile<br />Starts Here
          </h1>
          <p className="mb-8 mx-auto sm:mx-0 max-w-xs text-sm leading-relaxed text-primary-foreground/90">
            MaxxDental Nairobi — expert orthodontic care with flexible payment plans that fit your budget.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/signin">
              <Button
                size="lg"
                className="w-full rounded-full bg-primary-foreground text-primary font-semibold shadow-lg hover:bg-primary-foreground/90"
              >
                Book a Consultation
              </Button>
            </Link>
            <Link to="/services">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full border-primary-foreground text-primary font-semibold bg-background/80 hover:bg-background"
              >
                View Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="relative z-20 mx-5 -mt-4 rounded-xl bg-background p-4 shadow-sm border border-secondary">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-sm font-bold text-primary">500+</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Smiles Transformed</p>
          </div>
          <div className="border-x border-secondary text-center">
            <p className="text-sm font-bold text-primary">10+</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-primary">Flexible</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Payment Plans</p>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <section className="mt-6 px-5">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/services">
            <Card className="group cursor-pointer border-0 shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Stethoscope className="text-primary" size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Our Services</p>
                  <p className="text-[10px] text-muted-foreground">Expert Care</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/doctors">
            <Card className="group cursor-pointer border-0 shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Users className="text-primary" size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Meet Our Doctors</p>
                  <p className="text-[10px] text-muted-foreground">Specialists</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Offered Services */}
      <section className="mt-10 px-5 mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Specialized Services</h2>
          <Link to="/services" className="text-xs font-semibold text-primary flex items-center gap-1">
            See all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-6">
          {quickServices.map(({ icon: Icon, label }) => (
            <Link key={label} to="/services" className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary shadow-sm transition-all hover:scale-105 hover:shadow-md">
                <Icon className="text-primary" size={28} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground leading-tight px-1">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner fallback / info */}
      <section className="mx-5 mb-10 overflow-hidden rounded-2xl bg-primary/10 border border-primary/20 p-5">
        <h3 className="mb-1 text-base font-bold text-primary">
          Need Orthodontic Advice?
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Schedule your first consultation today and start your journey to a perfect smile.
        </p>
        <Link to="/signin">
          <Button
            size="sm"
            className="rounded-full font-semibold bg-primary text-primary-foreground"
          >
            Start Now
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Index;
