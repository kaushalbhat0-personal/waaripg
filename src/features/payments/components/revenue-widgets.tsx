"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, IndianRupee, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { FinancialSummary } from "../types";

type RevenueWidgetsProps = {
  summary: FinancialSummary | null;
  isLoading?: boolean;
};

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  variant?: "default" | "warning" | "success" | "danger";
};

function StatCard({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "text-foreground",
    warning: "text-warning",
    success: "text-success",
    danger: "text-destructive",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", variantStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", variantStyles[variant])}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";

export function RevenueWidgets({ summary, isLoading }: RevenueWidgetsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title="Outstanding"
        value={formatCurrency(summary?.total_outstanding ?? 0)}
        icon={Wallet}
        variant="default"
        description="Total unpaid"
      />
      <StatCard
        title="Overdue"
        value={summary ? `${summary.overdue_invoices}` : "0"}
        icon={AlertTriangle}
        variant="danger"
        description={`${formatCurrency(summary?.total_overdue ?? 0)} overdue`}
      />
      <StatCard
        title="Collected This Month"
        value={formatCurrency(summary?.total_paid_this_month ?? 0)}
        icon={TrendingUp}
        variant="success"
        description="Current month revenue"
      />
      <StatCard
        title="Pending Invoices"
        value={`${summary?.pending_invoices ?? 0}`}
        icon={Clock}
        variant="warning"
        description="Awaiting payment"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(summary?.total_revenue ?? 0)}
        icon={IndianRupee}
        variant="success"
        description="All time collections"
      />
    </div>
  );
}
