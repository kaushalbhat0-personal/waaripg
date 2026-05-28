import { createClient } from "@/lib/supabase/server";

type DbResult<T> = { data: T | null; error: { message: string } | null };
type DbResultList<T> = { data: T[] | null; error: { message: string } | null };

export async function findByInvoiceId(invoiceId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("payment_allocations")
    .select("*, payment:payments!inner(id, receipt_number, amount, payment_date, payment_method:payment_methods(name))")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false });
  return result as DbResultList<Record<string, unknown>>;
}

export async function findByPaymentId(paymentId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("payment_allocations")
    .select("*, invoice:invoices(id, invoice_number, total_amount)")
    .eq("payment_id", paymentId)
    .order("created_at");
  return result as DbResultList<Record<string, unknown>>;
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("payment_allocations").insert(data as never).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function createBatch(data: Record<string, unknown>[]) {
  const supabase = await createClient();
  const result = await supabase.from("payment_allocations").insert(data as never).select();
  return result as DbResultList<Record<string, unknown>>;
}

export async function sumByInvoiceId(invoiceId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("payment_allocations")
    .select("amount")
    .eq("invoice_id", invoiceId) as unknown as { data: { amount: number }[] | null; error: unknown };
  return (result.data ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
}
