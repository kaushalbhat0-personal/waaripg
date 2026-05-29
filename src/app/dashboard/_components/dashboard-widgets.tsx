"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MetricWidget } from "@/shared/widgets";
import { ActivityFeed } from "@/features/dashboard/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricWidgetSkeleton, ActivityFeedSkeleton } from "@/shared/loading";
import { staggerContainer, staggerItem } from "@/shared/animations";
import {
  Users,
  DoorOpen,
  Wallet,
  Logs,
  Bed,
  AlertTriangle,
  Activity,
  Building2,
  GraduationCap,
  Home,
} from "lucide-react";

type DashboardMetrics = {
  totalResidents: number;
  activeResidents: number;
  pgResidents: number;
  hostelStudents: number;
  occupiedBeds: number;
  totalBeds: number;
  currentlyInside: number;
  lateEntriesToday: number;
  pendingPayments: number;
  revenueThisMonth: number;
  pendingViolations: number;
  availableBeds: number;
};

const defaultMetrics: DashboardMetrics = {
  totalResidents: 0,
  activeResidents: 0,
  pgResidents: 0,
  hostelStudents: 0,
  occupiedBeds: 0,
  totalBeds: 0,
  currentlyInside: 0,
  lateEntriesToday: 0,
  pendingPayments: 0,
  revenueThisMonth: 0,
  pendingViolations: 0,
  availableBeds: 0,
};

export function DashboardWidgets() {
  const [loading] = useState(false);
  const [metrics] = useState<DashboardMetrics>(defaultMetrics);

  const occupancyRate = useMemo(
    () => (metrics.totalBeds > 0 ? Math.round((metrics.occupiedBeds / metrics.totalBeds) * 100) : 0),
    [metrics.occupiedBeds, metrics.totalBeds],
  );

  const primaryWidgets = useMemo(
    () => [
      {
        title: "PG Residents",
        value: metrics.pgResidents,
        icon: Home,
        href: "/dashboard/residents",
        variant: "default" as const,
      },
      {
        title: "Hostel Students",
        value: metrics.hostelStudents,
        icon: GraduationCap,
        href: "/dashboard/students",
        variant: "default" as const,
      },
      {
        title: "Occupancy Rate",
        value: `${occupancyRate}%`,
        icon: Building2,
        href: "/dashboard/rooms",
        variant: occupancyRate > 80 ? "success" as const : occupancyRate > 50 ? "warning" as const : "default" as const,
        trend: { direction: occupancyRate > 50 ? "up" as const : "down" as const, value: `${metrics.occupiedBeds}/${metrics.totalBeds}`, label: "beds" },
      },
      {
        title: "Currently Inside",
        value: metrics.currentlyInside,
        icon: Logs,
        href: "/dashboard/gate-logs",
        variant: "success" as const,
      },
      {
        title: "Late Entries Today",
        value: metrics.lateEntriesToday,
        icon: AlertTriangle,
        href: "/dashboard/gate-logs",
        variant: metrics.lateEntriesToday > 0 ? "warning" as const : "default" as const,
      },
      {
        title: "Revenue This Month",
        value: `₹${metrics.revenueThisMonth.toLocaleString("en-IN")}`,
        icon: Wallet,
        href: "/dashboard/payments",
        variant: "success" as const,
        trend: { direction: "up" as const, value: "+12%", label: "vs last month" },
      },
      {
        title: "Available Beds",
        value: metrics.availableBeds,
        icon: Bed,
        href: "/dashboard/rooms",
        variant: metrics.availableBeds > 0 ? "default" as const : "warning" as const,
      },
      {
        title: "Pending Payments",
        value: metrics.pendingPayments,
        icon: Wallet,
        href: "/dashboard/payments",
        variant: metrics.pendingPayments > 0 ? "warning" as const : "default" as const,
      },
      {
        title: "Pending Violations",
        value: metrics.pendingViolations,
        icon: AlertTriangle,
        href: "/dashboard/gate-logs",
        variant: metrics.pendingViolations > 0 ? "destructive" as const : "default" as const,
      },
    ],
    [metrics, occupancyRate],
  );

  return (
    <div className="space-y-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} variants={staggerItem}>
                <MetricWidgetSkeleton />
              </motion.div>
            ))
          : primaryWidgets.map((widget, i) => (
              <motion.div key={i} variants={staggerItem}>
                <MetricWidget {...widget} />
              </motion.div>
            ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ActivityFeedSkeleton />
            ) : (
              <ActivityFeed />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-medium">{occupancyRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Residents", value: metrics.totalResidents, icon: Users },
                  { label: "PG Residents", value: metrics.pgResidents, icon: Home },
                  { label: "Hostel Students", value: metrics.hostelStudents, icon: GraduationCap },
                  { label: "Active", value: metrics.activeResidents, icon: Users },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <item.icon className="h-3 w-3" />
                      <span>{item.label}</span>
                    </div>
                    <p className="mt-1 text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
