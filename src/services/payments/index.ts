import type { ActionResponse, PaginatedResponse } from "@/types";
import * as invoiceRepo from "@/repositories/invoices";
import * as paymentRepo from "@/repositories/payments";
import * as chargeRepo from "@/repositories/charges";
import * as allocationRepo from "@/repositories/payment-allocations";
import {
  createInvoiceSchema,
  recordPaymentSchema,
  applyDiscountSchema,
  refundPaymentSchema,
  createChargeSchema,
} from "@/features/payments/schemas";
import type {
  CreateInvoiceInput,
  RecordPaymentInput,
  ApplyDiscountInput,
  RefundPaymentInput,
  CreateChargeInput,
  InvoiceWithDetails,
  PaymentWithDetails,
  ChargeWithDetails,
  FinancialSummary,
  InvoiceFilterParams,
  PaymentFilterParams,
  ResidentBillingSummary,
} from "@/features/payments/types";
import type { Invoice, Payment, Charge } from "@/types";

function toInvoiceWithDetails(inv: Record<string, unknown>): InvoiceWithDetails {
  const resident = (inv.resident ?? {}) as Record<string, unknown>;
  const items = (inv.items ?? []) as Record<string, unknown>[];
  const allocation = inv.allocation as Record<string, unknown> | undefined;
  return {
    ...(inv as unknown as Invoice),
    resident: {
      id: resident.id as string,
      name: resident.name as string,
      phone: resident.phone as string,
    },
    items: items.map((i) => i as unknown as import("@/types").InvoiceItem),
    allocation: allocation
      ? {
          id: allocation.id as string,
          room: { room_number: ((allocation.room as Record<string, unknown>)?.room_number ?? "") as string },
          bed: { bed_number: ((allocation.bed as Record<string, unknown>)?.bed_number ?? "") as string },
        }
      : null,
  };
}

function toPaymentWithDetails(pmt: Record<string, unknown>): PaymentWithDetails {
  const pm = (pmt.payment_method ?? {}) as Record<string, unknown>;
  const allocs = (pmt.allocations ?? []) as Record<string, unknown>[];
  const refundPmt = pmt.refunds_payment as Record<string, unknown> | undefined;
  return {
    ...(pmt as unknown as Payment),
    payment_method: pm.code ? { code: pm.code as string, name: pm.name as string } : undefined,
    allocations: allocs.map((a) => {
      const inv = (a.invoice ?? {}) as Record<string, unknown>;
      return {
        ...(a as unknown as import("@/types").PaymentAllocation),
        invoice: {
          id: inv.id as string,
          invoice_number: inv.invoice_number as string,
          total_amount: Number(inv.total_amount),
        },
      };
    }),
    refunds_payment: refundPmt?.id
      ? { id: refundPmt.id as string, receipt_number: (refundPmt.receipt_number as string) ?? null }
      : null,
  };
}

function toChargeWithDetails(chg: Record<string, unknown>): ChargeWithDetails {
  const resident = chg.resident as Record<string, unknown> | undefined;
  return {
    ...(chg as unknown as Charge),
    resident: resident?.id
      ? { id: resident.id as string, name: resident.name as string, phone: resident.phone as string }
      : null,
  };
}

export async function getInvoices(
  params: InvoiceFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<InvoiceWithDetails>>> {
  try {
    const { data, error, count } = await invoiceRepo.findAll({
      search: params.search,
      status: params.status || undefined,
      resident_id: params.resident_id || undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      sort: params.sort,
      order: params.order,
    });

    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    const today = new Date().toISOString().split("T")[0] ?? "";
    const enriched = (data ?? []).map((inv) => {
      const row = inv as Record<string, unknown>;
      if (row.status === "pending" || row.status === "partial") {
        const dueDate = row.due_date as string;
        if (dueDate && dueDate < today) {
          (row as Record<string, unknown>).status = "overdue";
        }
      }
      return toInvoiceWithDetails(row);
    });

    return {
      success: true,
      data: {
        data: enriched,
        total: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch invoices",
      },
    };
  }
}

export async function getInvoiceById(id: string): Promise<ActionResponse<InvoiceWithDetails | null>> {
  try {
    const { data, error } = await invoiceRepo.findById(id);
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ? toInvoiceWithDetails(data as Record<string, unknown>) : null };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch invoice",
      },
    };
  }
}

export async function getPaymentById(id: string): Promise<ActionResponse<PaymentWithDetails | null>> {
  try {
    const { data, error } = await paymentRepo.findById(id);
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ? toPaymentWithDetails(data as Record<string, unknown>) : null };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch payment",
      },
    };
  }
}

export async function getFinancialSummary(): Promise<ActionResponse<FinancialSummary>> {
  try {
    const summary = await invoiceRepo.getFinancialSummary();
    return { success: true, data: summary };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to get financial summary",
      },
    };
  }
}

