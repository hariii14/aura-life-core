import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  learn: {
    total_study_hours: number;
    topics_covered: number;
    active_goals: number;
  };
  finance: {
    weekly_savings: number;
    expense_trend: number;
    total_saved: number;
  };
  health: {
    mood_score: number;
    steps_today: number;
    sleep_hours: number;
  };
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    learn: { total_study_hours: 0, topics_covered: 0, active_goals: 0 },
    finance: { weekly_savings: 0, expense_trend: 0, total_saved: 0 },
    health: { mood_score: 0, steps_today: 0, sleep_hours: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_stats",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("dashboard_stats")
        .select("*");

      if (error) throw error;

      if (data) {
        const newStats: any = {
          learn: { total_study_hours: 0, topics_covered: 0, active_goals: 0 },
          finance: { weekly_savings: 0, expense_trend: 0, total_saved: 0 },
          health: { mood_score: 0, steps_today: 0, sleep_hours: 0 },
        };

        data.forEach((row) => {
          newStats[row.domain] = row.stats;
        });

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}
