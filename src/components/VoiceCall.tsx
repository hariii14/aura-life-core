import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Domain = "learn" | "finance" | "health" | "general";

interface VoiceCallProps {
  currentDomain: Domain;
}

export function VoiceCall({ currentDomain }: VoiceCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const handleStartCall = () => {
    setIsCallActive(true);
    toast({
      title: "Voice call started",
      description: "AI voice assistant is now listening...",
    });
    // TODO: Integrate OpenAI Realtime API
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    toast({
      title: "Call ended",
      description: "Voice call has been disconnected.",
    });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Microphone is now active" : "Microphone is muted",
    });
  };

  return (
    <div className="fixed bottom-8 right-8 flex items-center gap-3 z-50">
      {isCallActive && (
        <Button
          onClick={handleToggleMute}
          size="icon"
          variant="ghost"
          className={cn(
            "rounded-full w-12 h-12 backdrop-blur-lg border transition-all",
            isMuted
              ? "bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
              : "bg-white/10 border-white/20 hover:bg-white/20"
          )}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      )}

      <Button
        onClick={isCallActive ? handleEndCall : handleStartCall}
        size="icon"
        className={cn(
          "rounded-full w-14 h-14 transition-all hover:scale-110",
          isCallActive
            ? "bg-red-500 hover:bg-red-600"
            : currentDomain === "learn" && "gradient-learn",
          currentDomain === "finance" && "gradient-finance",
          currentDomain === "health" && "gradient-health",
          currentDomain === "general" && "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
        )}
      >
        {isCallActive ? (
          <PhoneOff className="w-6 h-6" />
        ) : (
          <Phone className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
