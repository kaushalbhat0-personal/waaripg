"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { AnalyticsSummary } from "../types";

export async function flushAnalyticsToServer(events: unknown[]) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || events.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("analytics_events")
      .insert(events.map((e) => ({ ...(e as Record<string, unknown>), user_id: user.id })));

    if (error) {
      logger.error("Failed to flush analytics", error);
    }
  } catch (err) {
    logger.error("Failed to flush analytics", err instanceof Error ? err : undefined);
  }
}

export async function getServerAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("analytics_events")
      .select("*")
      .eq("user_id", user.id);

    if (!data) return null;

    const features = new Set<string>();
    let onboardingCompleted = false;
    let toursCompleted = 0;
    let feedbackCount = 0;
    let errorCount = 0;

    for (const e of data) {
      if (e.feature) features.add(e.feature);
      if (e.name === "onboarding_step" && e.properties?.step === "complete") onboardingCompleted = true;
      if (e.name === "tour_completed") toursCompleted++;
      if (e.name === "feedback_submitted") feedbackCount++;
      if (e.name === "error_encountered") errorCount++;
    }

    return {
      total_events: data.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unique_pages: new Set(data.map((e: any) => e.page_url).filter(Boolean)).size,
      features_used: Array.from(features),
      onboarding_completed: onboardingCompleted,
      tours_completed: toursCompleted,
      feedback_count: feedbackCount,
      error_count: errorCount,
    };
  } catch (err) {
    logger.error("Failed to get analytics summary", err instanceof Error ? err : undefined);
    return null;
  }
}
