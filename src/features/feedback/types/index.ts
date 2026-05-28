export type FeedbackType = "helpful" | "not-helpful" | "issue" | "suggestion";

export type FeedbackCategory = "onboarding" | "dashboard" | "residents" | "payments" | "gate-logs" | "rooms" | "general";

export interface FeedbackSubmission {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  message: string;
  page_url: string;
  user_id?: string;
  created_at: string;
}

export type FeedbackActionResponse = {
  success: boolean;
  error?: string;
};
