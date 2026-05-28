"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UserPlus,
  Bed,
  Wallet,
  LogIn,
  MoveRight,
  FileText,
  CheckCircle2,
  X,
  Plus,
  type LucideIcon,
} from "lucide-react";

type QuickAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  variant?: "default" | "outline" | "secondary";
  action: () => void;
};

export type { QuickAction };

type QuickActionsPanelProps = {
  actions?: QuickAction[];
  className?: string;
};

const defaultActions: QuickAction[] = [
  { id: "add-resident", label: "Add Resident", icon: UserPlus, shortcut: "R", action: () => {} },
  { id: "allocate-bed", label: "Allocate Bed", icon: Bed, shortcut: "B", action: () => {} },
  { id: "record-payment", label: "Record Payment", icon: Wallet, shortcut: "P", action: () => {} },
  { id: "check-in", label: "Check-In", icon: LogIn, shortcut: "I", action: () => {} },
  { id: "transfer", label: "Transfer Resident", icon: MoveRight, shortcut: "T", action: () => {} },
  { id: "generate-invoice", label: "Generate Invoice", icon: FileText, shortcut: "G", action: () => {} },
  { id: "resolve-violation", label: "Resolve Violation", icon: CheckCircle2, shortcut: "V", action: () => {} },
] as QuickAction[];

export function QuickActionsPanel({
  actions = defaultActions,
  className,
}: QuickActionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <TooltipProvider>
      <div className={cn("fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2", className)}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-1.5"
            >
              {actions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03, duration: 0.15 }}
                >
                    <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant={item.variant ?? "secondary"}
                        className="h-10 w-10 rounded-full shadow-lg"
                        onClick={item.action}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                          {item.shortcut}
                        </kbd>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger>
            <Button
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full shadow-xl transition-all duration-200",
                isOpen && "rotate-45",
              )}
              onClick={toggleOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              <span className="sr-only">Quick Actions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <span>Quick Actions</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
