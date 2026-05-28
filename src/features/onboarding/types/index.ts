// Onboarding feature types

export type OnboardingStep =
  | "welcome"
  | "create_property"
  | "add_rooms"
  | "setup_curfew"
  | "invite_staff"
  | "complete";

export interface OnboardingState {
  completed_steps: OnboardingStep[];
  current_step: OnboardingStep;
  is_completed: boolean;
  property_name?: string;
  property_type?: "pg" | "hostel";
  total_rooms?: number;
}

export type OnboardingActionResponse = {
  success: boolean;
  error?: string;
  state?: OnboardingState;
};
