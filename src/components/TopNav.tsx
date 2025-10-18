import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNav() {
  return (
    <header className="h-16 glass-panel flex items-center justify-between px-6 border-b border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight hidden sm:block">
          LIFEOS AI
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
