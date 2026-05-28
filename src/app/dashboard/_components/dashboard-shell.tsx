"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { QuickActionsPanel } from "@/shared/quick-actions";
import { CommandPalette, useCommandPalette } from "@/features/command-palette/components";
import { OnboardingWizard } from "@/features/onboarding/components";
import { TourProvider } from "@/features/product-tour/components";
import { HelpCenter } from "@/features/help-center/components/help-center";
import { FeedbackDialog } from "@/features/feedback/components/feedback-dialog";
import { UndoBar } from "@/shared/confidence-ui/undo-bar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleHelpOpen = useCallback(() => setHelpOpen(true), []);
  const handleFeedbackOpen = useCallback(() => setFeedbackOpen(true), []);

  return (
    <TourProvider>
      <div className="flex h-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            onCommandOpen={() => setCommandOpen(true)}
            onHelpOpen={handleHelpOpen}
            onFeedbackOpen={handleFeedbackOpen}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <QuickActionsPanel />
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <OnboardingWizard />
        <HelpCenter open={helpOpen} onClose={() => setHelpOpen(false)} />
        <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        <UndoBar />
      </div>
    </TourProvider>
  );
}