export async function generateInvoice(input: CreateInvoiceInput): Promise<ActionResponse<InvoiceWithDetails>> {
  const validated = createInvoiceSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;
    let subtotal = 0;
    const items = data.items.map((item) => {
      const total = item.quantity * item.unit_amount;
      subtotal += total;
      return {
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
        total_amount: total,
      };
    });

    const totalAmount = subtotal;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-5)}`;

    const invoicePayload: Record<string, unknown> = {
      resident_id: data.resident_id,
      allocation_id: data.allocation_id ?? null,
      invoice_number: invoiceNumber,
      status: "pending",
      due_date: data.due_date,
      period_start: data.period_start,
      period_end: data.period_end,
      subtotal,
      discount_amount: 0,
      total_amount: totalAmount,
      paid_amount: 0,
      balance: totalAmount,
      notes: data.notes ?? null,
    };

    const { data: invoice, error } = await invoiceRepo.createInvoiceWithItems({
      invoice: invoicePayload,
      items,
    });

    if (error || !invoice) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to generate invoice" },
      };
    }

    const fullInvoice = await invoiceRepo.findById(invoice.id as string);
    return {
      success: true,
      data: toInvoiceWithDetails(fullInvoice.data as Record<string, unknown>),
      message: "Invoice generated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to generate invoice",
      },
    };
  }
}

export async function recordPayment(input: RecordPaymentInput): Promise<ActionResponse<PaymentWithDetails>> {
  const validated = recordPaymentSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;

    // Generate receipt number
    const receiptNumber = await paymentRepo.getNextReceiptNumber();

    // Create payment record
    const paymentPayload: Record<string, unknown> = {
      resident_id: data.resident_id,
      amount: data.amount,
      payment_method_id: data.payment_method_id,
      reference_number: data.reference_number ?? null,
      receipt_number: receiptNumber,
      notes: data.notes ?? null,
      is_refund: false,
    };

    const { data: payment, error: paymentError } = await paymentRepo.create(paymentPayload);
    if (paymentError || !payment) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: paymentError?.message ?? "Failed to record payment" },
      };
    }

    const pmt = payment as Record<string, unknown>;

    // Create allocations if provided
    if (data.allocation && data.allocation.length > 0) {
      const totalAllocated = data.allocation.reduce((sum, a) => sum + a.amount, 0);

      if (totalAllocated > data.amount) {
        return {
          success: false,
          error: {
            code: "OVER_ALLOCATION",
            message: `Allocation total (${totalAllocated}) exceeds payment amount (${data.amount})`,
          },
        };
      }

      const allocPayloads = data.allocation.map((a) => ({
        payment_id: pmt.id,
        invoice_id: a.invoice_id,
        amount: a.amount,
      }));

      const { error: allocError } = await allocationRepo.createBatch(allocPayloads);
      if (allocError) {
        return {
          success: false,
          error: { code: "DB_ERROR", message: allocError.message },
        };
      }
    }

    const fullPayment = await paymentRepo.findById(pmt.id as string);
    return {
      success: true,
      data: toPaymentWithDetails(fullPayment.data as Record<string, unknown>),
      message: "Payment recorded successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to record payment",
      },
    };
  }
}

export async function refundPayment(input: RefundPaymentInput): Promise<ActionResponse<PaymentWithDetails>> {
  const validated = refundPaymentSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    // Fetch original payment
    const { data: originalPmt } = await paymentRepo.findById(input.payment_id);
    if (!originalPmt) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Original payment not found" },
      };
    }

    const orig = originalPmt as Record<string, unknown>;

    if (orig.is_refund) {
      return {
        success: false,
        error: { code: "ALREADY_REFUND", message: "Cannot refund a refund payment" },
      };
    }

    // Create refund payment
    const receiptNumber = await paymentRepo.getNextReceiptNumber();
    const refundPayload: Record<string, unknown> = {
      resident_id: orig.resident_id,
      amount: orig.amount,
      payment_method_id: orig.payment_method_id,
      receipt_number: receiptNumber,
      notes: input.reason ?? `Refund of ${orig.receipt_number as string}`,
      is_refund: true,
      refunds_payment_id: orig.id,
    };

    const { data: refund, error: refundError } = await paymentRepo.create(refundPayload);
    if (refundError || !refund) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: refundError?.message ?? "Failed to create refund" },
      };
    }

    const ref = refund as Record<string, unknown>;

    // Reverse all original allocations
    const originalAllocs = await allocationRepo.findByPaymentId(input.payment_id);
    if (originalAllocs.data && originalAllocs.data.length > 0) {
      const reverseAllocs = originalAllocs.data.map((a) => {
        const alloc = a as Record<string, unknown>;
        return {
          payment_id: ref.id,
          invoice_id: alloc.invoice_id,
          amount: alloc.amount,
        };
      });

      await allocationRepo.createBatch(reverseAllocs);
    }

    const fullRefund = await paymentRepo.findById(ref.id as string);
    return {
      success: true,
      data: toPaymentWithDetails(fullRefund.data as Record<string, unknown>),
      message: "Refund processed successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to process refund",
      },
    };
  }
}

export async function applyDiscount(input: ApplyDiscountInput): Promise<ActionResponse<InvoiceWithDetails>> {
  const validated = applyDiscountSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;

    const { data: invoice } = await invoiceRepo.findById(data.invoice_id);
    if (!invoice) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Invoice not found" },
      };
    }

    const inv = invoice as Record<string, unknown>;

    if (data.discount_amount > (inv.total_amount as number)) {
      return {
        success: false,
        error: {
          code: "INVALID_DISCOUNT",
          message: "Discount cannot exceed invoice total",
        },
      };
    }

    const newTotal = (inv.total_amount as number) - data.discount_amount;
    const newBalance = newTotal - (inv.paid_amount as number);

    const { error } = await invoiceRepo.update(data.invoice_id, {
      discount_amount: data.discount_amount,
      discount_reason: data.discount_reason ?? null,
      total_amount: newTotal,
      balance: Math.max(0, newBalance),
    } as Record<string, unknown>);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    const updated = await invoiceRepo.findById(data.invoice_id);
    return {
      success: true,
      data: toInvoiceWithDetails(updated.data as Record<string, unknown>),
      message: "Discount applied successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to apply discount",
      },
    };
  }
}

export async function createCharge(input: CreateChargeInput): Promise<ActionResponse<ChargeWithDetails>> {
  const validated = createChargeSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;
    const payload: Record<string, unknown> = {
      resident_id: data.resident_id ?? null,
      allocation_id: data.allocation_id ?? null,
      category: data.category,
      description: data.description,
      amount: data.amount,
      recurrence: data.recurrence,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      is_active: true,
    };

    const { data: charge, error } = await chargeRepo.create(payload);
    if (error || !charge) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to create charge" },
      };
    }

    const full = await chargeRepo.findById((charge as Record<string, unknown>).id as string);
    return {
      success: true,
      data: toChargeWithDetails(full.data as Record<string, unknown>),
      message: "Charge created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to create charge",
      },
    };
  }
}

export async function getCharges(options?: {
  resident_id?: string;
  category?: string;
  is_active?: boolean;
}): Promise<ActionResponse<PaginatedResponse<ChargeWithDetails>>> {
  try {
    const { data, error, count } = await chargeRepo.findAll({
      ...options,
      pageSize: 100,
    });

    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }

    return {
      success: true,
      data: {
        data: (data ?? []).map((c) => toChargeWithDetails(c as Record<string, unknown>)),
        total: count ?? 0,
        page: 1,
        pageSize: 100,
        totalPages: 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch charges",
      },
    };
  }
}

export async function getPayments(
  params: PaymentFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<PaymentWithDetails>>> {
  try {
    const { data, error, count } = await paymentRepo.findAll({
      search: params.search,
      resident_id: params.resident_id || undefined,
      start_date: params.start_date,
      end_date: params.end_date,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    });

    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    return {
      success: true,
      data: {
        data: (data ?? []).map((p) => toPaymentWithDetails(p as Record<string, unknown>)),
        total: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch payments",
      },
    };
  }
}

export async function getResidentBilling(residentId: string): Promise<ActionResponse<ResidentBillingSummary>> {
  try {
    const [invoicesResult, paymentsResult, residentResult] = await Promise.all([
      invoiceRepo.findByResidentId(residentId),
      paymentRepo.findByResidentId(residentId),
      (await import("@/repositories/residents")).findById(residentId),
    ]);

    if (residentResult.error || !residentResult.data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Resident not found" } };
    }

    const invs = (invoicesResult.data ?? []) as Record<string, unknown>[];
    const pmts = (paymentsResult.data ?? []) as Record<string, unknown>[];

    const totalDue = invs.reduce((sum, inv) => sum + Number(inv.balance ?? 0), 0);
    const totalPaid = pmts
      .filter((p) => !p.is_refund)
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

    const lastPayment = pmts.length > 0 ? (pmts[0] as Record<string, unknown>).payment_date as string : null;

    const today = new Date().toISOString().split("T")[0] ?? "";
    const activeInvoices = invs
      .filter((inv) => inv.status !== "cancelled" && inv.status !== "paid")
      .map((inv) => {
        if (inv.status === "pending" || inv.status === "partial") {
          const dueDate = inv.due_date as string;
          if (dueDate && dueDate < today) {
            (inv as Record<string, unknown>).status = "overdue";
          }
        }
        return toInvoiceWithDetails(inv);
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resident = (residentResult as any).data as Record<string, unknown>;
    const pmMethods = pmts.map((p) => {
      const pm = (p.payment_method ?? {}) as Record<string, unknown>;
      return {
        ...(p as unknown as Payment),
        payment_method: pm.name ? { name: pm.name as string } : undefined,
      };
    });

    return {
      success: true,
      data: {
        resident: {
          id: resident.id as string,
          name: resident.name as string,
          phone: resident.phone as string,
        },
        total_due: totalDue,
        total_paid: totalPaid,
        balance: totalDue,
        last_payment_date: lastPayment,
        active_invoices: activeInvoices,
        payment_history: pmMethods,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch resident billing",
      },
    };
  }
}
