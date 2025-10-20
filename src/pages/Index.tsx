import { useState } from "react";
import { DomainSidebar } from "@/components/DomainSidebar";
import { TopNav } from "@/components/TopNav";
import { ChatInterface } from "@/components/ChatInterface";
import { ContextPanel } from "@/components/ContextPanel";
import { DashboardCard } from "@/components/DashboardCard";
import { ConversationHistory } from "@/components/ConversationHistory";
import { AISuggestions } from "@/components/AISuggestions";
import { QuickNotes } from "@/components/QuickNotes";
import { TopicSummarizer } from "@/components/TopicSummarizer";
import { QuickLog } from "@/components/QuickLog";
import { VoiceCall } from "@/components/VoiceCall";
import { Brain, Wallet, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/useDashboardData";

type Domain = "learn" | "finance" | "health" | "general";

const Index = () => {
  const [currentDomain, setCurrentDomain] = useState<Domain>("general");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { stats, loading } = useDashboardData();


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
          
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {currentDomain === "general" ? (
              <>
                {/* Dashboard Section for General AI */}
                <div className="overflow-y-auto pb-4 space-y-6">
                  {/* Header */}
                  <div className="text-center animate-scale-in">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight transition-all duration-300 hover:scale-105 cursor-default">
                      LIFEOS AI
                    </h2>
                    <div className="relative inline-block">
                      <p className="text-lg md:text-xl font-light italic text-muted-foreground animate-fade-in">
                        Summarise, life.
                      </p>
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-glow" />
                    </div>
                  </div>

                  {/* Dashboard Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                      <DashboardCard
                        domain="learn"
                        icon={Brain}
                        title="Learning Progress"
                        stats={[
                          { label: "Hours Studied", value: `${stats.learn.total_study_hours.toFixed(1)}h` },
                          { label: "Topics Covered", value: stats.learn.topics_covered },
                          { label: "Active Goals", value: stats.learn.active_goals },
                        ]}
                        chartData={[]}
                        chartType="line"
                      />
                    </div>
                    
                    <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                      <DashboardCard
                        domain="finance"
                        icon={Wallet}
                        title="Financial Health"
                        stats={[
                          { label: "Weekly Savings", value: `$${stats.finance.weekly_savings}` },
                          { label: "Expense Trend", value: `${stats.finance.expense_trend}%` },
                          { label: "Total Saved", value: `$${stats.finance.total_saved}` },
                        ]}
                        chartData={[]}
                        chartType="bar"
                      />
                    </div>
                    
                    <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                      <DashboardCard
                        domain="health"
                        icon={Heart}
                        title="Wellness Overview"
                        stats={[
                          { label: "Mood Score", value: `${stats.health.mood_score}/10` },
                          { label: "Steps Today", value: stats.health.steps_today },
                          { label: "Sleep", value: `${stats.health.sleep_hours}h` },
                        ]}
                        chartData={stats.health.mood_score * 10}
                        chartType="radial"
                      />
                    </div>
                  </div>

                  {/* Conversation History & AI Suggestions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ConversationHistory />
                    <AISuggestions />
                  </div>

                  {/* General AI Chat */}
                  <div className="mt-6">
                    <ChatInterface currentDomain={currentDomain} />
                  </div>
                </div>
              </>
            ) : currentDomain === "learn" ? (
              <div className="overflow-y-auto pb-4 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <QuickNotes />
                  <TopicSummarizer />
                </div>
                <ChatInterface currentDomain={currentDomain} />
              </div>
            ) : currentDomain === "health" ? (
              <div className="overflow-y-auto pb-4 space-y-6">
                <QuickLog />
                <ChatInterface currentDomain={currentDomain} />
              </div>
            ) : (
              <ChatInterface currentDomain={currentDomain} />
            )}
          </div>
          
          <ContextPanel
            currentDomain={currentDomain}
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(!isPanelOpen)}
          />
        </div>

        {/* Voice Call Button */}
        <VoiceCall currentDomain={currentDomain} />
      </div>
    </div>
  );
};

export default Index;
