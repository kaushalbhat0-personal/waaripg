import { z } from "zod";

export const invoiceItemSchema = z.object({
  category: z.enum(["rent", "electricity", "water", "maintenance", "fine", "deposit", "discount", "other"]),
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.coerce.number().int().positive().optional().default(1),
  unit_amount: z.coerce.number().min(0, "Amount must be positive"),
});

export const createInvoiceSchema = z.object({
  resident_id: z.string().uuid("Invalid resident"),
  allocation_id: z.string().uuid().optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().max(1000).optional().nullable(),
});

export const addInvoiceItemSchema = z.object({
  invoice_id: z.string().uuid("Invalid invoice"),
  category: z.enum(["rent", "electricity", "water", "maintenance", "fine", "deposit", "discount", "other"]),
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.coerce.number().int().positive().optional().default(1),
  unit_amount: z.coerce.number().min(0, "Amount must be positive"),
});

export const paymentAllocationSchema = z.object({
  invoice_id: z.string().uuid("Invalid invoice"),
  amount: z.coerce.number().min(0.01, "Allocation amount must be positive"),
});

export const recordPaymentSchema = z.object({
  resident_id: z.string().uuid("Invalid resident"),
  amount: z.coerce.number().min(1, "Payment amount must be at least 1"),
  payment_method_id: z.string().uuid("Invalid payment method"),
  reference_number: z.string().max(200).optional().nullable(),
  allocation: z.array(paymentAllocationSchema).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const applyDiscountSchema = z.object({
  invoice_id: z.string().uuid("Invalid invoice"),
  discount_amount: z.coerce.number().min(0, "Discount amount must be positive"),
  discount_reason: z.string().max(500).optional().nullable(),
});

export const refundPaymentSchema = z.object({
  payment_id: z.string().uuid("Invalid payment"),
  reason: z.string().max(1000).optional().nullable(),
});

export const createChargeSchema = z.object({
  resident_id: z.string().uuid().optional().nullable(),
  allocation_id: z.string().uuid().optional().nullable(),
  category: z.enum(["rent", "electricity", "water", "maintenance", "fine", "deposit", "discount", "other"]),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.coerce.number().min(1, "Amount must be positive"),
  recurrence: z.enum(["monthly", "one-time", "quarterly", "yearly"]).optional().default("monthly"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().nullable(),
});

export const invoiceFilterSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.enum(["draft", "pending", "partial", "paid", "overdue", "cancelled"]).optional(),
  resident_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const paymentFilterSchema = z.object({
  search: z.string().max(200).optional(),
  resident_id: z.string().uuid().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
export type AddInvoiceItemSchema = z.infer<typeof addInvoiceItemSchema>;
export type RecordPaymentSchema = z.infer<typeof recordPaymentSchema>;
export type ApplyDiscountSchema = z.infer<typeof applyDiscountSchema>;
export type RefundPaymentSchema = z.infer<typeof refundPaymentSchema>;
export type CreateChargeSchema = z.infer<typeof createChargeSchema>;
export type InvoiceFilterSchema = z.infer<typeof invoiceFilterSchema>;
export type PaymentFilterSchema = z.infer<typeof paymentFilterSchema>;
