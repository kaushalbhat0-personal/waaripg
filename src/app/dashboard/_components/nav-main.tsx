"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DoorOpen,
  Wallet,
  Logs,
  Settings,
  Shield,
  ScrollText,
} from "lucide-react";

const navigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Residents", href: "/dashboard/residents", icon: Users },
  { title: "Students", href: "/dashboard/students", icon: GraduationCap },
  { title: "Rooms", href: "/dashboard/rooms", icon: DoorOpen },
  { title: "Payments", href: "/dashboard/payments", icon: Wallet },
  { title: "Gate Logs", href: "/dashboard/gate-logs", icon: Logs },
  { title: "Roles", href: "/dashboard/roles", icon: Shield },
  { title: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export function NavMain() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
