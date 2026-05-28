"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { IndianRupee, CalendarDays, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentWithDetails } from "../types";

type PaymentHistoryTimelineProps = {
  payments: (PaymentWithDetails & { payment_method?: { name: string } })[];
};

export function PaymentHistoryTimeline({ payments }: PaymentHistoryTimelineProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
        <IndianRupee className="mb-2 h-8 w-8" />
        <p>No payment history</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {payments.map((payment, index) => {
        const isRefund = payment.is_refund;
        return (
          <div key={payment.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < payments.length - 1 && (
              <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
            )}
            <div
              className={cn(
                "relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                isRefund ? "bg-destructive/10" : "bg-success/10",
              )}
            >
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  isRefund ? "bg-destructive" : "bg-success",
                )}
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {isRefund ? "Refund" : "Payment"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {payment.receipt_number}
                  </Badge>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isRefund ? "text-destructive" : "text-success",
                  )}
                >
                  {isRefund ? "-" : "+"}{formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(payment.payment_date)}
                </span>
                {payment.payment_method && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {payment.payment_method.name}
                  </span>
                )}
                {payment.reference_number && (
                  <span className="text-muted-foreground/70">
                    Ref: {payment.reference_number}
                  </span>
                )}
              </div>
              {payment.notes && (
                <p className="text-xs text-muted-foreground">{payment.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
