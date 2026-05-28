"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { DemoActionResponse } from "../types";

export async function startDemoWalkthrough(): Promise<DemoActionResponse> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    return {
      success: true,
      demo_state: {
        is_active: true,
        current_step: 0,
        walkthrough_completed: false,
      },
    };
  } catch (err) {
    logger.error("Failed to start demo walkthrough", err instanceof Error ? err : undefined);
    return { success: false, error: "Failed to start demo walkthrough" };
  }
}

export async function endDemoWalkthrough(): Promise<DemoActionResponse> {
  return {
    success: true,
    demo_state: {
      is_active: false,
      current_step: 0,
      walkthrough_completed: true,
    },
  };
}

export async function resetDemoData(): Promise<DemoActionResponse> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    logger.info("Demo data reset requested", { user_id: user.id });
    // In a real implementation, this would truncate and re-seed demo tables

    return { success: true };
  } catch (err) {
    logger.error("Failed to reset demo data", err instanceof Error ? err : undefined);
    return { success: false, error: "Failed to reset demo data" };
  }
}

export async function advanceDemoStep(step: number): Promise<DemoActionResponse> {
  return {
    success: true,
    demo_state: {
      is_active: true,
      current_step: step,
      walkthrough_completed: false,
    },
  };
}
