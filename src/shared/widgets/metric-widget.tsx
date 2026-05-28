"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";

type Trend = {
  direction: TrendDirection;
  value: string;
  label?: string;
};

type MetricWidgetProps = {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: Trend;
  href?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  onClick?: () => void;
  className?: string;
};

const variantStyles = {
  default: { icon: "text-primary", bg: "bg-primary/10" },
  success: { icon: "text-emerald-600", bg: "bg-emerald-500/10" },
  warning: { icon: "text-amber-600", bg: "bg-amber-500/10" },
  destructive: { icon: "text-red-600", bg: "bg-red-500/10" },
};

const trendIcons: Record<TrendDirection, React.ComponentType<{ className?: string }>> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

const trendColors: Record<TrendDirection, string> = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-muted-foreground",
};

export function MetricWidget({
  title,
  value,
  icon: Icon,
  trend,
  href,
  variant = "default",
  onClick,
  className,
}: MetricWidgetProps) {
  const styles = variantStyles[variant];
  const TrendIcon = trend ? trendIcons[trend.direction] : null;

  const content = (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-1.5">
                {TrendIcon && <TrendIcon className={cn("h-3.5 w-3.5", trendColors[trend.direction])} />}
                <span className={cn("text-xs font-medium", trendColors[trend.direction])}>
                  {trend.value}
                </span>
                {trend.label && (
                  <span className="text-xs text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("rounded-lg p-2.5", styles.bg)}>
              <Icon className={cn("h-5 w-5", styles.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href={href}>{content}</Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      {content}
    </motion.div>
  );
}
