import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

type DbResult<T> = { data: T | null; error: { message: string } | null };
type DbResultList<T> = { data: T[] | null; count: number | null; error: { message: string } | null };

export type FindAllInvoicesParams = {
  search?: string;
  status?: string;
  resident_id?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export async function findAll(params: FindAllInvoicesParams = {}) {
  const supabase = await createClient();
  const { search, status, resident_id, page = 1, pageSize = 10, sort, order = "desc" } = params;

  let query: QueryBuilder = supabase
    .from("invoices")
    .select("*, resident:residents(id, name, phone), items:invoice_items(*)", { count: "exact" })
    .is("deleted_at", null)
    .order(sort === "due_date" ? "due_date" : sort === "total_amount" ? "total_amount" : "created_at", { ascending: order === "asc" });

  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%,resident.name.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (resident_id) {
    query = query.eq("resident_id", resident_id);
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
    .from("invoices")
    .select("*, resident:residents(id, name, phone), items:invoice_items(*), allocation:allocations(id, room:rooms(room_number), bed:beds(bed_number))")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return result as DbResult<Record<string, unknown>>;
}

export async function findByResidentId(residentId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("invoices")
    .select("*, items:invoice_items(*)")
    .eq("resident_id", residentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return result as DbResultList<Record<string, unknown>>;
}

export async function findOverdue() {
  const supabase = await createClient();
  const result = await supabase
    .from("invoices")
    .select("*, resident:residents(id, name, phone)")
    .is("deleted_at", null)
    .in("status", ["pending", "partial"])
    .lt("due_date", new Date().toISOString().split("T")[0])
    .order("due_date");
  return result as DbResultList<Record<string, unknown>>;
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("invoices").insert(data as never).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function createInvoiceWithItems(data: {
  invoice: Record<string, unknown>;
  items: Record<string, unknown>[];
}) {
  const supabase = await createClient();

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert(data.invoice as never)
    .select()
    .single();

  if (invoiceError || !invoice) {
    return { data: null as Record<string, unknown> | null, error: invoiceError ?? { message: "Failed to create invoice" } };
  }

  const invoiceRow = invoice as Record<string, unknown>;
  const itemsWithInvoiceId = data.items.map((item) => ({
    ...item,
    invoice_id: invoiceRow.id,
  }));

  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(itemsWithInvoiceId as never);

  if (itemsError) {
    return { data: null, error: itemsError };
  }

  return { data: invoiceRow, error: null };
}

export async function update(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("invoices").update(data as never).eq("id", id).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function softDelete(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("invoices")
    .update({ deleted_at: new Date().toISOString(), status: "cancelled" } as never)
    .eq("id", id);
  return result as { error: { message: string } | null };
}

export async function getFinancialSummary() {
  const supabase = await createClient();

  const [overdueResult, pendingResult, paidResult, allResult, overdueCountResult] = await Promise.all([
    supabase
      .from("invoices")
      .select("balance")
      .is("deleted_at", null)
      .in("status", ["pending", "partial", "overdue"])
      .lt("due_date", new Date().toISOString().split("T")[0]) as unknown as { data: { balance: number }[] | null; error: unknown },
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "pending") as unknown as { count: number | null; error: unknown },
    supabase
      .from("payments")
      .select("amount")
      .gte("payment_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
      .is("is_refund", false) as unknown as { data: { amount: number }[] | null; error: unknown },
    supabase
      .from("invoices")
      .select("balance")
      .is("deleted_at", null)
      .in("status", ["pending", "partial", "overdue"]) as unknown as { data: { balance: number }[] | null; error: unknown },
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .in("status", ["pending", "partial", "overdue"])
      .lt("due_date", new Date().toISOString().split("T")[0]) as unknown as { count: number | null; error: unknown },
  ]);

  const totalOutstanding = (allResult.data ?? []).reduce((sum, i) => sum + Number(i.balance), 0);
  const totalOverdue = (overdueResult.data ?? []).reduce((sum, i) => sum + Number(i.balance), 0);
  const totalPaidThisMonth = (paidResult.data ?? []).reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingCount = pendingResult.count ?? 0;
  const overdueCount = overdueCountResult.count ?? 0;

  return {
    total_outstanding: totalOutstanding,
    total_overdue: totalOverdue,
    total_paid_this_month: totalPaidThisMonth,
    total_revenue: totalPaidThisMonth,
    pending_invoices: pendingCount,
    overdue_invoices: overdueCount,
  };
}

export async function addItem(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("invoice_items").insert(data as never).select().single();
  return result as DbResult<Record<string, unknown>>;
}
