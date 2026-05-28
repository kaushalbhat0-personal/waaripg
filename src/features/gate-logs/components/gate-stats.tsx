"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, DoorOpen, AlertTriangle, Activity } from "lucide-react";
import type { GateDashboard } from "../types";

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  variant?: "default" | "warning" | "destructive" | "success";
};

function StatCard({ icon: Icon, label, value, variant = "default" }: StatCardProps) {
  const colorMap: Record<string, string> = {
    default: "text-foreground",
    warning: "text-amber-600",
    destructive: "text-red-600",
    success: "text-emerald-600",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
        <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorMap[variant]} bg-muted/50`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type GateStatsProps = {
  dashboard: GateDashboard;
};

export function GateStats({ dashboard }: GateStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={DoorOpen}
        label="Currently Inside"
        value={dashboard.currently_inside}
        variant="success"
      />
      <StatCard
        icon={Users}
        label="Currently Outside"
        value={dashboard.currently_outside}
        variant="warning"
      />
      <StatCard
        icon={Activity}
        label="Today Entries"
        value={dashboard.today_entries}
        variant="default"
      />
      <StatCard
        icon={AlertTriangle}
        label="Violations Today"
        value={dashboard.violations_today}
        variant="destructive"
      />
    </div>
  );
}
