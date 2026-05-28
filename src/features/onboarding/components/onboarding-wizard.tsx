"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, SkipForward, Building2, DoorOpen, Clock, Users, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getOnboardingState,
  completeOnboardingStep,
  skipOnboarding,
  updateOnboardingProperty,
} from "../actions";
import type { OnboardingStep, OnboardingState } from "../types";

const STEP_ICONS: Record<OnboardingStep, React.ReactNode> = {
  welcome: <PartyPopper className="h-6 w-6" />,
  create_property: <Building2 className="h-6 w-6" />,
  add_rooms: <DoorOpen className="h-6 w-6" />,
  setup_curfew: <Clock className="h-6 w-6" />,
  invite_staff: <Users className="h-6 w-6" />,
  complete: <CheckCircle className="h-6 w-6" />,
};

const STEP_TITLES: Record<OnboardingStep, string> = {
  welcome: "Welcome to WaaRi PG",
  create_property: "Create Your Property",
  add_rooms: "Add Rooms",
  setup_curfew: "Set Curfew Rules",
  invite_staff: "Invite Staff",
  complete: "You&apos;re All Set!",
};

const STEP_DESCRIPTIONS: Record<OnboardingStep, string> = {
  welcome: "Let&apos;s get your hostel or PG management system set up in just a few steps.",
  create_property: "Tell us about your first property so we can set things up.",
  add_rooms: "How many rooms does your property have?",
  setup_curfew: "Set default curfew rules for your property.",
  invite_staff: "Invite your team members to help manage the property.",
  complete: "Your property is ready to go! Here&apos;s what to do next.",
};

export function OnboardingWizard() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    propertyName: "",
    propertyType: "pg" as "pg" | "hostel",
    totalRooms: 10,
    curfewTime: "22:00",
    staffEmails: "",
  });
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    getOnboardingState().then((result) => {
      if (result) {
        setState(result);
        setFormData((prev) => ({
          ...prev,
          propertyName: result.property_name ?? "",
          propertyType: result.property_type ?? "pg",
          totalRooms: result.total_rooms ?? 10,
        }));
      } else {
        setState({
          completed_steps: [],
          current_step: "welcome",
          is_completed: false,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleNext() {
    if (!state) return;

    if (state.current_step === "create_property") {
      await updateOnboardingProperty({
        name: formData.propertyName || "My Property",
        type: formData.propertyType,
        total_rooms: formData.totalRooms,
      });
    }

    const result = await completeOnboardingStep(state.current_step);
    if (result.state) setState(result.state);
  }

  async function handleSkip() {
    const result = await skipOnboarding();
    if (result.state) setState(result.state);
  }

  async function handleComplete() {
    const result = await completeOnboardingStep("complete");
    if (result.state) setState(result.state);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!state || state.is_completed) {
    return null;
  }

  const steps: OnboardingStep[] = ["welcome", "create_property", "add_rooms", "setup_curfew", "invite_staff", "complete"];
  const currentIndex = steps.indexOf(state.current_step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 p-0 overflow-hidden shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="p-6">
          {/* Step indicators */}
          <div className="flex justify-between mb-8">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    state.completed_steps.includes(step)
                      ? "bg-primary text-primary-foreground"
                      : i === currentIndex
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {state.completed_steps.includes(step) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  {step === "welcome" ? "Start" : step === "complete" ? "Done" : step.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={state.current_step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  {STEP_ICONS[state.current_step]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{STEP_TITLES[state.current_step]}</h2>
                  <p className="text-sm text-muted-foreground">
                    {STEP_DESCRIPTIONS[state.current_step]}
                  </p>
                </div>
              </div>

              {/* Welcome */}
              {state.current_step === "welcome" && (
                <div className="space-y-4 py-4">
                  <p className="text-muted-foreground">
                    WaaRi PG helps you manage residents, track attendance, handle payments,
                    and monitor gate logs — all in one place.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Manage multiple properties from a single dashboard",
                      "Track resident entry and exit with gate logs",
                      "Automate rent invoices and payment tracking",
                      "Set curfew rules and monitor violations",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Create Property */}
              {state.current_step === "create_property" && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-name">Property Name</Label>
                    <Input
                      id="property-name"
                      placeholder="e.g., Sunrise PG"
                      value={formData.propertyName}
                      onChange={(e) => setFormData((p) => ({ ...p, propertyName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, propertyType: "pg" }))}
                        className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                          formData.propertyType === "pg"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        PG / Paying Guest
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, propertyType: "hostel" }))}
                        className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                          formData.propertyType === "hostel"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        Hostel
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-rooms">Total Rooms</Label>
                    <Input
                      id="total-rooms"
                      type="number"
                      min={1}
                      max={500}
                      value={formData.totalRooms}
                      onChange={(e) => setFormData((p) => ({ ...p, totalRooms: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
              )}

              {/* Add Rooms */}
              {state.current_step === "add_rooms" && (
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll create {formData.totalRooms} rooms for {formData.propertyName || "your property"}.
                    You can configure room types, rent amounts, and capacities later.
                  </p>
                  <div className="rounded-lg border p-4 bg-muted/30">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Property:</span>
                        <p className="font-medium">{formData.propertyName || "My Property"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{formData.propertyType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rooms:</span>
                        <p className="font-medium">{formData.totalRooms}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Floors:</span>
                        <p className="font-medium">{Math.ceil(formData.totalRooms / 5)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Setup Curfew */}
              {state.current_step === "setup_curfew" && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="curfew-time">Default Curfew Time</Label>
                    <Input
                      id="curfew-time"
                      type="time"
                      value={formData.curfewTime}
                      onChange={(e) => setFormData((p) => ({ ...p, curfewTime: e.target.value }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can set different curfew rules for individual residents later.
                  </p>
                </div>
              )}

              {/* Invite Staff */}
              {state.current_step === "invite_staff" && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-emails">Staff Email Addresses</Label>
                    <Input
                      id="staff-emails"
                      placeholder="manager@example.com, security@example.com"
                      value={formData.staffEmails}
                      onChange={(e) => setFormData((p) => ({ ...p, staffEmails: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas. You can always invite more later.
                    </p>
                  </div>
                </div>
              )}

              {/* Complete */}
              {state.current_step === "complete" && (
                <div className="space-y-4 py-4 text-center">
                  <div className="flex justify-center">
                    <PartyPopper className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Your Property is Ready!</h3>
                  <p className="text-sm text-muted-foreground">
                    Here are some things you can do next:
                  </p>
                  <ul className="text-left space-y-2">
                    {[
                      "Add residents and assign rooms",
                      "Configure payment plans and invoices",
                      "Set up gate log rules and schedules",
                      "View your dashboard for insights",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Setup
            </Button>
            <div className="flex items-center gap-2">
              {state.current_step === "complete" ? (
                <Button onClick={handleComplete}>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {state.current_step === "invite_staff" ? "Finish" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
