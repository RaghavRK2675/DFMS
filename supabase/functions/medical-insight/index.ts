// Edge function: produces an explainable AI summary of an animal's medical history.
// Uses Lovable AI gateway (Gemini). No external secrets needed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { animalId } = await req.json();
    if (!animalId || typeof animalId !== "string") {
      return new Response(JSON.stringify({ error: "animalId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, supabaseKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: animal }, { data: events }, { data: treatments }, { data: vaccinations }, { data: mortality }] =
      await Promise.all([
        sb.from("animals").select("*").eq("id", animalId).maybeSingle(),
        sb.from("medical_events").select("*").eq("animal_id", animalId).order("occurred_at", { ascending: false }).limit(30),
        sb.from("treatments").select("*").eq("animal_id", animalId).order("started_at", { ascending: false }),
        sb.from("vaccinations").select("*").eq("animal_id", animalId).order("administered_at", { ascending: false }),
        sb.from("mortality_records").select("*").eq("animal_id", animalId),
      ]);

    if (!animal) {
      return new Response(JSON.stringify({ error: "Animal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const context = {
      animal: {
        tag: animal.tag,
        species: animal.species,
        breed: animal.breed,
        pen: animal.pen,
        sex: animal.sex,
        date_of_birth: animal.date_of_birth,
        current_weight_kg: animal.current_weight_kg,
        body_temp: animal.body_temp,
        skin_color_index: animal.skin_color_index,
        activity_score: animal.activity_score,
        health_status: animal.health_status,
        is_isolated: animal.is_isolated,
        status: animal.status,
      },
      vaccinations: vaccinations ?? [],
      treatments: treatments ?? [],
      events: events ?? [],
      mortality: mortality ?? [],
    };

    const systemPrompt = `You are an expert veterinary AI assistant for a livestock farm management platform. Analyze the provided animal medical data and produce a JSON object with these exact fields:
- summary: 2-3 sentence overall health summary
- risk_level: "low" | "medium" | "high" | "critical"
- risk_score: 0-100 integer
- key_findings: array of 3-5 short bullet points (strings) describing the most important observations
- reasoning: array of objects with {factor, impact} explaining WHY this risk level was assigned (XAI). Each factor must reference real data from the input.
- recommendations: array of 3-5 prioritized action items (strings)
- urgency_hours: integer estimate of how soon a vet should review (0 = now, 24 = within a day, 168 = weekly, 720 = routine)

Respond ONLY with valid JSON. No markdown, no commentary.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Animal data:\n${JSON.stringify(context, null, 2)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let insight: any;
    try {
      insight = JSON.parse(content);
    } catch {
      insight = { summary: content, risk_level: "medium", risk_score: 50, key_findings: [], reasoning: [], recommendations: [], urgency_hours: 24 };
    }

    return new Response(JSON.stringify({ insight, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("medical-insight error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
