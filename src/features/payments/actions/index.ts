"use server";

import { revalidatePath } from "next/cache";
import * as paymentService from "@/services/payments";
import type {
  CreateInvoiceInput,
  RecordPaymentInput,
  ApplyDiscountInput,
  RefundPaymentInput,
  CreateChargeInput,
  InvoiceFilterParams,
  PaymentFilterParams,
  InvoiceWithDetails,
  PaymentWithDetails,
  ChargeWithDetails,
  FinancialSummary,
  ResidentBillingSummary,
} from "../types";
import type { ActionResponse, PaginatedResponse } from "@/types";

export async function getInvoicesAction(
  params: InvoiceFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<InvoiceWithDetails>>> {
  return paymentService.getInvoices(params);
}

export async function getInvoiceByIdAction(
  id: string,
): Promise<ActionResponse<InvoiceWithDetails | null>> {
  return paymentService.getInvoiceById(id);
}

export async function getPaymentByIdAction(
  id: string,
): Promise<ActionResponse<PaymentWithDetails | null>> {
  return paymentService.getPaymentById(id);
}

export async function getPaymentsAction(
  params: PaymentFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<PaymentWithDetails>>> {
  return paymentService.getPayments(params);
}

export async function getFinancialSummaryAction(): Promise<ActionResponse<FinancialSummary>> {
  return paymentService.getFinancialSummary();
}

export async function generateInvoiceAction(
  input: CreateInvoiceInput,
): Promise<ActionResponse<InvoiceWithDetails>> {
  const result = await paymentService.generateInvoice(input);
  if (result.success) {
    revalidatePath("/dashboard/payments");
  }
  return result;
}

export async function recordPaymentAction(
  input: RecordPaymentInput,
): Promise<ActionResponse<PaymentWithDetails>> {
  const result = await paymentService.recordPayment(input);
  if (result.success) {
    revalidatePath("/dashboard/payments");
  }
  return result;
}

export async function refundPaymentAction(
  input: RefundPaymentInput,
): Promise<ActionResponse<PaymentWithDetails>> {
  const result = await paymentService.refundPayment(input);
  if (result.success) {
    revalidatePath("/dashboard/payments");
  }
  return result;
}

export async function applyDiscountAction(
  input: ApplyDiscountInput,
): Promise<ActionResponse<InvoiceWithDetails>> {
  const result = await paymentService.applyDiscount(input);
  if (result.success) {
    revalidatePath("/dashboard/payments");
  }
  return result;
}

export async function createChargeAction(
  input: CreateChargeInput,
): Promise<ActionResponse<ChargeWithDetails>> {
  const result = await paymentService.createCharge(input);
  if (result.success) {
    revalidatePath("/dashboard/payments");
  }
  return result;
}

export async function getChargesAction(options?: {
  resident_id?: string;
  category?: string;
  is_active?: boolean;
}): Promise<ActionResponse<PaginatedResponse<ChargeWithDetails>>> {
  return paymentService.getCharges(options);
}

export async function getResidentBillingAction(
  residentId: string,
): Promise<ActionResponse<ResidentBillingSummary>> {
  return paymentService.getResidentBilling(residentId);
}
