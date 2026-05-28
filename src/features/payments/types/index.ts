import type { Invoice, InvoiceItem, Payment, PaymentAllocation, Charge, Resident } from "@/types";

export type InvoiceWithDetails = Invoice & {
  resident: Pick<Resident, "id" | "name" | "phone">;
  items: InvoiceItem[];
  allocation?: { id: string; room: { room_number: string }; bed: { bed_number: string } } | null;
};

export type PaymentWithDetails = Payment & {
  payment_method?: { code: string; name: string };
  allocations?: (PaymentAllocation & { invoice: Pick<Invoice, "id" | "invoice_number" | "total_amount"> })[];
  refunds_payment?: Pick<Payment, "id" | "receipt_number"> | null;
};

export type ChargeWithDetails = Charge & {
  resident?: Pick<Resident, "id" | "name" | "phone"> | null;
};

export type CreateInvoiceInput = {
  resident_id: string;
  allocation_id?: string | null;
  due_date: string;
  period_start: string;
  period_end: string;
  items: {
    category: "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other";
    description: string;
    quantity?: number;
    unit_amount: number;
  }[];
  notes?: string | null;
};

export type AddInvoiceItemInput = {
  invoice_id: string;
  category: "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other";
  description: string;
  quantity?: number;
  unit_amount: number;
};

export type RecordPaymentInput = {
  resident_id: string;
  amount: number;
  payment_method_id: string;
  reference_number?: string | null;
  allocation?: {
    invoice_id: string;
    amount: number;
  }[];
  notes?: string | null;
};

export type ApplyDiscountInput = {
  invoice_id: string;
  discount_amount: number;
  discount_reason?: string | null;
};

export type RefundPaymentInput = {
  payment_id: string;
  reason?: string | null;
};

export type CreateChargeInput = {
  resident_id?: string | null;
  allocation_id?: string | null;
  category: "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other";
  description: string;
  amount: number;
  recurrence?: "monthly" | "one-time" | "quarterly" | "yearly";
  start_date?: string | null;
  end_date?: string | null;
};

export type InvoiceFilterParams = {
  search?: string;
  status?: string;
  resident_id?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export type PaymentFilterParams = {
  search?: string;
  resident_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
};

export type FinancialSummary = {
  total_outstanding: number;
  total_overdue: number;
  total_paid_this_month: number;
  total_revenue: number;
  pending_invoices: number;
  overdue_invoices: number;
};

export type ResidentBillingSummary = {
  resident: Pick<Resident, "id" | "name" | "phone">;
  total_due: number;
  total_paid: number;
  balance: number;
  last_payment_date: string | null;
  active_invoices: (Invoice & { items: InvoiceItem[] })[];
  payment_history: (Payment & { payment_method?: { name: string } })[];
};
