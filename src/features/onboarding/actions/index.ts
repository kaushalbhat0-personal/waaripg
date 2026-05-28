"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { OnboardingState, OnboardingStep, OnboardingActionResponse } from "../types";

interface OnboardingProgressRow {
  id: string;
  user_id: string;
  completed_steps: string[];
  current_step: string;
  is_completed: boolean;
  property_name: string | null;
  property_type: string | null;
  total_rooms: number | null;
}

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "create_property",
  "add_rooms",
  "setup_curfew",
  "invite_staff",
  "complete",
];

function toState(row: OnboardingProgressRow): OnboardingState {
  return {
    completed_steps: (row.completed_steps ?? []) as OnboardingStep[],
    current_step: (row.current_step ?? "welcome") as OnboardingStep,
    is_completed: row.is_completed ?? false,
    property_name: row.property_name ?? undefined,
    property_type: (row.property_type as OnboardingState["property_type"]) ?? undefined,
    total_rooms: row.total_rooms ?? undefined,
  };
}

export async function getOnboardingState(): Promise<OnboardingState | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      return toState(data as OnboardingProgressRow);
    }

    return null;
  } catch (err) {
    logger.error("Failed to get onboarding state", err instanceof Error ? err : undefined);
    return null;
  }
}

export async function saveOnboardingState(
  state: Partial<OnboardingState> & { completed_steps: OnboardingStep[] },
): Promise<OnboardingActionResponse> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: existing } = await supabase
      .from("onboarding_progress")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const payload: Record<string, unknown> = {
      user_id: user.id,
      completed_steps: state.completed_steps,
      current_step: state.current_step ?? "welcome",
      is_completed: state.is_completed ?? false,
      property_name: state.property_name ?? null,
      property_type: state.property_type ?? null,
      total_rooms: state.total_rooms ?? null,
    };

    if (existing) {
      const { error } = await supabase
        .from("onboarding_progress")
        .update(payload as never)
        .eq("user_id", user.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("onboarding_progress")
        .insert(payload as never);

      if (error) return { success: false, error: error.message };
    }

    return {
      success: true,
      state: {
        completed_steps: state.completed_steps,
        current_step: state.current_step ?? "welcome",
        is_completed: state.is_completed ?? false,
        property_name: state.property_name,
        property_type: state.property_type,
        total_rooms: state.total_rooms,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save onboarding state";
    logger.error("Failed to save onboarding state", err instanceof Error ? err : undefined);
    return { success: false, error: message };
  }
}

export async function completeOnboardingStep(step: OnboardingStep): Promise<OnboardingActionResponse> {
  const currentState = await getOnboardingState();
  const completedSteps = currentState?.completed_steps ?? [];

  if (completedSteps.includes(step)) {
    return { success: true, state: currentState ?? undefined };
  }

  const newCompletedSteps = [...completedSteps, step];
  const currentIndex = STEP_ORDER.indexOf(step);
  const nextStep = STEP_ORDER[currentIndex + 1] ?? "complete";

  return saveOnboardingState({
    completed_steps: newCompletedSteps,
    current_step: nextStep,
    is_completed: nextStep === "complete",
    property_name: currentState?.property_name,
    property_type: currentState?.property_type,
    total_rooms: currentState?.total_rooms,
  });
}

export async function skipOnboarding(): Promise<OnboardingActionResponse> {
  return saveOnboardingState({
    completed_steps: [...STEP_ORDER],
    current_step: "complete",
    is_completed: true,
  });
}

export async function updateOnboardingProperty(
  data: { name: string; type: "pg" | "hostel"; total_rooms: number },
): Promise<OnboardingActionResponse> {
  const currentState = await getOnboardingState();

  return saveOnboardingState({
    completed_steps: currentState?.completed_steps ?? [],
    current_step: currentState?.current_step ?? "create_property",
    is_completed: currentState?.is_completed ?? false,
    property_name: data.name,
    property_type: data.type,
    total_rooms: data.total_rooms,
  });
}
