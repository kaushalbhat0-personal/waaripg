"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { LoadingState } from "@/shared/feedback";
import { InvoiceCard, PaymentFormDialog, RevenueWidgets } from "@/features/payments/components";
import { getInvoicesAction, getFinancialSummaryAction, recordPaymentAction } from "@/features/payments/actions";
import type { InvoiceWithDetails, InvoiceFilterParams, FinancialSummary } from "@/features/payments/types";
import type { PaginatedResponse } from "@/types";
import { toast } from "sonner";

export default function PaymentsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<InvoiceWithDetails> | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDefaultResidentId, setPaymentDefaultResidentId] = useState<string | undefined>();
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);

      const params: InvoiceFilterParams = {
        status: (statusFilter || undefined),
        page,
        pageSize,
      };

      const [invoicesResult, summaryResult] = await Promise.all([
        getInvoicesAction(params),
        getFinancialSummaryAction(),
      ]);

      if (!cancelled && fetchId === fetchIdRef.current) {
        if (invoicesResult.success) {
          setData(invoicesResult.data);
        } else {
          toast.error(invoicesResult.error.message);
        }
        if (summaryResult.success) {
          setSummary(summaryResult.data);
        }
        setIsLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [statusFilter, page, pageSize]);

  function handleViewInvoice(invoice: InvoiceWithDetails) {
    router.push(`/dashboard/payments/invoices/${invoice.id}`);
  }

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
      toast.success("Payment recorded successfully");
    } else {
      toast.error(result.error.message);
      throw new Error(result.error.message);
    }
  }

  function openPaymentForInvoice(invoice: InvoiceWithDetails) {
    setPaymentDefaultResidentId(invoice.resident_id);
    setPaymentDialogOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Payments & Billing"
        description="Manage invoices, payments, and charges"
        actions={
          <Button onClick={() => router.push("/dashboard/payments/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      <RevenueWidgets summary={summary} isLoading={isLoading} />

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            value={statusFilter || null}
            onValueChange={(value) => {
              setStatusFilter(value ?? "");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading invoices..." />
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">
              {statusFilter ? "No invoices match your filter" : "No invoices yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {statusFilter
                ? "Try a different status filter."
                : "Generate your first invoice to start tracking payments."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={() => handleViewInvoice(invoice)}
                onRecordPayment={() => openPaymentForInvoice(invoice)}
                onApplyDiscount={() => {
                  const discount = window.prompt("Enter discount amount:");
                  if (discount) {
                    import("@/features/payments/actions").then(({ applyDiscountAction }) =>
                      applyDiscountAction({ invoice_id: invoice.id, discount_amount: parseFloat(discount) }),
                    ).then((r) => {
                      if (r.success) toast.success("Discount applied");
                      else toast.error(r.error.message);
                    });
                  }
                }}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <PaymentFormDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handleRecordPayment}
        defaultResidentId={paymentDefaultResidentId}
      />
    </PageContainer>
  );
}
