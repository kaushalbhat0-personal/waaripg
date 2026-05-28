import type { LucideIcon } from "lucide-react";

export type CommandGroup = {
  id: string;
  label: string;
  items: CommandItem[];
};

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  shortcut?: string;
  href?: string;
  action?: () => void;
  keywords?: string[];
};
