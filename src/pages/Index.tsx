import { useState } from "react";
import { DomainSidebar } from "@/components/DomainSidebar";
import { TopNav } from "@/components/TopNav";
import { ChatInterface } from "@/components/ChatInterface";
import { ContextPanel } from "@/components/ContextPanel";
import { cn } from "@/lib/utils";

type Domain = "learn" | "finance" | "health";

const Index = () => {
  const [currentDomain, setCurrentDomain] = useState<Domain>("learn");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Animated background gradient */}
      <div
        className={cn(
          "fixed inset-0 transition-all duration-1000 opacity-30",
          currentDomain === "learn" && "bg-gradient-to-br from-blue-900/30 via-background to-purple-900/30",
          currentDomain === "finance" && "bg-gradient-to-br from-emerald-900/30 via-background to-teal-900/30",
          currentDomain === "health" && "bg-gradient-to-br from-red-900/30 via-background to-orange-900/30"
        )}
      />

      {/* Floating accent particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-1000",
            currentDomain === "learn" && "gradient-learn",
            currentDomain === "finance" && "gradient-finance",
            currentDomain === "health" && "gradient-health"
          )}
        />
        <div
          className={cn(
            "absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-1000",
            currentDomain === "learn" && "gradient-learn",
            currentDomain === "finance" && "gradient-finance",
            currentDomain === "health" && "gradient-health"
          )}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNav />
        
        <div className="flex flex-1 gap-4 p-4 overflow-hidden">
          <DomainSidebar
            currentDomain={currentDomain}
            onDomainChange={setCurrentDomain}
          />
          
          <ChatInterface currentDomain={currentDomain} />
          
          <ContextPanel
            currentDomain={currentDomain}
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(!isPanelOpen)}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
