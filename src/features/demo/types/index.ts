export type DemoFeature = "residents" | "payments" | "gate-logs" | "rooms" | "violations" | "dashboard";

export type DemoWalkthroughStep = {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  feature: DemoFeature;
};

export interface DemoState {
  is_active: boolean;
  current_step: number;
  demo_organization_id?: string;
  walkthrough_completed: boolean;
}

export type DemoActionResponse = {
  success: boolean;
  error?: string;
  demo_state?: DemoState;
};
