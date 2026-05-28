"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  Wallet,
  Logs,
  Shield,
  ScrollText,
  UserPlus,
  Bed,
  LogIn,
  MoveRight,
  FileText,
  CheckCircle2,
  Search,
  GraduationCap,
  Settings,
  ArrowRight,
} from "lucide-react";
import type { CommandGroup, CommandItem } from "./command-types";

const navigationCommands: CommandGroup = {
  id: "navigation",
  label: "Navigate to",
  items: [
    { id: "nav-dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", shortcut: "GD" },
    { id: "nav-residents", label: "Residents", icon: Users, href: "/dashboard/residents", shortcut: "GR" },
    { id: "nav-rooms", label: "Rooms", icon: DoorOpen, href: "/dashboard/rooms", shortcut: "GR" },
    { id: "nav-payments", label: "Payments", icon: Wallet, href: "/dashboard/payments", shortcut: "GP" },
    { id: "nav-gate-logs", label: "Gate Logs", icon: Logs, href: "/dashboard/gate-logs", shortcut: "GG" },
    { id: "nav-students", label: "Students", icon: GraduationCap, href: "/dashboard/students" },
    { id: "nav-roles", label: "Roles & Permissions", icon: Shield, href: "/dashboard/roles" },
    { id: "nav-audit", label: "Audit Logs", icon: ScrollText, href: "/dashboard/audit-logs" },
    { id: "nav-settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
};

const quickActionCommands: CommandGroup = {
  id: "actions",
  label: "Quick Actions",
  items: [
    { id: "action-resident", label: "Add Resident", icon: UserPlus, keywords: ["create", "new", "person"], action: () => {} },
    { id: "action-bed", label: "Allocate Bed", icon: Bed, keywords: ["assign", "room"], action: () => {} },
    { id: "action-payment", label: "Record Payment", icon: Wallet, keywords: ["money", "fee", "due"], action: () => {} },
    { id: "action-checkin", label: "Check-In Resident", icon: LogIn, keywords: ["entry", "gate"], action: () => {} },
    { id: "action-transfer", label: "Transfer Resident", icon: MoveRight, keywords: ["move", "room", "change"], action: () => {} },
    { id: "action-invoice", label: "Generate Invoice", icon: FileText, keywords: ["bill", "charge"], action: () => {} },
    { id: "action-resolve", label: "Resolve Violation", icon: CheckCircle2, keywords: ["fine", "issue"], action: () => {} },
  ],
};

const allGroups: CommandGroup[] = [navigationCommands, quickActionCommands];

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < lower.length && qi < q.length; ti++) {
    if (lower[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customGroups?: CommandGroup[];
  onSearchResidents?: (query: string) => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  customGroups = [],
  onSearchResidents,
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredGroups = useMemo(() => {
    const groups = [...allGroups, ...customGroups];
    if (!query.trim()) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            fuzzyMatch(item.label, query) ||
            item.keywords?.some((k) => fuzzyMatch(k, query)) ||
            fuzzyMatch(item.description ?? "", query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, customGroups]);

  const flatFilteredItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  const prevOpen = useRef(open);
  useEffect(() => {
    const justOpened = open && !prevOpen.current;
    prevOpen.current = open;
    if (justOpened) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const executeItem = useCallback(
    (item: CommandItem) => {
      if (item.href) {
        router.push(item.href);
      }
      item.action?.();
      onOpenChange(false);
    },
    [router, onOpenChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatFilteredItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && flatFilteredItems[selectedIndex]) {
        e.preventDefault();
        executeItem(flatFilteredItems[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    },
    [flatFilteredItems, selectedIndex, executeItem, onOpenChange],
  );

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      const selected = el.children[selectedIndex] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const handleGlobalKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-[15%] w-full max-w-lg -translate-x-1/2 rounded-xl border bg-popover shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, actions, residents..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  onSearchResidents?.(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              className="max-h-[360px] overflow-y-auto p-2"
            >
              {filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No results for &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.id} className="mb-2 last:mb-0">
                    <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const flatIndex = flatFilteredItems.indexOf(item);
                      const isSelected = flatIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-accent/50",
                          )}
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                        >
                          {Icon && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.shortcut && (
                              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {item.shortcut}
                              </kbd>
                            )}
                            {item.href && (
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↵</kbd>
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
