"use client";

import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { QuickActionsPanel } from "@/shared/quick-actions";
import { CommandPalette, useCommandPalette } from "@/features/command-palette/components";
import { OnboardingWizard } from "@/features/onboarding/components";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();

  return (
    <div className="flex h-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onCommandOpen={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <QuickActionsPanel />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <OnboardingWizard />
    </div>
  );
}
