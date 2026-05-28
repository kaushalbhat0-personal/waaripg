import { createClient } from "@/lib/supabase/server";

export type FindAllRoomsParams = {
  search?: string;
  type?: string;
  isActive?: boolean;
  property_id?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

export async function findAll(params: FindAllRoomsParams = {}) {
  const supabase = await createClient();
  const {
    search,
    type,
    isActive,
    property_id,
    page = 1,
    pageSize = 10,
    sort,
    order = "asc",
  } = params;

  let query: QueryBuilder = supabase
    .from("rooms")
    .select("*, beds(*)", { count: "exact" })
    .is("deleted_at", null);

  if (search) {
    query = query.ilike("room_number", `%${search}%`);
  }
  if (type) {
    query = query.eq("type", type);
  }
  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }
  if (property_id) {
    query = query.eq("property_id", property_id);
  }

  const sortColumn = sort === "room_number" ? "room_number" : "created_at";
  query = query.order(sortColumn, { ascending: order === "asc" });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const result = await query;
  return result as { data: Record<string, unknown>[] | null; count: number | null; error: { message: string } | null };
}

export async function findById(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("rooms")
    .select("*, beds(*)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("rooms").insert(data as never).select().single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function update(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("rooms").update(data as never).eq("id", id).select().single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function softDelete(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("rooms")
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", id);
  return result as { error: { message: string } | null };
}

export async function countByType() {
  const supabase = await createClient();
  const result = await supabase
    .from("rooms")
    .select("type", { count: "exact", head: true })
    .is("deleted_at", null);
  return result as { data: Record<string, unknown>[] | null; count: number | null; error: { message: string } | null };
}

export async function findRoomsWithAvailability(params: {
  type?: string;
  property_id?: string;
  minCapacity?: number;
}) {
  const supabase = await createClient();
  let query: QueryBuilder = supabase
    .from("rooms")
    .select("*, beds(*)")
    .is("deleted_at", null)
    .eq("is_active", true);

  if (params.type) {
    query = query.eq("type", params.type);
  }
  if (params.property_id) {
    query = query.eq("property_id", params.property_id);
  }

  const result = await query;
  return result as { data: Record<string, unknown>[] | null; error: { message: string } | null };
}
