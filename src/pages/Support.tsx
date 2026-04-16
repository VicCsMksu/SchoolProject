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
      "Avoid hard foods (nuts, hard candy, raw carrots), sticky foods (gum, toffee, caramel), and biting directly into hard fruits. Stick to soft foods especially after adjustments — pasta, soft bread, yoghurt, eggs, and cooked vegetables are all fine. You can still eat most foods, just be careful.",
  },
  {
    question: "How do I clean my teeth with braces?",
    answer:
      "Brush after every meal using a soft-bristled toothbrush. Use an interdental brush to clean under the wire and around each bracket. Floss daily using a floss threader or orthodontic floss. Rinse with fluoride mouthwash. Good oral hygiene is critical during treatment — plaque around brackets can cause permanent marks on teeth.",
  },
  {
    question: "What do I do if a bracket falls off or a wire breaks?",
    answer:
      "Call us immediately on our clinic number. Don't panic — a loose bracket or broken wire is not an emergency, but it does need to be fixed promptly to keep your treatment on track. If a wire is poking your cheek, use orthodontic wax (available at any pharmacy) to cover the sharp end temporarily.",
  },
  {
    question: "Can adults get braces?",
    answer:
      "Absolutely. About 20% of our patients are adults. There is no age limit for orthodontic treatment — teeth can be moved at any age as long as they and the gums are healthy. Many adults prefer ceramic braces or clear aligners for a more discreet look.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Yes. For all treatments over KES 10,000, we offer flexible payment plans. Typically: pay a 30% deposit upfront, then spread the remaining balance in monthly instalments over your treatment duration. We accept M-Pesa, cash, and card. Contact us to discuss a plan that works for your budget.",
  },
];

const Support = () => {
  return (
    <div className="px-5 pt-8 pb-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-foreground">
          How can we support your{" "}
          <span className="text-primary">care today</span>?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find answers to common questions about your health records,
          appointments, and technical support.
        </p>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-base font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Quick self-service for common issues
        </p>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map(({ question, answer }, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-lg border-0 bg-card shadow-sm px-4"
            >
              <AccordionTrigger className="text-sm font-medium text-foreground py-3.5 hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground pb-3">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Support;
