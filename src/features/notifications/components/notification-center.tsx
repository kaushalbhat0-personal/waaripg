"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Wallet,
  AlertTriangle,
  Logs,
  CalendarCheck,
  DoorOpen,
  Users,
  Settings,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/formatters";
import type { Notification, NotificationCategory } from "../types";

const categoryConfig: Record<NotificationCategory, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  payment: { icon: Wallet, color: "text-emerald-600" },
  violation: { icon: AlertTriangle, color: "text-red-600" },
  gate: { icon: Logs, color: "text-blue-600" },
  attendance: { icon: CalendarCheck, color: "text-purple-600" },
  room: { icon: DoorOpen, color: "text-amber-600" },
  resident: { icon: Users, color: "text-cyan-600" },
  system: { icon: Settings, color: "text-gray-600" },
  invoice: { icon: FileText, color: "text-indigo-600" },
};

const priorityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Late entry detected",
    message: "Rahul Sharma entered at 11:45 PM (15 min past curfew)",
    category: "violation",
    priority: "high",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    action: { label: "View", href: "/dashboard/gate-logs" },
  },
  {
    id: "2",
    title: "Payment due reminder",
    message: "5 residents have pending payments for this month",
    category: "payment",
    priority: "medium",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    action: { label: "View Payments", href: "/dashboard/payments" },
  },
  {
    id: "3",
    title: "Room available",
    message: "Room 204 (Double) is now available for allocation",
    category: "room",
    priority: "low",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    action: { label: "View Room", href: "/dashboard/rooms" },
  },
  {
    id: "4",
    title: "Curfew violation",
    message: "3 residents breached curfew last night",
    category: "violation",
    priority: "high",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    action: { label: "Review", href: "/dashboard/gate-logs" },
  },
  {
    id: "5",
    title: "Invoice generated",
    message: "Monthly invoices for June have been generated",
    category: "invoice",
    priority: "medium",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: { label: "View Invoices", href: "/dashboard/payments" },
  },
];

function groupNotificationsByDate(notifications: Notification[]): { date: string; items: Notification[] }[] {
  const groups = new Map<string, Notification[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const n of notifications) {
    const d = new Date(n.timestamp).toDateString();
    let label: string;
    if (d === today) label = "Today";
    else if (d === yesterday) label = "Yesterday";
    else label = formatDate(n.timestamp);

    const existing = groups.get(label) ?? [];
    existing.push(n);
    groups.set(label, existing);
  }

  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

type NotificationCenterProps = {
  notifications?: Notification[];
  className?: string;
};

export function NotificationCenter({ notifications: externalNotifications, className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(
    externalNotifications ?? sampleNotifications,
  );
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const hasCritical = useMemo(
    () => notifications.some((n) => !n.read && n.priority === "critical"),
    [notifications],
  );

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          (a.read ? 1 : 0) - (b.read ? 1 : 0) ||
          (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99) ||
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [notifications],
  );

  const grouped = useMemo(() => groupNotificationsByDate(sorted), [sorted]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative",
            hasCritical && "animate-pulse",
            className,
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white",
              hasCritical ? "bg-red-600" : "bg-primary",
            )}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/60" />
              <div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">
                  No new notifications
                </p>
              </div>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                <div className="sticky top-0 bg-popover px-4 py-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.date}
                  </p>
                </div>
                {group.items.map((notification) => {
                  const config = categoryConfig[notification.category] ?? categoryConfig.system;
                  const Icon = config.icon;

                  return (
                    <button
                      key={notification.id}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                        !notification.read && "bg-accent/30",
                      )}
                      onClick={() => markRead(notification.id)}
                    >
                      <div className={cn("mt-0.5 rounded-lg p-1.5", config.color.replace("text", "bg") + "/10")}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm leading-snug",
                            !notification.read && "font-medium",
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(notification.timestamp)}
                          </span>
                          {notification.action && (
                            <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary">
                              {notification.action.label}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t px-4 py-2.5 text-center">
          <Button variant="ghost" size="sm" className="h-7 w-full text-xs text-muted-foreground">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
