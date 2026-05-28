import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

type DbResult<T> = { data: T | null; error: { message: string } | null };
type DbResultList<T> = { data: T[] | null; count: number | null; error: { message: string } | null };

export type FindAllPaymentsParams = {
  search?: string;
  resident_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
};

export async function findAll(params: FindAllPaymentsParams = {}) {
  const supabase = await createClient();
  const { search, resident_id, start_date, end_date, page = 1, pageSize = 10 } = params;

  let query: QueryBuilder = supabase
    .from("payments")
    .select("*, payment_method:payment_methods(code, name), allocations:payment_allocations(*, invoice:invoices(id, invoice_number, total_amount))", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`receipt_number.ilike.%${search}%,reference_number.ilike.%${search}%`);
  }
  if (resident_id) {
    query = query.eq("resident_id", resident_id);
  }
  if (start_date) {
    query = query.gte("payment_date", start_date);
  }
  if (end_date) {
    query = query.lte("payment_date", end_date);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const result = await query;
  return result as DbResultList<Record<string, unknown>>;
}

export async function findById(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("payments")
    .select("*, payment_method:payment_methods(code, name), allocations:payment_allocations(*, invoice:invoices(id, invoice_number, total_amount)), refunds_payment:payments!refunds_payment_id(id, receipt_number)")
    .eq("id", id)
    .single();
  return result as DbResult<Record<string, unknown>>;
}

export async function findByResidentId(residentId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("payments")
    .select("*, payment_method:payment_methods(name)")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false });
  return result as DbResultList<Record<string, unknown>>;
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("payments").insert(data as never).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function getNextReceiptNumber(): Promise<string> {
  const supabase = await createClient();
  const result = await supabase.rpc("generate_receipt_number");
  const number = result.data as string | null;
  if (number) return number;

  const year = new Date().getFullYear();
  const { data: last } = await supabase
    .from("payments")
    .select("receipt_number")
    .ilike("receipt_number", `RCPT-${year}-%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single() as unknown as { data: { receipt_number: string } | null };

  if (last?.receipt_number) {
    const parts = last.receipt_number.split("-");
    const num = parseInt(parts[2] ?? "0", 10);
    return `RCPT-${year}-${String(num + 1).padStart(5, "0")}`;
  }
  return `RCPT-${year}-00001`;
}
