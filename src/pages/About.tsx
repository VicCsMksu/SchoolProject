import { Heart, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="px-5 pt-8 pb-10">
      <h1 className="mb-1 text-2xl font-extrabold text-primary">About Us</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Dedicated to providing quality healthcare services for every patient.
      </p>

      <div className="flex flex-col gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Heart className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Our Mission</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                To deliver compassionate, accessible, and high-quality medical care to communities we serve.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Shield className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Our Values</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Integrity, excellence, and patient-centered care guide everything we do.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Users className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Our Team</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                A team of experienced physicians, nurses, and healthcare professionals committed to your well-being.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
