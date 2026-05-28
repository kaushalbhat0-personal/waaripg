"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, RotateCcw, Play, Eye, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/tracking";

const DEMO_STEPS = [
  {
    id: "welcome",
    title: "Welcome to the Demo",
    description: "This guided tour will show you how WaaRi PG works. You'll see real resident data, payments, gate logs, and more.",
    placement: "center" as const,
  },
  {
    id: "dashboard",
    title: "Operations Dashboard",
    description: "Your command center. View occupancy rates, recent payments, active violations, and gate activity at a glance.",
    targetSelector: "[data-demo-dashboard]",
    placement: "center" as const,
  },
  {
    id: "residents",
    title: "Resident Management",
    description: "Add, edit, and manage residents. Each resident has contact info, documents, payment history, and allocation details.",
    targetSelector: "[data-demo-residents]",
    placement: "center" as const,
  },
  {
    id: "payments",
    title: "Payments & Invoicing",
    description: "Generate invoices automatically, record payments, track dues. Supports cash, UPI, card, and bank transfers.",
    targetSelector: "[data-demo-payments]",
    placement: "center" as const,
  },
  {
    id: "gate-logs",
    title: "Gate Logs & Attendance",
    description: "Track resident entry and exit. Late entries are flagged, violations are logged, and daily attendance is auto-generated.",
    targetSelector: "[data-demo-gate-logs]",
    placement: "center" as const,
  },
  {
    id: "done",
    title: "You're Ready!",
    description: "You've seen the key features. Explore freely, or reset the demo data to start fresh. Visit the Help Center for detailed guides.",
    placement: "center" as const,
  },
];

type DemoWalkthroughProps = {
  open: boolean;
  onClose: () => void;
};

export function DemoWalkthrough({ open, onClose }: DemoWalkthroughProps) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);

  const handleClose = useCallback(() => {
    setStarted(false);
    setStep(0);
    onClose();
  }, [onClose]);

  const handleStart = useCallback(() => {
    setStarted(true);
    setStep(0);
    trackEvent("demo_started");
  }, []);

  const handleNext = useCallback(() => {
    if (step < DEMO_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  }, [step, handleClose]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const currentStep = DEMO_STEPS[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          {!started ? (
            <Card className="w-full max-w-md mx-4 p-6 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <Monitor className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Product Demo</h2>
                  <p className="text-sm text-muted-foreground">Interactive walkthrough</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Take a guided tour of WaaRi PG. You&apos;ll see how to manage residents, track payments,
                monitor gate logs, and run your hostel operations efficiently.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span>{DEMO_STEPS.length} steps &middot; ~2 minutes</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleStart}>
                  <Play className="h-4 w-4 mr-1" />
                  Start Tour
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="w-full max-w-md mx-4 p-6 shadow-2xl">
              {/* Progress */}
              <div className="flex items-center gap-2 mb-6">
                {DEMO_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{currentStep?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStep?.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Step {step + 1} of {DEMO_STEPS.length}
                </div>
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button variant="ghost" size="sm" onClick={handlePrev}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext}>
                    {step < DEMO_STEPS.length - 1 ? (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      "Done"
                    )}
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <button
                onClick={handleClose}
                className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip demo
              </button>
            </Card>
          )}

          {/* Demo reset button */}
          <button
            onClick={() => {
              trackEvent("demo_reset");
              window.location.reload();
            }}
            className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-muted/80 backdrop-blur px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors shadow-lg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
