import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInsights } from "@/hooks/useInsights";

const iconMap = {
  learn: Lightbulb,
  finance: TrendingUp,
  health: Target,
  general: Sparkles,
};

const priorityStyles = {
  high: "border-health-from/30 bg-health-from/5",
  medium: "border-learn-from/30 bg-learn-from/5",
  low: "border-finance-from/30 bg-finance-from/5",
};

export function AISuggestions() {
  const { insights, loading } = useInsights();

  return (
    <Card className="glass-panel h-[400px] flex flex-col animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-glow" />
          <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-3 pb-6">
            {loading ? (
              <div className="flex items-center justify-center h-full py-20">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <p className="text-sm text-muted-foreground">No AI insights yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chat with AI to get personalized insights
                </p>
              </div>
            ) : (
              insights.map((insight, index) => {
                const Icon = iconMap[insight.domain as keyof typeof iconMap] || Sparkles;

                return (
                  <div
                    key={insight.id}
                    className={cn(
                      "group p-4 rounded-lg border",
                      "backdrop-blur-sm transition-all duration-300 cursor-pointer",
                      "hover:scale-[1.02] hover:shadow-lg animate-fade-in",
                      priorityStyles[insight.priority]
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
                          <h4 className="text-sm font-semibold">{insight.title}</h4>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              insight.priority === "high" && "bg-health-from/20 text-health-from",
                              insight.priority === "medium" && "bg-learn-from/20 text-learn-from",
                              insight.priority === "low" && "bg-finance-from/20 text-finance-from"
                            )}
                          >
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {insight.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
