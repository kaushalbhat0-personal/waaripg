import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

type DbResult<T> = { data: T | null; error: { message: string } | null };
type DbResultList<T> = { data: T[] | null; count: number | null; error: { message: string } | null };

export type FindAllAllocationsParams = {
  resident_id?: string;
  room_id?: string;
  bed_id?: string;
  is_active?: boolean;
  page?: number;
  pageSize?: number;
};

export async function findAll(params: FindAllAllocationsParams = {}) {
  const supabase = await createClient();
  const { resident_id, room_id, bed_id, is_active, page = 1, pageSize = 10 } = params;

  let query: QueryBuilder = supabase
    .from("allocations")
    .select("*, resident:residents(id, name, phone, type), bed:beds(id, bed_number, room:rooms(id, room_number))", { count: "exact" })
    .order("created_at", { ascending: false });

  if (resident_id) { query = query.eq("resident_id", resident_id); }
  if (room_id) { query = query.eq("room_id", room_id); }
  if (bed_id) { query = query.eq("bed_id", bed_id); }
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
    .from("allocations")
    .select("*, resident:residents(id, name, phone, type), bed:beds(id, bed_number, room:rooms(id, room_number))")
    .eq("id", id)
    .single();
  return result as DbResult<Record<string, unknown>>;
}

export async function findActiveByResidentId(residentId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("allocations")
    .select("*, bed:beds(id, bed_number), room:rooms(id, room_number)")
    .eq("resident_id", residentId)
    .eq("is_active", true)
    .maybeSingle();
  return result as DbResult<Record<string, unknown>>;
}

export async function findActiveByBedId(bedId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("allocations")
    .select("*, resident:residents(id, name)")
    .eq("bed_id", bedId)
    .eq("is_active", true)
    .maybeSingle();
  return result as DbResult<Record<string, unknown>>;
}

export async function findActiveByRoomId(roomId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("allocations")
    .select("*, resident:residents(id, name), bed:beds(id, bed_number)")
    .eq("room_id", roomId)
    .eq("is_active", true);
  return result as DbResultList<Record<string, unknown>>;
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("allocations").insert(data as never).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function update(id: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("allocations").update(data as never).eq("id", id).select().single();
  return result as DbResult<Record<string, unknown>>;
}

export async function deactivateActiveAllocationsByBedId(bedId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("allocations")
    .update({ is_active: false, check_out_date: new Date().toISOString().split("T")[0] } as never)
    .eq("bed_id", bedId)
    .eq("is_active", true);
  return result as { error: { message: string } | null };
}

export async function getOccupancyByRoomId(roomId: string) {
  const supabase = await createClient();
  const bedsResult = await supabase
    .from("beds")
    .select("status")
    .eq("room_id", roomId) as unknown as { data: { status: string }[] | null; error: { message: string } | null };

  const allBeds = bedsResult.data ?? [];
  const total = allBeds.length;
  const occupied = allBeds.filter((b) => b.status === "occupied").length;
  const reserved = allBeds.filter((b) => b.status === "reserved").length;
  const maintenance = allBeds.filter((b) => b.status === "maintenance").length;
  const available = allBeds.filter((b) => b.status === "available").length;

  return {
    total,
    available,
    occupied,
    reserved,
    maintenance,
    percentage: total > 0 ? Math.round((occupied / total) * 100) : 0,
  };
}

export async function getAllocationHistoryByResidentId(residentId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("allocations")
    .select("*, bed:beds(id, bed_number, room:rooms(id, room_number)), transferred_from:allocations!transferred_from_id(id)")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false });
  return result as DbResultList<Record<string, unknown>>;
}
