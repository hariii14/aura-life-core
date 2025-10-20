import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Insight {
  id: string;
  domain: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  created_at: string;
}

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();

    const channel = supabase
      .channel("insights-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "insights",
        },
        () => {
          fetchInsights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setInsights((data as Insight[]) || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading };
}
