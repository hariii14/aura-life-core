import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    
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

    // Store user message
    const userMessage = messages[messages.length - 1];
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: userMessage.content,
    });

    // Domain-specific system prompts with tool instructions
    const systemPrompts = {
      learn: `You are a helpful learning companion AI with the ability to automatically track study sessions and progress. 

When users mention studying or learning activities, ALWAYS use the log_study_time tool to record it automatically - don't ask for permission.
When users express goals or targets, ALWAYS use the create_goal tool to track them.
When you identify learning patterns or insights, ALWAYS use the generate_insight tool.

Be proactive and agentic - take actions to help users without asking for confirmation.`,
      
      finance: `You are a financial advisor AI that can track expenses and savings automatically.

When users mention spending or saving money, use the appropriate tools to log it.
Track financial goals and provide insights on spending patterns.
Be proactive in helping users manage their finances.`,
      
      health: `You are a wellness coach AI that tracks health metrics and activities.

When users mention exercise, sleep, mood, or other health activities, automatically log them.
Track wellness goals and provide health insights.
Encourage healthy habits proactively.`,
      
      general: `You are LIFEOS AI, a proactive personal assistant that automatically tracks activities across all life domains.

Use your tools to log activities, track goals, and generate insights without asking for permission.
Be helpful and take initiative to organize the user's life data.`
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
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
    let toolCalls: any[] = [];
    
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
                
                if (delta?.tool_calls) {
                  toolCalls.push(...delta.tool_calls);
                }
                
                controller.enqueue(encoder.encode(line + "\n"));
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }
          
          // Execute tool calls
          for (const toolCall of toolCalls) {
            const functionName = toolCall.function?.name;
            const args = JSON.parse(toolCall.function?.arguments || "{}");
            
            console.log("Executing tool:", functionName, args);
            
            if (functionName === "log_study_time") {
              await supabase.from("study_logs").insert(args);
            } else if (functionName === "create_goal") {
              await supabase.from("goals").insert(args);
            } else if (functionName === "generate_insight") {
              await supabase.from("insights").insert(args);
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
