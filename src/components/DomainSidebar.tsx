import { Brain, DollarSign, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Domain = "learn" | "finance" | "health";

interface DomainSidebarProps {
  currentDomain: Domain;
  onDomainChange: (domain: Domain) => void;
}

const domains = [
  {
    id: "learn" as Domain,
    name: "Learn",
    icon: Brain,
    description: "Education & Growth",
  },
  {
    id: "finance" as Domain,
    name: "Finance",
    icon: DollarSign,
    description: "Money & Wealth",
  },
  {
    id: "health" as Domain,
    name: "Health",
    icon: Heart,
    description: "Mind & Wellness",
  },
];

export function DomainSidebar({ currentDomain, onDomainChange }: DomainSidebarProps) {
  return (
    <aside className="w-20 lg:w-72 glass-panel flex-shrink-0 p-4 flex flex-col gap-3">
      {domains.map((domain) => {
        const isActive = currentDomain === domain.id;
        const Icon = domain.icon;
        
        return (
          <button
            key={domain.id}
            onClick={() => onDomainChange(domain.id)}
            className={cn(
              "relative group rounded-xl p-4 transition-all duration-300 hover:scale-105",
              "flex flex-col lg:flex-row items-center lg:items-start gap-3",
              isActive && "glass-panel"
            )}
          >
            {/* Glow effect when active */}
            {isActive && (
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-20 blur-xl animate-glow",
                domain.id === "learn" && "gradient-learn",
                domain.id === "finance" && "gradient-finance",
                domain.id === "health" && "gradient-health"
              )} />
            )}
            
            {/* Icon with gradient background */}
            <div className={cn(
              "relative z-10 w-12 h-12 rounded-lg flex items-center justify-center transition-all",
              domain.id === "learn" && isActive && "gradient-learn",
              domain.id === "finance" && isActive && "gradient-finance",
              domain.id === "health" && isActive && "gradient-health",
              !isActive && "bg-white/5"
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            {/* Text - hidden on mobile */}
            <div className="hidden lg:flex flex-col items-start text-left flex-1 relative z-10">
              <span className={cn(
                "font-medium text-base transition-all",
                isActive && domain.id === "learn" && "text-gradient-learn",
                isActive && domain.id === "finance" && "text-gradient-finance",
                isActive && domain.id === "health" && "text-gradient-health",
                !isActive && "text-foreground/70"
              )}>
                {domain.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {domain.description}
              </span>
            </div>
            
            {/* Active indicator */}
            {isActive && (
              <div className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full",
                domain.id === "learn" && "gradient-learn",
                domain.id === "finance" && "gradient-finance",
                domain.id === "health" && "gradient-health"
              )} />
            )}
          </button>
        );
      })}
    </aside>
  );
}
