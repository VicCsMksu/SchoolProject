import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["All", "Consultation", "Laboratory Results"];

const Records = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="px-5 pt-8">
      <h1 className="text-xl font-bold text-primary">Medical Records</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        View and manage your medical records.
      </p>

      <div className="mb-8 flex gap-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="mb-1 text-base font-bold text-primary">No medical records found</h3>
        <p className="text-center text-xs text-muted-foreground">
          You're all caught up! Check back later for new updates.
        </p>
      </div>
    </div>
  );
};

export default Records;
