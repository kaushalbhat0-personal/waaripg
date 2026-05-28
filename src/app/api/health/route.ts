import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getEnvOrThrow } from "@/lib/env";
import { logger } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, { status: string; message?: string; latency_ms?: number }> = {};
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  // 1. Environment validation
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
    checks.environment = { status: "ok" };
  } else {
    checks.environment = { status: "warn", message: "Using placeholder environment variables" };
    overallStatus = "degraded";
  }

  // 2. Database connectivity
  try {
    const dbStart = Date.now();
    const supabaseUrl = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseKey = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { error } = await client.from("organizations").select("count", { count: "exact", head: true });

    checks.database = {
      status: error ? "error" : "ok",
      message: error ? error.message : undefined,
      latency_ms: Date.now() - dbStart,
    };

    if (error) {
      overallStatus = "degraded";
    }
  } catch (err) {
    checks.database = {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown database error",
    };
    overallStatus = "degraded";
  }

  // 3. Supabase Auth check
  try {
    const authStart = Date.now();
    const supabaseUrl = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseKey = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { error } = await client.auth.getSession();

    checks.auth = {
      status: error ? "error" : "ok",
      message: error ? error.message : undefined,
      latency_ms: Date.now() - authStart,
    };

    if (error) {
      overallStatus = "degraded";
    }
  } catch (err) {
    checks.auth = {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown auth error",
    };
    overallStatus = "degraded";
  }

  const totalLatency = Date.now() - start;
  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  logger.info("Health check completed", {
    status: overallStatus,
    total_latency_ms: totalLatency,
  });

  return NextResponse.json(
    {
      status: overallStatus,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      latency_ms: totalLatency,
      checks,
    },
    { status: statusCode },
  );
}
