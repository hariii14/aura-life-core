import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";

type Domain = "learn" | "finance" | "health";

interface Stat {
  label: string;
  value: string | number;
}

interface DashboardCardProps {
  domain: Domain;
  icon: LucideIcon;
  title: string;
  stats: Stat[];
  chartData: any;
  chartType: "line" | "bar" | "radial";
}

export function DashboardCard({
  domain,
  icon: Icon,
  title,
  stats,
  chartData,
  chartType,
}: DashboardCardProps) {
  const domainStyles = {
    learn: "gradient-learn",
    finance: "gradient-finance",
    health: "gradient-health",
  };

  const domainGradients = {
    learn: "from-learn-from to-learn-to",
    finance: "from-finance-from to-finance-to",
    health: "from-health-from to-health-to",
  };

  const renderChart = () => {
    if (chartType === "line" && Array.isArray(chartData)) {
      const data = chartData.map((value, index) => ({
        day: index + 1,
        value,
      }));
      return (
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "bar" && Array.isArray(chartData)) {
      return (
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" hide />
            <Bar dataKey="saving" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spending" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "radial" && typeof chartData === "number") {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <Progress value={chartData} className="h-32 w-32" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-semibold">{chartData}%</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card
      className={cn(
        "glass-panel group hover:scale-[1.02] transition-all duration-500 cursor-pointer relative overflow-hidden animate-fade-in",
        "hover:shadow-2xl hover:shadow-primary/20"
      )}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          domainStyles[domain]
        )}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
              domainStyles[domain]
            )}
          >
            <Icon className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r transition-all duration-300",
              domainGradients[domain],
              "text-white group-hover:px-4 group-hover:shadow-lg"
            )}
          >
            {domain.toUpperCase()}
          </div>
        </div>
        <CardTitle className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center transition-all duration-300 group-hover:translate-y-[-2px]"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart Visualization */}
        <div className="pt-4 border-t border-white/10 transition-colors duration-300 group-hover:border-white/20">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}
