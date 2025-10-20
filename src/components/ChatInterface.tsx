import { useState } from "react";
import { Mic, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Domain = "learn" | "finance" | "health" | "general";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  currentDomain: Domain;
}

export function ChatInterface({ currentDomain }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your ${currentDomain === "learn" ? "learning companion" : currentDomain === "finance" ? "financial advisor" : currentDomain === "health" ? "wellness coach" : "personal assistant"}. I can automatically track your activities, goals, and provide insights. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          domain: currentDomain,
          conversationId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageId = (Date.now() + 1).toString();

      // Add initial empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error calling AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Starting a new conversation. I'm ready to help with your ${currentDomain} goals!`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Domain indicator */}
      <div className={cn(
        "h-1 transition-all duration-500",
        currentDomain === "learn" && "gradient-learn",
        currentDomain === "finance" && "gradient-finance",
        currentDomain === "health" && "gradient-health"
      )} />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-slide-in",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3 backdrop-blur-lg transition-all duration-300 hover:scale-[1.02]",
                message.role === "user"
                  ? "bg-white/10 border border-white/20 text-foreground hover:bg-white/15 hover:shadow-lg"
                  : cn(
                      "border border-white/10 hover:border-white/20 hover:shadow-lg",
                      currentDomain === "learn" && "bg-blue-500/10 hover:bg-blue-500/15",
                      currentDomain === "finance" && "bg-emerald-500/10 hover:bg-emerald-500/15",
                      currentDomain === "health" && "bg-red-500/10 hover:bg-red-500/15"
                    )
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 glass-panel border-t border-white/10">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleNewChat}
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-white/10 flex-shrink-0 transition-all duration-300 hover:rotate-90 hover:scale-110"
          >
            <Plus className="w-5 h-5" />
          </Button>

          <div className="flex-1 flex items-center gap-2 glass-panel px-4 py-2 transition-all duration-300 hover:shadow-lg">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder={isLoading ? "AI is thinking..." : "Ask LIFEOS anything…"}
              disabled={isLoading}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full hover:bg-white/10 flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className={cn(
              "rounded-full flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-xl hover:shadow-primary/50",
              currentDomain === "learn" && "gradient-learn",
              currentDomain === "finance" && "gradient-finance",
              currentDomain === "health" && "gradient-health",
              (isLoading || !inputValue.trim()) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className={cn("w-4 h-4", isLoading && "animate-pulse")} />
          </Button>
        </div>
      </div>
    </div>
  );
}
