"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { TourId } from "../types";

export async function saveTourProgress(
  tourId: TourId,
  completed: boolean,
  dismissed: boolean,
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase_ = supabase as any;

    const { data: existing } = await supabase_
      .from("user_tour_progress")
      .select("id, completed_tours, dismissed_tours")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      const completedTours: string[] = existing.completed_tours ?? [];
      const dismissedTours: string[] = existing.dismissed_tours ?? [];

      if (completed && !completedTours.includes(tourId)) completedTours.push(tourId);
      if (dismissed && !dismissedTours.includes(tourId)) dismissedTours.push(tourId);

      await supabase_
        .from("user_tour_progress")
        .update({ completed_tours: completedTours, dismissed_tours: dismissedTours })
        .eq("user_id", user.id);
    } else {
      await supabase_
        .from("user_tour_progress")
        .insert({
          user_id: user.id,
          completed_tours: completed ? [tourId] : [],
          dismissed_tours: dismissed ? [tourId] : [],
        });
    }
  } catch (err) {
    logger.error("Failed to save tour progress", err instanceof Error ? err : undefined);
  }
}
