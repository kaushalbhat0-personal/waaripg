export type TourId = "dashboard" | "residents" | "payments" | "gate-logs" | "rooms";

export type TourStep = {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  spotlight?: boolean;
};

export interface TourDefinition {
  id: TourId;
  title: string;
  steps: TourStep[];
}

export interface TourProgress {
  completed_tours: TourId[];
  dismissed_tours: TourId[];
  current_tour: TourId | null;
  current_step_index: number;
  is_active: boolean;
}
