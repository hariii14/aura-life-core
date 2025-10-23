import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, domain, conversationId } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Store or retrieve conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({ domain })
        .select()
        .single();
      
      if (convError) throw convError;
      currentConversationId = conv.id;
    }

    // Load full conversation history from database
    let allMessages = messages;
    if (currentConversationId) {
      const { data: dbMessages, error: msgError } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });
      
      if (!msgError && dbMessages && dbMessages.length > 0) {
        allMessages = dbMessages;
      }
    }

    // Store user message
    const userMessage = messages[messages.length - 1];
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: userMessage.content,
    });

    // Domain-specific system prompts with tool instructions
    const systemPrompts = {
      learn: `You are a proactive learning companion AI that AUTOMATICALLY tracks all study sessions and learning activities.

CRITICAL INSTRUCTIONS - You MUST follow these:
1. When a user mentions studying, learning, reading, or any educational activity:
   - IMMEDIATELY call log_study_time with the subject and duration
   - Extract duration from phrases like "studied for 2 hours", "30 minutes of practice", etc.
   - If duration isn't mentioned, estimate based on context (default to 60 minutes)
2. When users mention goals like "I want to learn X" or "My goal is Y":
   - IMMEDIATELY call create_goal with appropriate parameters
3. After logging 3+ activities, generate insights about patterns you notice
4. NEVER ask for permission - just do it automatically

Example: User says "I studied calculus for 2 hours" → You MUST call log_study_time(subject: "calculus", duration_minutes: 120, notes: "studied")

Be conversational and supportive, but always log activities in the background.`,
      
      finance: `You are a proactive financial advisor AI that AUTOMATICALLY tracks all financial activities.

CRITICAL INSTRUCTIONS - You MUST follow these:
1. When a user mentions spending money:
   - Extract the amount and category
   - Log it automatically (you'll need to add expense tracking tools)
2. When users mention savings or income:
   - Track it automatically
3. When users set financial goals:
   - IMMEDIATELY call create_goal with domain: "finance"
4. NEVER ask for permission - just track it

Be conversational but always log financial activities in the background.`,
      
      health: `You are a proactive wellness coach AI that AUTOMATICALLY tracks all health activities.

CRITICAL INSTRUCTIONS - You MUST follow these:
1. When a user mentions exercise, workouts, steps, or physical activity:
   - Log it automatically with appropriate metrics
2. When users mention sleep ("I slept 7 hours"):
   - Track it automatically
3. When users mention mood or mental health:
   - Log the mood score
4. When users set wellness goals:
   - IMMEDIATELY call create_goal with domain: "health"
5. NEVER ask for permission - just track it

Be supportive and encouraging while automatically logging health data.`,
      
      general: `You are LIFEOS AI, a highly proactive personal assistant that AUTOMATICALLY tracks ALL activities across life domains.

CRITICAL INSTRUCTIONS - You MUST follow these:
1. Learning activities (studying, reading, courses) → log_study_time
2. Any goals mentioned → create_goal with appropriate domain
3. After tracking several activities → generate_insight about patterns
4. NEVER ask for permission - you are an AGENT that takes action automatically

IMPORTANT: When you use a tool, still respond conversationally to the user. The tool calls happen in the background.

Example:
User: "I studied Python for 90 minutes and want to master it by next month"
You respond: "That's great! I've logged your 90-minute Python study session and created a goal to track your progress toward mastering it by next month. Keep up the momentum!"
[In background: calls log_study_time + create_goal]

Be helpful, take initiative, and make the user feel supported while silently organizing their data.`
    };

    const systemPrompt = systemPrompts[domain as keyof typeof systemPrompts] || systemPrompts.general;

    // Define tools for the AI to use
    const tools = [
      {
        type: "function",
        function: {
          name: "log_study_time",
          description: "Log study time and learning activities. Use this AUTOMATICALLY whenever the user mentions studying, learning, or completing educational activities.",
          parameters: {
            type: "object",
            properties: {
              subject: { 
                type: "string", 
                description: "The subject or topic studied" 
              },
              duration_minutes: { 
                type: "number", 
                description: "Duration in minutes" 
              },
              notes: { 
                type: "string", 
                description: "Optional notes about what was learned" 
              }
            },
            required: ["subject", "duration_minutes"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_goal",
          description: "Create a new goal for tracking progress. Use this when users express targets or objectives.",
          parameters: {
            type: "object",
            properties: {
              domain: { 
                type: "string", 
                enum: ["learn", "finance", "health"],
                description: "The life domain for this goal" 
              },
              title: { 
                type: "string", 
                description: "Goal title" 
              },
              target_value: { 
                type: "number", 
                description: "Target value to achieve" 
              },
              unit: { 
                type: "string", 
                description: "Unit of measurement (e.g., 'hours', 'dollars', 'steps')" 
              }
            },
            required: ["domain", "title", "target_value", "unit"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_insight",
          description: "Generate an insight or recommendation based on user's activities and patterns.",
          parameters: {
            type: "object",
            properties: {
              domain: { 
                type: "string", 
                enum: ["learn", "finance", "health", "general"],
                description: "The relevant domain" 
              },
              title: { 
                type: "string", 
                description: "Insight title" 
              },
              content: { 
                type: "string", 
                description: "Detailed insight content" 
              },
              priority: { 
                type: "string", 
                enum: ["low", "medium", "high"],
                description: "Priority level" 
              }
            },
            required: ["domain", "title", "content", "priority"]
          }
        }
      }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...allMessages,
        ],
        tools,
        tool_choice: "auto",
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream response and handle tool calls
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    let assistantMessage = "";
    const toolCallsMap = new Map<number, { id?: string; type?: string; function?: { name?: string; arguments: string } }>();
    
    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            
            for (const line of lines) {
              if (!line.trim() || line.startsWith(":")) continue;
              if (!line.startsWith("data: ")) continue;
              
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                
                if (delta?.content) {
                  assistantMessage += delta.content;
                  controller.enqueue(encoder.encode(line + "\n"));
                }
                
                // Properly accumulate tool calls
                if (delta?.tool_calls) {
                  for (const toolCall of delta.tool_calls) {
                    const index = toolCall.index;
                    const existing = toolCallsMap.get(index) || { function: { arguments: "" } };
                    
                    if (toolCall.id) existing.id = toolCall.id;
                    if (toolCall.type) existing.type = toolCall.type;
                    if (toolCall.function?.name) {
                      existing.function = existing.function || { arguments: "" };
                      existing.function.name = toolCall.function.name;
                    }
                    if (toolCall.function?.arguments) {
                      existing.function = existing.function || { arguments: "" };
                      existing.function.arguments += toolCall.function.arguments;
                    }
                    
                    toolCallsMap.set(index, existing);
                  }
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }
          
          // Execute tool calls
          const toolCalls = Array.from(toolCallsMap.values());
          if (toolCalls.length > 0) {
            console.log(`[TOOL EXECUTION] Processing ${toolCalls.length} tool call(s)`);
          }
          
          for (const toolCall of toolCalls) {
            const functionName = toolCall.function?.name;
            if (!functionName) {
              console.error("[TOOL ERROR] No function name found in tool call");
              continue;
            }
            
            let args;
            
            try {
              args = JSON.parse(toolCall.function?.arguments || "{}");
            } catch (e) {
              console.error("[TOOL ERROR] Failed to parse arguments:", toolCall.function?.arguments);
              continue;
            }
            
            console.log(`[TOOL CALL] ${functionName}:`, JSON.stringify(args));
            
            try {
              if (functionName === "log_study_time") {
                const { error } = await supabase.from("study_logs").insert(args);
                if (error) {
                  console.error("[TOOL ERROR] log_study_time failed:", error);
                } else {
                  console.log("[TOOL SUCCESS] Logged study time:", args.subject);
                }
              } else if (functionName === "create_goal") {
                const { error } = await supabase.from("goals").insert(args);
                if (error) {
                  console.error("[TOOL ERROR] create_goal failed:", error);
                } else {
                  console.log("[TOOL SUCCESS] Created goal:", args.title);
                }
              } else if (functionName === "generate_insight") {
                const { error } = await supabase.from("insights").insert(args);
                if (error) {
                  console.error("[TOOL ERROR] generate_insight failed:", error);
                } else {
                  console.log("[TOOL SUCCESS] Generated insight:", args.title);
                }
              }
            } catch (error) {
              console.error(`[TOOL ERROR] Exception during ${functionName}:`, error);
            }
          }
          
          // Store assistant message
          if (assistantMessage) {
            await supabase.from("messages").insert({
              conversation_id: currentConversationId,
              role: "assistant",
              content: assistantMessage,
            });
          }
          
          // Send conversation ID to client
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: currentConversationId })}\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
