"use client";

import { useState, useRef, useEffect } from "react";
import { BarChart, Activity, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAnalyticsSummary } from "@/lib/tracking";
import type { AnalyticsSummary } from "../types";

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    setSummary(getAnalyticsSummary());
  }, []);

  if (!summary) return null;

  const items = [
    {
      label: "Total Events",
      value: summary.total_events,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Onboarding",
      value: summary.onboarding_completed ? "Done" : "In Progress",
      icon: CheckCircle,
      color: summary.onboarding_completed ? "text-green-500" : "text-yellow-500",
      bg: summary.onboarding_completed ? "bg-green-50" : "bg-yellow-50",
    },
    {
      label: "Tours Completed",
      value: summary.tours_completed,
      icon: HelpCircle,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Errors",
      value: summary.error_count,
      icon: AlertTriangle,
      color: summary.error_count > 0 ? "text-red-500" : "text-green-500",
      bg: summary.error_count > 0 ? "bg-red-50" : "bg-green-50",
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Adoption Analytics</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-lg ${item.bg} p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
            </div>
            <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
      {summary.features_used.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-[10px] font-medium text-muted-foreground">Features Used</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {summary.features_used.map((f) => (
              <span
                key={f}
                className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
