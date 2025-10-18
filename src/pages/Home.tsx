import { DashboardCard } from "@/components/DashboardCard";
import { ConversationHistory } from "@/components/ConversationHistory";
import { AISuggestions } from "@/components/AISuggestions";
import { TopNav } from "@/components/TopNav";
import { Brain, Wallet, Heart } from "lucide-react";

const Home = () => {
  const dashboardData = {
    learn: {
      hoursStudied: 24.5,
      topicsCovered: 12,
      skillGrowth: 34,
      weeklyTrend: [65, 72, 68, 80, 85, 88, 92],
    },
    finance: {
      weeklySavings: 850,
      expenseTrend: -12,
      totalSaved: 12400,
      spendingData: [
        { name: "Mon", spending: 45, saving: 120 },
        { name: "Tue", spending: 60, saving: 100 },
        { name: "Wed", spending: 35, saving: 140 },
        { name: "Thu", spending: 80, saving: 90 },
        { name: "Fri", spending: 55, saving: 130 },
        { name: "Sat", spending: 90, saving: 80 },
        { name: "Sun", spending: 40, saving: 150 },
      ],
    },
    health: {
      moodScore: 8.2,
      steps: 8547,
      sleepHours: 7.5,
      weeklyActivity: 85,
    },
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Subtle animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-background to-purple-900/10 opacity-50" />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl opacity-30 animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl opacity-30 animate-glow" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNav />
        
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
          {/* Header Section */}
          <header className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
              LIFEOS AI
            </h1>
            <div className="relative inline-block">
              <p className="text-2xl md:text-3xl font-light italic text-muted-foreground">
                Summarise, life.
              </p>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-glow" />
            </div>
          </header>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-7xl mx-auto">
            <DashboardCard
              domain="learn"
              icon={Brain}
              title="Learning Progress"
              stats={[
                { label: "Hours Studied", value: `${dashboardData.learn.hoursStudied}h` },
                { label: "Topics Covered", value: dashboardData.learn.topicsCovered },
                { label: "Skill Growth", value: `+${dashboardData.learn.skillGrowth}%` },
              ]}
              chartData={dashboardData.learn.weeklyTrend}
              chartType="line"
            />
            
            <DashboardCard
              domain="finance"
              icon={Wallet}
              title="Financial Health"
              stats={[
                { label: "Weekly Savings", value: `$${dashboardData.finance.weeklySavings}` },
                { label: "Expense Trend", value: `${dashboardData.finance.expenseTrend}%` },
                { label: "Total Saved", value: `$${dashboardData.finance.totalSaved.toLocaleString()}` },
              ]}
              chartData={dashboardData.finance.spendingData}
              chartType="bar"
            />
            
            <DashboardCard
              domain="health"
              icon={Heart}
              title="Wellness Overview"
              stats={[
                { label: "Mood Score", value: `${dashboardData.health.moodScore}/10` },
                { label: "Steps Today", value: dashboardData.health.steps.toLocaleString() },
                { label: "Sleep", value: `${dashboardData.health.sleepHours}h` },
              ]}
              chartData={dashboardData.health.weeklyActivity}
              chartType="radial"
            />
          </div>

          {/* Conversation History & AI Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto mb-8">
            <ConversationHistory />
            <AISuggestions />
          </div>

          {/* Footer */}
          <footer className="text-center py-8">
            <p className="text-lg font-light relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-glow">
                Your LifeOS. Your AI. Your Growth.
              </span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Home;
