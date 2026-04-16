import { Link } from "react-router-dom";
import { Stethoscope, Users, HeartPulse, Syringe, ClipboardCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const quickServices = [
  { icon: HeartPulse, label: "Consultation" },
  { icon: Syringe, label: "Vaccination" },
  { icon: ClipboardCheck, label: "Check-ups" },
  { icon: ShieldCheck, label: "Prevention" },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero with teal gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary to-primary/40 px-6 pb-14 pt-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-medical-dark/20" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-medical-dark/10" />
        <div className="relative z-10">
          <h1 className="mb-2 text-2xl font-extrabold leading-tight text-primary-foreground">
            Multilab Diagnostic<br />& Health Services
          </h1>
          <p className="mb-6 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
            A Healthy Life Starts With A Better Choice.
          </p>
          <Link to="/doctors">
            <Button
              size="lg"
              className="rounded-full bg-primary-foreground text-primary font-semibold shadow-lg hover:bg-primary-foreground/90"
            >
              Find a Doctor
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Access */}
      <section className="px-5 -mt-6 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/services">
            <Card className="group cursor-pointer border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Stethoscope className="text-primary" size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Services</p>
                  <p className="text-xs text-muted-foreground">Browse all</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/doctors">
            <Card className="group cursor-pointer border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Users className="text-primary" size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Doctors</p>
                  <p className="text-xs text-muted-foreground">Top rated</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Offered Services */}
      <section className="mt-8 px-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Offered Services</h2>
          <Link to="/services" className="text-xs font-semibold text-primary">
            See all
          </Link>
        </div>
        <p className="mb-4 text-center text-xs text-muted-foreground">
          Easily access specialists and doctors offering these services.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {quickServices.map(({ icon: Icon, label }) => (
            <Link key={label} to="/services" className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary shadow-sm transition-transform hover:scale-105">
                <Icon className="text-primary" size={24} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-5 mt-8 mb-6 overflow-hidden rounded-2xl bg-primary p-5">
        <h3 className="mb-1 text-base font-bold text-primary-foreground">
          Need immediate help?
        </h3>
        <p className="mb-4 text-xs text-primary-foreground/70">
          Our specialists are available 24/7 for consultations.
        </p>
        <Link to="/signin">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full font-semibold"
          >
            Book Now
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Index;
