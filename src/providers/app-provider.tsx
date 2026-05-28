"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";
import { SupabaseProvider } from "./supabase-provider";

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
