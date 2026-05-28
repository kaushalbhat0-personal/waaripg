"use client";

import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";
import { NotificationCenter } from "@/features/notifications/components";
import { Search, Command, HelpCircle, MessageSquarePlus } from "lucide-react";

type DashboardHeaderProps = {
  onCommandOpen?: () => void;
  onHelpOpen?: () => void;
  onFeedbackOpen?: () => void;
};

export function DashboardHeader({ onCommandOpen, onHelpOpen, onFeedbackOpen }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6">
      <MobileNav />
      <div className="flex-1" />
      <button
        onClick={onCommandOpen}
        className="hidden sm:flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 w-56"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search anything...</span>
        <div className="ml-auto flex items-center gap-0.5">
          <kbd className="rounded border bg-background px-1 py-0.5 text-[9px] font-medium">
            <Command className="h-2.5 w-2.5 inline" />
          </kbd>
          <kbd className="rounded border bg-background px-1 py-0.5 text-[9px] font-medium">K</kbd>
        </div>
      </button>
      <button
        onClick={onCommandOpen}
        className="flex sm:hidden h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Help button */}
      <button
        onClick={onHelpOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
        title="Help Center"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {/* Feedback button */}
      <button
        onClick={onFeedbackOpen}
        className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
        title="Send Feedback"
      >
        <MessageSquarePlus className="h-4 w-4" />
      </button>

      <NotificationCenter />
      <UserNav />
    </header>
  );
}
