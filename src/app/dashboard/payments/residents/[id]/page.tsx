"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/shared/page/page-container";
import { LoadingState } from "@/shared/feedback";
import { PaymentFormDialog, PaymentHistoryTimeline, ChargeFormDialog } from "@/features/payments/components";
import { getResidentBillingAction, recordPaymentAction, createChargeAction } from "@/features/payments/actions";
import { formatCurrency, formatDate, capitalize } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Wallet, IndianRupee, CalendarDays, Clock } from "lucide-react";
import type { ResidentBillingSummary } from "@/features/payments/types";
import { toast } from "sonner";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  partial: "default",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

export default function ResidentBillingPage() {
  const params = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<ResidentBillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);

  const residentId = params.id as string;

  useEffect(() => {
    if (!residentId) return;

    async function fetchData() {
      const result = await getResidentBillingAction(residentId);
      if (result.success) {
        setSummary(result.data);
      } else {
        toast.error(result.error.message);
        router.push("/dashboard/payments");
      }
      setIsLoading(false);
    }

    fetchData();
  }, [residentId, router]);

  async function handleRecordPayment(data: {
    resident_id: string;
    amount: number;
    payment_method_id: string;
    reference_number?: string | null;
    allocation?: { invoice_id: string; amount: number }[];
    notes?: string | null;
  }) {
    const result = await recordPaymentAction(data);
    if (result.success) {
      toast.success("Payment recorded");
      const updated = await getResidentBillingAction(residentId);
      if (updated.success) setSummary(updated.data);
    } else {
      toast.error(result.error.message);
      throw new Error(result.error.message);
    }
  }

  async function handleCreateCharge(data: {
    category: string;
    description: string;
    amount: number;
    recurrence?: string;
    resident_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }) {
    const result = await createChargeAction(data as Parameters<typeof createChargeAction>[0]);
    if (result.success) {
      toast.success("Charge created");
    } else {
      toast.error(result.error.message);
      throw new Error(result.error.message);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading resident billing..." />
      </PageContainer>
    );
  }

  if (!summary) return null;

  return (
    <PageContainer>
      <Button variant="ghost" onClick={() => router.push("/dashboard/payments")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Payments
      </Button>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{summary.resident.name}</h1>
          <p className="text-sm text-muted-foreground">{summary.resident.phone}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <IndianRupee className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
          <Button variant="outline" onClick={() => setChargeDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Charge
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", summary.total_due > 0 ? "text-destructive" : "text-success")}>
              {formatCurrency(summary.total_due)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(summary.total_paid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.last_payment_date ? formatDate(summary.last_payment_date) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {summary.active_invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.active_invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted"
                onClick={() => router.push(`/dashboard/payments/invoices/${inv.id}`)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{inv.invoice_number}</span>
                    <Badge variant={statusVariant[inv.status] ?? "secondary"}>
                      {capitalize(inv.status)}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Due {formatDate(inv.due_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(inv.period_start)} - {formatDate(inv.period_end)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(inv.balance)}</div>
                  <div className="text-xs text-muted-foreground">of {formatCurrency(inv.total_amount)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTimeline payments={summary.payment_history as never} />
        </CardContent>
      </Card>

      <PaymentFormDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handleRecordPayment}
        defaultResidentId={residentId}
        invoices={summary.active_invoices.map((inv) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          total_amount: inv.total_amount,
          balance: inv.balance,
        }))}
      />

      <ChargeFormDialog
        open={chargeDialogOpen}
        onOpenChange={setChargeDialogOpen}
        onSubmit={handleCreateCharge}
        defaultResidentId={residentId}
      />
    </PageContainer>
  );
}
