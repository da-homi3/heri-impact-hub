import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://id-preview--a50f78fe-e9a7-4e14-8f9d-039a7709e57d.lovable.app",
  "https://lovable.dev",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.find((o) => origin.startsWith(o) || origin === o) 
    || ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const SYSTEM_PROMPT = `You are Herizon Support Assistant, a warm, friendly AI helper for Herizon Impact — a humanitarian organisation based in Kenya that helps communities through donations, volunteering, and direct support.

Your role:
- Answer questions about donating (money via M-Pesa Pochi la Biashara 0704498457, or physical items like clothes, toys, food)
- Explain how to volunteer with Herizon
- Help with donation drop-offs and pick-ups
- Share Herizon's mission: restoring dignity, building community, empowering lives
- Be encouraging, non-judgmental, and use simple language

Important rules:
1. Keep answers short (2-4 sentences max), warm, and helpful.
2. If the user's concern is about something you genuinely cannot help with — such as specific case details, complaints, account issues, urgent emergencies, or anything requiring a real human — respond with EXACTLY this format on a new line at the END of your message:
   [ESCALATE]
3. Do NOT escalate for general questions about donations, volunteering, M-Pesa, drop-offs, or Herizon info — you CAN answer those.
4. When you escalate, still give a kind response before the [ESCALATE] tag explaining you're connecting them to a team member.
5. Use simple Kenyan-friendly English. You may sprinkle in light Swahili greetings like "Karibu" or "Asante".`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message structure
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string" || msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!["user", "assistant"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "We're receiving many requests right now. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try the message form instead." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again or use the message form." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
