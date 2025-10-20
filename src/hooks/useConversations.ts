import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  domain: "learn" | "finance" | "health" | "general";
  created_at: string;
  preview?: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: convos, error } = await supabase
        .from("conversations")
        .select(`
          *,
          messages (content)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formatted = convos?.map((conv: any) => ({
        id: conv.id,
        domain: conv.domain,
        created_at: conv.created_at,
        preview: conv.messages?.[0]?.content || "No messages",
      })) || [];

      setConversations(formatted);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  return { conversations, loading };
}
