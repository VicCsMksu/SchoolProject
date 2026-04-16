import { CheckCircle2 } from "lucide-react";

export interface Step {
  id: number;
  title: string;
  description: string;
  duration?: string;
}

interface ProcedureStepsProps {
  steps: Step[];
  serviceName: string;
}

const ProcedureSteps = ({ steps, serviceName }: ProcedureStepsProps) => {
  return (
    <div className="px-5 mt-6">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Service Process
      </p>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Connector Line & Circle */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 size={18} className="text-primary" />
              </div>
              {index < steps.length - 1 && (
                <div className="mt-2 w-0.5 h-12 bg-border" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Step {index + 1}: {step.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {step.duration && (
                  <span className="ml-2 shrink-0 text-[10px] font-medium text-primary whitespace-nowrap">
                    {step.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcedureSteps;
