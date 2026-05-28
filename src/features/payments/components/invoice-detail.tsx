"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency, capitalize } from "@/lib/formatters";
import { IndianRupee, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentHistoryTimeline } from "./payment-history-timeline";
import type { InvoiceWithDetails, PaymentWithDetails } from "../types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  partial: "default",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

type InvoiceDetailProps = {
  invoice: InvoiceWithDetails;
  payments: PaymentWithDetails[];
  onBack?: () => void;
  onRecordPayment?: () => void;
  onApplyDiscount?: () => void;
};

export function InvoiceDetail({ invoice, payments, onBack, onRecordPayment, onApplyDiscount }: InvoiceDetailProps) {
  const canPay = invoice.status !== "paid" && invoice.status !== "cancelled" && invoice.status !== "draft";
  const progressPercent = invoice.total_amount > 0
    ? Math.min(100, Math.round((invoice.paid_amount / invoice.total_amount) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
            <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
              {capitalize(invoice.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {invoice.resident.name}
          </p>
          {invoice.allocation && (
            <p className="text-xs text-muted-foreground">
              Room {invoice.allocation.room.room_number} - Bed {invoice.allocation.bed.bed_number}
            </p>
          )}
        </div>
        {canPay && (
          <div className="flex gap-2">
            <Button onClick={onRecordPayment}>
              <IndianRupee className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
            <Button variant="outline" onClick={onApplyDiscount}>
              Apply Discount
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period</span>
              <span>{formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span className={cn(invoice.status === "overdue" && "text-destructive font-medium")}>
                {formatDate(invoice.due_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
                {capitalize(invoice.status)}
              </Badge>
            </div>
            {invoice.notes && (
              <div className="pt-2 text-muted-foreground">
                <span className="text-xs font-medium">Notes:</span>
                <p className="text-xs">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount {invoice.discount_reason ? `(${invoice.discount_reason})` : ""}</span>
                <span>-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-success">
              <span>Paid</span>
              <span>{formatCurrency(invoice.paid_amount)}</span>
            </div>
            <div className={cn("flex justify-between font-semibold", invoice.balance > 0 ? "text-destructive" : "text-success")}>
              <span>Balance</span>
              <span>{formatCurrency(invoice.balance)}</span>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(invoice.paid_amount)} paid</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    invoice.status === "paid" ? "bg-success" : invoice.status === "overdue" ? "bg-destructive" : "bg-primary",
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <div className="flex items-center justify-between py-2 text-xs font-medium text-muted-foreground">
              <span className="flex-1">Description</span>
              <span className="w-20 text-right">Category</span>
              <span className="w-16 text-right">Qty</span>
              <span className="w-24 text-right">Rate</span>
              <span className="w-24 text-right">Amount</span>
            </div>
            {invoice.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex-1">{item.description}</span>
                <span className="w-20 text-right text-muted-foreground">{capitalize(item.category)}</span>
                <span className="w-16 text-right text-muted-foreground">{item.quantity}</span>
                <span className="w-24 text-right text-muted-foreground">{formatCurrency(item.unit_amount)}</span>
                <span className="w-24 text-right font-medium">{formatCurrency(item.total_amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTimeline payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
