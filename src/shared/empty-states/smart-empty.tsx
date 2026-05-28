"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users,
  DoorOpen,
  Wallet,
  Logs,
  Shield,
  ScrollText,
  Home,
  CreditCard,
  CalendarCheck,
  AlertTriangle,
  Building2,
  Bed,
  type LucideIcon,
} from "lucide-react";

type EmptyStateConfig = {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
};

const contextMap: Record<string, EmptyStateConfig> = {
  residents: {
    icon: Users,
    title: "No residents yet",
    message: "Add your first resident to start managing your property.",
    action: { label: "Add Resident", onClick: () => {} },
  },
  rooms: {
    icon: DoorOpen,
    title: "No rooms configured",
    message: "Create rooms and beds to start allocating residents.",
    action: { label: "Add Room", onClick: () => {} },
  },
  payments: {
    icon: Wallet,
    title: "No payments recorded",
    message: "Payments will appear here once you start billing residents.",
  },
  invoices: {
    icon: CreditCard,
    title: "No invoices generated",
    message: "Generate invoices for your residents to track dues.",
    action: { label: "Generate Invoice", onClick: () => {} },
  },
  "gate-logs": {
    icon: Logs,
    title: "No gate activity today",
    message: "Entry and exit logs will appear here as residents come and go.",
  },
  violations: {
    icon: AlertTriangle,
    title: "No violations today",
    message: "Great job! Operations are running smoothly.",
    secondaryAction: { label: "View History", onClick: () => {} },
  },
  allocations: {
    icon: Bed,
    title: "No active allocations",
    message: "Allocate beds to residents to track occupancy.",
    action: { label: "Allocate Bed", onClick: () => {} },
  },
  attendance: {
    icon: CalendarCheck,
    title: "No attendance records",
    message: "Attendance snapshots are generated automatically each night.",
  },
  audit: {
    icon: ScrollText,
    title: "No audit logs yet",
    message: "System events will be recorded here as you perform actions.",
  },
  roles: {
    icon: Shield,
    title: "No custom roles",
    message: "Default roles are pre-configured. Add custom roles as needed.",
    action: { label: "Create Role", onClick: () => {} },
  },
  properties: {
    icon: Building2,
    title: "No properties set up",
    message: "Add your first property to get started with the platform.",
    action: { label: "Add Property", onClick: () => {} },
  },
  default: {
    icon: Home,
    title: "No data found",
    message: "There's nothing to display here yet.",
  },
};

type SmartEmptyStateProps = {
  context?: keyof typeof contextMap;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export function SmartEmptyState({
  context,
  title: customTitle,
  message: customMessage,
  icon: customIcon,
  action: customAction,
  secondaryAction: customSecondaryAction,
  className,
}: SmartEmptyStateProps) {
  const config = context ? (contextMap[context] ?? contextMap.default) : null;
  const Icon = customIcon ?? config?.icon ?? (contextMap.default as EmptyStateConfig).icon;
  const title = customTitle ?? config?.title ?? "No data found";
  const message = customMessage ?? config?.message ?? "There's nothing to display here yet.";
  const action = customAction ?? config?.action;
  const secondaryAction = customSecondaryAction ?? config?.secondaryAction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "flex flex-col items-center justify-center gap-5 py-16 px-6 text-center",
        className,
      )}
    >
      <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="sm">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
