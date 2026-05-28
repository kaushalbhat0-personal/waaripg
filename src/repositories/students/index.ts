import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

export async function findAll(options?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  let query: QueryBuilder = supabase
    .from("residents")
    .select("*", { count: "exact" })
    .eq("type", "hostel");

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to).order("created_at", { ascending: false });

  const result = await query;
  return result as { data: Record<string, unknown>[] | null; count: number | null; error: { message: string } | null };
}

export async function findById(id: string) {
  const supabase = await createClient();
  const result = await supabase.from("residents").select("*").eq("id", id).eq("type", "hostel").single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("residents").insert({ ...data, type: "hostel" } as never).select().single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function update(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("residents").update(data as never).eq("id", id).select().single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function remove(id: string) {
  const supabase = await createClient();
  const result = await supabase.from("residents").delete().eq("id", id);
  return result as { error: { message: string } | null };
}
