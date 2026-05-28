"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Wallet,
  MoveRight,
  AlertTriangle,
  FileText,
  Bed,
  LogIn,
  CreditCard,
  DoorOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { staggerContainer, staggerItem } from "@/shared/animations";

type ActivityAction =
  | "resident.created"
  | "resident.updated"
  | "resident.archived"
  | "payment.recorded"
  | "payment.refunded"
  | "allocation.created"
  | "allocation.transferred"
  | "allocation.ended"
  | "invoice.created"
  | "gate_log.created"
  | "violation.created"
  | "violation.resolved"
  | "room.created"
  | "room.updated";

type ActivityEvent = {
  id: string;
  action: ActivityAction;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

const activityConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  "resident.created": { icon: UserPlus, label: "Resident Added", color: "text-emerald-600 bg-emerald-500/10" },
  "resident.updated": { icon: UserPlus, label: "Resident Updated", color: "text-blue-600 bg-blue-500/10" },
  "resident.archived": { icon: UserPlus, label: "Resident Archived", color: "text-red-600 bg-red-500/10" },
  "payment.recorded": { icon: Wallet, label: "Payment Recorded", color: "text-emerald-600 bg-emerald-500/10" },
  "payment.refunded": { icon: CreditCard, label: "Refund Issued", color: "text-amber-600 bg-amber-500/10" },
  "allocation.created": { icon: Bed, label: "Bed Allocated", color: "text-blue-600 bg-blue-500/10" },
  "allocation.transferred": { icon: MoveRight, label: "Resident Transferred", color: "text-purple-600 bg-purple-500/10" },
  "allocation.ended": { icon: DoorOpen, label: "Allocation Ended", color: "text-gray-600 bg-gray-500/10" },
  "invoice.created": { icon: FileText, label: "Invoice Generated", color: "text-indigo-600 bg-indigo-500/10" },
  "gate_log.created": { icon: LogIn, label: "Gate Entry", color: "text-cyan-600 bg-cyan-500/10" },
  "violation.created": { icon: AlertTriangle, label: "Violation Recorded", color: "text-red-600 bg-red-500/10" },
  "violation.resolved": { icon: CheckCircle2, label: "Violation Resolved", color: "text-emerald-600 bg-emerald-500/10" },
  "room.created": { icon: DoorOpen, label: "Room Created", color: "text-blue-600 bg-blue-500/10" },
  "room.updated": { icon: DoorOpen, label: "Room Updated", color: "text-amber-600 bg-amber-500/10" },
};

const sampleEvents: ActivityEvent[] = [
  { id: "1", action: "resident.created", description: "New resident Rahul Sharma added", actor: "Admin", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "2", action: "payment.recorded", description: "₹12,000 rent payment recorded for Priya Patel", actor: "Admin", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), metadata: { amount: 12000 } },
  { id: "3", action: "violation.created", description: "Late entry detected - Amit Singh at 11:45 PM", actor: "System", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "4", action: "allocation.transferred", description: "Neha Gupta transferred from Room 105 to Room 203", actor: "Manager", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: "5", action: "invoice.created", description: "Monthly invoice generated for 15 residents", actor: "System", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
];

type ActivityFeedProps = {
  events?: ActivityEvent[];
  className?: string;
  title?: string;
  onViewAll?: () => void;
};

export function ActivityFeed({
  events = sampleEvents,
  className,
  title = "Recent Activity",
  onViewAll,
}: ActivityFeedProps) {
  const grouped = useMemo(() => {
    const today: ActivityEvent[] = [];
    const yesterday: ActivityEvent[] = [];
    const older: ActivityEvent[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();

    for (const e of events) {
      const d = new Date(e.timestamp).toDateString();
      if (d === todayStr) today.push(e);
      else if (d === yesterdayStr) yesterday.push(e);
      else older.push(e);
    }
    return [
      today.length > 0 && { label: "Today", items: today },
      yesterday.length > 0 && { label: "Yesterday", items: yesterday },
      older.length > 0 && { label: "Earlier", items: older },
    ].filter(Boolean) as { label: string; items: ActivityEvent[] }[];
  }, [events]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {events.length > 0 && onViewAll && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onViewAll}>
            View all
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Activity className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((event) => {
                  const config = activityConfig[event.action] ?? {
                    icon: Activity,
                    label: event.action,
                    color: "text-gray-600 bg-gray-500/10",
                  };
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={event.id}
                      variants={staggerItem}
                      className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50"
                    >
                      <div className={cn("mt-0.5 rounded-lg p-1.5 shrink-0", config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug">
                          {event.description}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{event.actor}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
