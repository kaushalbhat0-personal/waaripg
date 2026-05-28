export type AnalyticEventName =
  | "page_view"
  | "feature_used"
  | "action_completed"
  | "action_failed"
  | "onboarding_step"
  | "tour_started"
  | "tour_completed"
  | "tour_dismissed"
  | "help_searched"
  | "help_article_viewed"
  | "feedback_submitted"
  | "bulk_action"
  | "command_palette_used"
  | "demo_started"
  | "demo_reset"
  | "export_data"
  | "error_encountered"
  | "session_start";

export interface AnalyticEvent {
  name: AnalyticEventName;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
  page_url?: string;
  feature?: string;
  duration_ms?: number;
}

export interface AnalyticsSummary {
  total_events: number;
  unique_pages: number;
  features_used: string[];
  onboarding_completed: boolean;
  tours_completed: number;
  feedback_count: number;
  error_count: number;
}
