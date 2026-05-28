"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/shared/page/page-container";
import { LoadingState } from "@/shared/feedback";
import { InvoiceDetail, PaymentFormDialog } from "@/features/payments/components";
import { getInvoiceByIdAction, recordPaymentAction, applyDiscountAction } from "@/features/payments/actions";
import type { InvoiceWithDetails, PaymentWithDetails } from "@/features/payments/types";
import { toast } from "sonner";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    async function fetchData() {
      const result = await getInvoiceByIdAction(id);
      if (result.success && result.data) {
        setInvoice(result.data);
        // Fetch allocations with payment details
        const { getPaymentsAction } = await import("@/features/payments/actions");
        const pmtsResult = await getPaymentsAction({ resident_id: result.data.resident_id, pageSize: 50 });
        if (pmtsResult.success) {
          setPayments(pmtsResult.data.data);
        }
      } else {
        toast.error("Invoice not found");
        router.push("/dashboard/payments");
      }
      setIsLoading(false);
    }

    fetchData();
  }, [params.id, router]);

  async function handleRecordPayment(data: {
    resident_id: string;
    amount: number;
    payment_method_id: string;
    reference_number?: string | null;
    allocation?: { invoice_id: string; amount: number }[];
    notes?: string | null;
  }) {
    const result = await recordPaymentAction({
      ...data,
      allocation: [{ invoice_id: params.id as string, amount: data.amount }],
    });
    if (result.success) {
      toast.success("Payment recorded successfully");
      // Refresh
      const updated = await getInvoiceByIdAction(params.id as string);
      if (updated.success && updated.data) setInvoice(updated.data);
    } else {
      toast.error(result.error.message);
      throw new Error(result.error.message);
    }
  }

  async function handleApplyDiscount() {
    const discountStr = window.prompt("Enter discount amount (₹):");
    if (!discountStr) return;
    const discountAmount = parseFloat(discountStr);
    if (isNaN(discountAmount) || discountAmount <= 0) return;
    const reason = window.prompt("Discount reason (optional):");

    const result = await applyDiscountAction({
      invoice_id: params.id as string,
      discount_amount: discountAmount,
      discount_reason: reason || null,
    });
    if (result.success) {
      toast.success("Discount applied");
      setInvoice(result.data);
    } else {
      toast.error(result.error.message);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading invoice..." />
      </PageContainer>
    );
  }

  if (!invoice) return null;

  return (
    <PageContainer>
      <InvoiceDetail
        invoice={invoice}
        payments={payments}
        onBack={() => router.push("/dashboard/payments")}
        onRecordPayment={() => setPaymentDialogOpen(true)}
        onApplyDiscount={handleApplyDiscount}
      />
      <PaymentFormDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handleRecordPayment}
        defaultResidentId={invoice.resident_id}
        defaultInvoiceId={invoice.id}
        invoices={[{
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          total_amount: invoice.total_amount,
          balance: invoice.balance,
        }]}
      />
    </PageContainer>
  );
}
