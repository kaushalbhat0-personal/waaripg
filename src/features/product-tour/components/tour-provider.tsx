"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveTourProgress } from "../actions";
import type { TourId, TourStep, TourDefinition, TourProgress } from "../types";
import { trackEvent } from "@/lib/tracking";

const TOURS: TourDefinition[] = [
  {
    id: "dashboard",
    title: "Dashboard Overview",
    steps: [
      {
        id: "dashboard-welcome",
        title: "Operations Dashboard",
        description: "This is your command center. Monitor occupancy, recent payments, violations, and gate activity.",
        targetSelector: "[data-tour-dashboard]",
        placement: "center",
        spotlight: true,
      },
      {
        id: "dashboard-metrics",
        title: "Key Metrics",
        description: "View real-time metrics: total residents, occupancy rate, pending payments, and active violations.",
        targetSelector: "[data-tour-metrics]",
        placement: "bottom",
      },
      {
        id: "dashboard-quick-actions",
        title: "Quick Actions",
        description: "Use the floating button to quickly add residents, record payments, or log gate entries.",
        targetSelector: "[data-tour-quick-actions]",
        placement: "left",
      },
    ],
  },
  {
    id: "residents",
    title: "Resident Management",
    steps: [
      {
        id: "residents-list",
        title: "Resident List",
        description: "View all residents, search by name or room, filter by status or property.",
        targetSelector: "[data-tour-residents]",
        placement: "center",
        spotlight: true,
      },
      {
        id: "residents-add",
        title: "Add Resident",
        description: "Click here to add a new resident. Enter personal details, documents, and assign a room.",
        targetSelector: "[data-tour-add-resident]",
        placement: "bottom",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Invoicing",
    steps: [
      {
        id: "payments-overview",
        title: "Payments Dashboard",
        description: "Track all payments, pending invoices, and generate reports.",
        targetSelector: "[data-tour-payments]",
        placement: "center",
        spotlight: true,
      },
      {
        id: "payments-create",
        title: "Create Invoice",
        description: "Generate invoices for residents. Set amounts, due dates, and line items.",
        targetSelector: "[data-tour-create-invoice]",
        placement: "bottom",
      },
    ],
  },
  {
    id: "gate-logs",
    title: "Gate Logs & Attendance",
    steps: [
      {
        id: "gate-logs-overview",
        title: "Gate Logs",
        description: "View entry and exit logs. Late entries are flagged. Verify or override entries as needed.",
        targetSelector: "[data-tour-gate-logs]",
        placement: "center",
        spotlight: true,
      },
      {
        id: "gate-logs-attendance",
        title: "Attendance Timeline",
        description: "Daily attendance is auto-generated from gate logs. View presence, lateness, and absences.",
        targetSelector: "[data-tour-attendance]",
        placement: "top",
      },
    ],
  },
  {
    id: "rooms",
    title: "Room Management",
    steps: [
      {
        id: "rooms-overview",
        title: "Rooms & Allocation",
        description: "Manage rooms, beds, and resident allocations. View occupancy per room and transfer residents.",
        targetSelector: "[data-tour-rooms]",
        placement: "center",
        spotlight: true,
      },
    ],
  },
];

type TourContextType = {
  startTour: (tourId: TourId) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  isActive: boolean;
  currentTour: TourDefinition | null;
  currentStep: TourStep | null;
  stepIndex: number;
  totalSteps: number;
  availableTours: TourDefinition[];
};

const TourContext = createContext<TourContextType | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<TourProgress>({
    completed_tours: [],
    dismissed_tours: [],
    current_tour: null,
    current_step_index: 0,
    is_active: false,
  });

  const currentTour = progress.current_tour
    ? TOURS.find((t) => t.id === progress.current_tour) ?? null
    : null;

  const currentStep = currentTour?.steps[progress.current_step_index] ?? null;

  const startTour = useCallback((tourId: TourId) => {
    setProgress((p) => ({
      ...p,
      current_tour: tourId,
      current_step_index: 0,
      is_active: true,
    }));
    trackEvent("tour_started", { tour_id: tourId });
  }, []);

  const endTour = useCallback(() => {
    if (progress.current_tour) {
      saveTourProgress(progress.current_tour, true, false);
      trackEvent("tour_completed", { tour_id: progress.current_tour });
    }
    setProgress((p) => ({
      ...p,
      current_tour: null,
      current_step_index: 0,
      is_active: false,
    }));
  }, [progress.current_tour]);

  const nextStep = useCallback(() => {
    if (!currentTour) return;
    if (progress.current_step_index < currentTour.steps.length - 1) {
      setProgress((p) => ({ ...p, current_step_index: p.current_step_index + 1 }));
    } else {
      endTour();
    }
  }, [currentTour, progress.current_step_index, endTour]);

  const prevStep = useCallback(() => {
    if (progress.current_step_index > 0) {
      setProgress((p) => ({ ...p, current_step_index: p.current_step_index - 1 }));
    }
  }, [progress.current_step_index]);

  const value: TourContextType = {
    startTour,
    endTour,
    nextStep,
    prevStep,
    isActive: progress.is_active,
    currentTour,
    currentStep,
    stepIndex: progress.current_step_index,
    totalSteps: currentTour?.steps.length ?? 0,
    availableTours: TOURS,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay
        open={progress.is_active}
        currentStep={currentStep}
        stepIndex={progress.current_step_index}
        totalSteps={currentTour?.steps.length ?? 0}
        onNext={nextStep}
        onPrev={prevStep}
        onClose={endTour}
        tourTitle={currentTour?.title ?? ""}
      />
    </TourContext.Provider>
  );
}

type TourOverlayProps = {
  open: boolean;
  currentStep: TourStep | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  tourTitle: string;
};

function TourOverlay({
  open,
  currentStep,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  tourTitle,
}: TourOverlayProps) {
  return (
    <AnimatePresence>
      {open && currentStep && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/40"
            onClick={onClose}
          />

          {/* Tooltip card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4"
          >
            <Card className="p-4 shadow-xl border-primary/20">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === stepIndex
                        ? "w-6 bg-primary"
                        : i < stepIndex
                          ? "w-3 bg-primary/40"
                          : "w-3 bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium truncate">{currentStep.title}</h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {tourTitle}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <button
                  onClick={onClose}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5 inline mr-1" />
                  Dismiss
                </button>
                <div className="flex items-center gap-1.5">
                  {stepIndex > 0 && (
                    <Button variant="ghost" size="sm" onClick={onPrev} className="h-7 text-xs px-2">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" onClick={onNext} className="h-7 text-xs px-3">
                    {stepIndex < totalSteps - 1 ? (
                      <>
                        Next
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </>
                    ) : (
                      "Finish"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for auto-suggesting tours
export function useSuggestedTour() {
  const { availableTours, startTour } = useTour();
  const suggestTour = useCallback(
    (pageFeature: string) => {
      const tour = availableTours.find((t) => t.id === pageFeature);
      if (tour) startTour(tour.id);
    },
    [availableTours, startTour],
  );
  return { suggestTour };
}
