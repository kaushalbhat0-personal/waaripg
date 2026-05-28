"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { FeedbackSubmission, FeedbackType, FeedbackCategory, FeedbackActionResponse } from "../types";

export async function submitFeedback(
  type: FeedbackType,
  category: FeedbackCategory,
  message: string,
): Promise<FeedbackActionResponse> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const submission: Partial<FeedbackSubmission> = {
      id: crypto.randomUUID(),
      type,
      category,
      message,
      page_url: "",
      user_id: user?.id,
      created_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("user_feedback")
      .insert(submission);

    if (error) {
      logger.error("Failed to save feedback", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit feedback";
    logger.error("Failed to submit feedback", err instanceof Error ? err : undefined);
    return { success: false, error: message };
  }
}

export async function markHelpful(
  category: FeedbackCategory,
): Promise<FeedbackActionResponse> {
  return submitFeedback("helpful", category, "");
}

export async function markNotHelpful(
  category: FeedbackCategory,
  message?: string,
): Promise<FeedbackActionResponse> {
  return submitFeedback("not-helpful", category, message ?? "");
}

export async function reportIssue(
  category: FeedbackCategory,
  message: string,
): Promise<FeedbackActionResponse> {
  return submitFeedback("issue", category, message);
}

export async function submitSuggestion(
  message: string,
): Promise<FeedbackActionResponse> {
  return submitFeedback("suggestion", "general", message);
}
