"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, IndianRupee, MoreHorizontal, FileText } from "lucide-react";
import { formatCurrency, formatDate, capitalize } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { InvoiceWithDetails } from "../types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  partial: "default",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted",
  pending: "bg-secondary",
  partial: "bg-primary",
  paid: "bg-success",
  overdue: "bg-destructive",
  cancelled: "bg-muted",
};

type InvoiceCardProps = {
  invoice: InvoiceWithDetails;
  onView?: () => void;
  onRecordPayment?: () => void;
  onApplyDiscount?: () => void;
  onCancel?: () => void;
};

export function InvoiceCard({ invoice, onView, onRecordPayment, onApplyDiscount, onCancel }: InvoiceCardProps) {
  const progressPercent = invoice.total_amount > 0
    ? Math.min(100, Math.round((invoice.paid_amount / invoice.total_amount) * 100))
    : 0;

  const isOverdue = invoice.status === "overdue";
  const canPay = invoice.status !== "paid" && invoice.status !== "cancelled" && invoice.status !== "draft";

  return (
    <Card className={cn("transition-shadow hover:shadow-md", isOverdue && "border-destructive/50")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              <button onClick={onView} className="hover:underline text-left font-medium">
                {invoice.invoice_number}
              </button>
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="font-medium">{invoice.resident.name}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
              {capitalize(invoice.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-8 w-8"
                render={<Button variant="ghost" size="icon" />}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onView}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {canPay && (
                  <DropdownMenuItem onClick={onRecordPayment}>
                    <IndianRupee className="mr-2 h-4 w-4" />
                    Record Payment
                  </DropdownMenuItem>
                )}
                {canPay && (
                  <DropdownMenuItem onClick={onApplyDiscount}>
                    Apply Discount
                  </DropdownMenuItem>
                )}
                {invoice.status === "draft" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={onCancel}>
                      Cancel Invoice
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Due {formatDate(invoice.due_date)}</span>
            {isOverdue && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">
                Overdue
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{formatCurrency(invoice.balance)}</div>
            <div className="text-xs text-muted-foreground">
              of {formatCurrency(invoice.total_amount)}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(invoice.paid_amount)} paid</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", statusColors[invoice.status] ?? "bg-muted")}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {invoice.items.slice(0, 3).map((item) => (
            <Badge key={item.id} variant="outline" className="text-[10px]">
              {item.category}: {formatCurrency(item.total_amount)}
            </Badge>
          ))}
          {invoice.items.length > 3 && (
            <Badge variant="outline" className="text-[10px]">
              +{invoice.items.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
      </CardFooter>
    </Card>
  );
}
