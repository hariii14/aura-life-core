import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Wallet, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Domain = "learn" | "finance" | "health";

interface Conversation {
  id: string;
  domain: Domain;
  preview: string;
  timestamp: string;
}

const mockConversations: Conversation[] = [];

const domainConfig = {
  learn: {
    icon: Brain,
    color: "text-learn-from",
    bg: "bg-learn-from/10",
  },
  finance: {
    icon: Wallet,
    color: "text-finance-from",
    bg: "bg-finance-from/10",
  },
  health: {
    icon: Heart,
    color: "text-health-from",
    bg: "bg-health-from/10",
  },
};

export function ConversationHistory() {
  return (
    <Card className="glass-panel h-[400px] flex flex-col animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Conversations</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-3 pb-6">
            {mockConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start chatting to see your history</p>
              </div>
            ) : (
              mockConversations.map((conversation, index) => {
                const config = domainConfig[conversation.domain];
                const Icon = config.icon;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group p-4 rounded-lg border border-white/10 hover:border-white/20",
                      "backdrop-blur-sm bg-white/5 hover:bg-white/10",
                      "transition-all duration-300 cursor-pointer",
                      "hover:translate-x-1 animate-fade-in"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", config.bg)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 mb-1">
                          {conversation.preview}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
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
