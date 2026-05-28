export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type NotificationCategory =
  | "payment"
  | "violation"
  | "gate"
  | "attendance"
  | "room"
  | "resident"
  | "system"
  | "invoice";

export type Notification = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  timestamp: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  metadata?: Record<string, unknown>;
};

export type NotificationGroup = {
  date: string;
  notifications: Notification[];
};
