import { TrendingUp, Target, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Domain = "learn" | "finance" | "health";

interface ContextPanelProps {
  currentDomain: Domain;
  isOpen: boolean;
  onToggle: () => void;
}

const domainInsights = {
  learn: [
    { label: "Active Goals", value: "3", icon: Target },
    { label: "Completed Today", value: "2 lessons", icon: TrendingUp },
    { label: "Streak", value: "7 days", icon: Activity },
  ],
  finance: [
    { label: "Monthly Budget", value: "$2,450", icon: Target },
    { label: "Expenses This Week", value: "$320", icon: TrendingUp },
    { label: "Savings Rate", value: "23%", icon: Activity },
  ],
  health: [
    { label: "Mood This Week", value: "Positive", icon: Activity },
    { label: "Sleep Average", value: "7.5h", icon: TrendingUp },
    { label: "Active Minutes", value: "145", icon: Target },
  ],
};

export function ContextPanel({ currentDomain, isOpen, onToggle }: ContextPanelProps) {
  const insights = domainInsights[currentDomain];

  return (
    <>
      {/* Toggle button - visible on mobile/tablet */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="icon"
        className={cn(
          "fixed right-4 top-20 z-50 lg:hidden rounded-full glass-panel",
          isOpen && "hidden"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Panel */}
      <aside
        className={cn(
          "fixed lg:relative right-0 top-0 h-full w-80 glass-panel p-6 flex-shrink-0 transition-transform duration-300 z-40",
          "flex flex-col gap-6",
          !isOpen && "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Close button - mobile only */}
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className="lg:hidden self-end rounded-full"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Button>

        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {currentDomain === "learn"
              ? "Learning Insights"
              : currentDomain === "finance"
              ? "Financial Overview"
              : "Wellness Metrics"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time tracking and analytics
          </p>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {insight.label}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110",
                      currentDomain === "learn" && "bg-blue-500/20",
                      currentDomain === "finance" && "bg-emerald-500/20",
                      currentDomain === "health" && "bg-red-500/20"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p
                  className={cn(
                    "text-2xl font-semibold",
                    currentDomain === "learn" && "text-gradient-learn",
                    currentDomain === "finance" && "text-gradient-finance",
                    currentDomain === "health" && "text-gradient-health"
                  )}
                >
                  {insight.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-auto space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start glass-panel border-white/10 hover:bg-white/10"
          >
            View Full Analytics
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start glass-panel border-white/10 hover:bg-white/10"
          >
            Export Data
          </Button>
        </div>
      </aside>

      {/* Backdrop overlay - mobile only */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}
