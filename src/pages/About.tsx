import {
  Heart,
  Shield,
  Users,
  MapPin,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How much do braces cost at MaxxDental Nairobi?",
    answer:
      "Our prices depend on the type of braces: Metal Braces start from KES 80,000, Ceramic Braces from KES 120,000, Self-Ligating from KES 100,000, and Clear Aligners from KES 150,000. All prices include consultation, fitting, all adjustment visits, and removal. We offer flexible payment plans — pay a 30% deposit and spread the rest over your treatment period.",
  },
  {
    question: "Do braces hurt?",
    answer:
      "You may feel mild pressure or soreness for 3–5 days after fitting and after each adjustment. This is completely normal — it means the braces are working. Over-the-counter pain relief like paracetamol helps. Most patients adapt quickly and feel no discomfort between adjustments.",
  },
  {
    question: "How long will I need to wear braces?",
    answer:
      "Treatment time varies by case. Metal and ceramic braces typically take 18–24 months. Self-ligating braces can be faster at 12–20 months. Clear aligners usually take 12–18 months. Your orthodontist will give you a personalised estimate at your consultation.",
  },
  {
    question: "What can I eat with braces?",
    answer:
      "Avoid hard foods (nuts, hard candy, raw carrots), sticky foods (gum, toffee, caramel), and biting directly into hard fruits. Stick to soft foods especially after adjustments — pasta, soft bread, yoghurt, eggs, and cooked vegetables are all fine.",
  },
  {
    question: "How do I clean my teeth with braces?",
    answer:
      "Brush after every meal using a soft-bristled toothbrush. Use an interdental brush to clean under the wire and around each bracket. Floss daily using a floss threader or orthodontic floss. Rinse with fluoride mouthwash. Good oral hygiene is critical during treatment.",
  },
  {
    question: "What do I do if a bracket falls off or a wire breaks?",
    answer:
      "Call us immediately. A loose bracket is not an emergency but needs to be fixed promptly to keep treatment on track. If a wire is poking your cheek, use orthodontic wax (available at any pharmacy) to cover the sharp end temporarily.",
  },
  {
    question: "Can adults get braces?",
    answer:
      "Absolutely. About 20% of our patients are adults. There is no age limit for orthodontic treatment — teeth can be moved at any age as long as they and the gums are healthy. Many adults prefer ceramic braces or clear aligners for a more discreet look.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Yes. For all treatments over KES 10,000 we offer flexible payment plans. Typically: pay a 30% deposit upfront, then spread the remaining balance in monthly instalments over your treatment duration. We accept M-Pesa, cash, and card.",
  },
];

const About = () => {
  return (
    <div className="px-5 pt-8 pb-16">
      {/* Header */}
      <h1 className="mb-1 text-2xl font-extrabold text-primary">
        MaxxDental Nairobi
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Expert orthodontic care with flexible payment plans that fit your
        budget.
      </p>

      {/* Clinic info cards */}
      <div className="flex flex-col gap-3 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Heart className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Our Mission</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                To deliver expert orthodontic care that is accessible and
                affordable for every patient in Nairobi, without compromising on
                quality or results.
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
                Transparency, patient-centred care, and honest pricing guide
                everything we do. No hidden fees, no pressure, no surprises.
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
                A team of experienced orthodontists and dental officers
                committed to your smile journey from first consultation to final
                retainer.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Visit Us</h3>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin size={14} className="shrink-0 text-primary mt-0.5" />
              <span>Nairobi, Kenya</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Clock size={14} className="shrink-0 text-primary mt-0.5" />
              <span>Monday – Saturday, 8:00 AM – 6:00 PM</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Phone size={14} className="shrink-0 text-primary mt-0.5" />
              <span>Book via the app or call us directly</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ section */}
      <h2 className="text-base font-bold text-foreground mb-1">
        Frequently Asked Questions
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Everything you need to know before starting your smile journey.
      </p>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map(({ question, answer }, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="rounded-xl border-0 bg-card shadow-sm px-4"
          >
            <AccordionTrigger className="text-sm font-medium text-foreground py-3.5 hover:no-underline text-left">
              {question}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default About;
