"use client";

import {
  User,
  Wallet,
  FileText,
  MoveRight,
  DoorOpen,
  CreditCard,
  Logs,
  Shield,
  Activity,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import type { ActivityTimelineEvent } from "../types";

const iconMap: Record<string, React.ElementType> = {
  User,
  Wallet,
  FileText,
  MoveRight,
  DoorOpen,
  CreditCard,
  Logs,
  Shield,
  Activity,
  Clock,
};

const colorMap: Record<string, string> = {
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

type TimelineCardProps = {
  event: ActivityTimelineEvent;
};

export function TimelineCard({ event }: TimelineCardProps) {
  const Icon = iconMap[event.icon ?? "Activity"] ?? Activity;
  const colorClass = colorMap[event.color ?? "gray"] ?? colorMap.gray;

  return (
    <div className="group relative flex gap-4 rounded-xl border p-4 transition-all hover:shadow-sm hover:border-muted-foreground/20">
      <div
        className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{event.action_label}</p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{event.actor_name}</span>
          <span>·</span>
          <span>{formatDate(event.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
