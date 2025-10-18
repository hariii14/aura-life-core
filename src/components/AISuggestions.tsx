import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, TrendingUp, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  icon: typeof Sparkles;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    icon: TrendingUp,
    title: "Increase Your Savings Rate",
    description: "Based on your spending patterns, you could save an extra $200/month by reducing dining expenses.",
    priority: "high",
  },
  {
    id: "2",
    icon: Target,
    title: "Complete Python Course",
    description: "You're 75% through your Python course. Finishing this week will maintain your learning streak!",
    priority: "high",
  },
  {
    id: "3",
    icon: Activity,
    title: "Improve Sleep Consistency",
    description: "Your sleep schedule varies by 2+ hours. Try going to bed at the same time for better rest.",
    priority: "medium",
  },
  {
    id: "4",
    icon: Sparkles,
    title: "Weekly Review Session",
    description: "Schedule 30 minutes this Sunday to review your progress across all domains.",
    priority: "low",
  },
];

const priorityStyles = {
  high: "border-health-from/30 bg-health-from/5",
  medium: "border-learn-from/30 bg-learn-from/5",
  low: "border-finance-from/30 bg-finance-from/5",
};

export function AISuggestions() {
  return (
    <Card className="glass-panel h-[400px] flex flex-col animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-glow" />
          <CardTitle className="text-xl font-semibold">AI Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-3 pb-6">
            {mockSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;

              return (
                <div
                  key={suggestion.id}
                  className={cn(
                    "group p-4 rounded-lg border",
                    "backdrop-blur-sm transition-all duration-300 cursor-pointer",
                    "hover:scale-[1.02] hover:shadow-lg animate-fade-in",
                    priorityStyles[suggestion.priority]
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold">{suggestion.title}</h4>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            suggestion.priority === "high" && "bg-health-from/20 text-health-from",
                            suggestion.priority === "medium" && "bg-learn-from/20 text-learn-from",
                            suggestion.priority === "low" && "bg-finance-from/20 text-finance-from"
                          )}
                        >
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
