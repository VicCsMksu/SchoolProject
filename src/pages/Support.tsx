import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";



const faqs = [
  { question: "How do I access my lab results?" },
  { question: "Can I cancel an appointment within 24 hours?" },
  { question: "How do I add insurance information?" },
  { question: "How do I update my contact details?" },
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
          {faqs.map(({ question }, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border-0 bg-card shadow-sm px-4">
              <AccordionTrigger className="text-sm font-medium text-foreground py-3.5 hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground pb-3">
                This information will be available soon. Please contact admin via the support topics above.
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Support;
