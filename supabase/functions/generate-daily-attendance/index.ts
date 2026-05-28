// Supabase Edge Function: Generate Daily Attendance Snapshots
// Runs via cron trigger at 11:50 PM daily (timezone-aware)
// Retry-safe: upsert behavior prevents duplicates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  date: z.string().optional(),
  organization_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Parse and validate input
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const targetDate = parsed.data.date ?? new Date().toISOString().split("T")[0] ?? "";
    const orgId = parsed.data.organization_id ?? null;

    console.log(`Generating attendance for ${targetDate}${orgId ? ` org: ${orgId}` : ""}`);

    // Call the database function
    const { error } = await supabase.rpc("generate_daily_attendance", {
      p_date: targetDate,
      p_org_id: orgId,
    });

    if (error) {
      console.error("Attendance generation failed:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Log success to attendance_journal
    const { error: journalError } = await supabase.from("attendance_journal").insert({
      snapshot_date: targetDate,
      organization_id: orgId,
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    if (journalError) {
      console.warn("Failed to log attendance journal:", journalError);
    }

    return new Response(
      JSON.stringify({ success: true, date: targetDate }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
