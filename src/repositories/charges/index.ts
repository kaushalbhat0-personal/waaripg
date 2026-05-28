import { createClient } from "@/lib/supabase/server";

type DbResult<T> = { data: T | null; error: { message: string } | null };
type DbResultList<T> = { data: T[] | null; count: number | null; error: { message: string } | null };

export async function findAll(options?: { resident_id?: string; category?: string; is_active?: boolean; page?: number; pageSize?: number }) {
  const supabase = await createClient();
  const { resident_id, category, is_active, page = 1, pageSize = 50 } = options ?? {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("charges")
    .select("*, resident:residents(id, name, phone)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (resident_id) { query = query.eq("resident_id", resident_id); }
  if (category) { query = query.eq("category", category); }
  if (is_active !== undefined) { query = query.eq("is_active", is_active); }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const result = await query;
  return result as DbResultList<Record<string, unknown>>;
}

export async function findById(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("charges")
    .select("*, resident:residents(id, name, phone)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return result as DbResult<Record<string, unknown>>;
}

export async function findByResidentId(residentId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("charges")
    .select("*")
    .eq("resident_id", residentId)
    .is("deleted_at", null)
    .is("is_active", true)
    .order("created_at");
  return result as DbResultList<Record<string, unknown>>;
}

export async function findActiveRecurring() {
  const supabase = await createClient();
  const result = await supabase
    .from("charges")
    .select("*, resident:residents(id, name, phone)")
    .is("deleted_at", null)
    .eq("is_active", true)
    .neq("recurrence", "one-time")
    .order("category");
  return result as DbResultList<Record<string, unknown>>;
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("charges").insert(data as never).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function update(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("charges").update(data as never).eq("id", id).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function softDelete(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("charges")
    .update({ deleted_at: new Date().toISOString(), is_active: false } as never)
    .eq("id", id);
  return result as { error: { message: string } | null };
}
