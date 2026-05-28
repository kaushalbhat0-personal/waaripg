import { createClient } from "@/lib/supabase/server";

export async function findByRoomId(roomId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("beds")
    .select("*")
    .eq("room_id", roomId)
    .order("bed_number");
  return result as { data: Record<string, unknown>[] | null; error: { message: string } | null };
}

export async function findById(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("beds")
    .select("*, room:rooms(id, room_number)")
    .eq("id", id)
    .single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function findByIdWithDetails(id: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("beds")
    .select("*, room:rooms(id, room_number), allocation:allocations!inner(id, resident:residents(id, name))")
    .eq("id", id)
    .single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function create(data: Record<string, unknown>) {
  const supabase = await createClient();
  const result = await supabase.from("beds").insert(data as never).select().single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function updateStatus(id: string, status: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("beds")
    .update({ status } as never)
    .eq("id", id)
    .select()
    .single();
  return result as { data: Record<string, unknown> | null; error: { message: string } | null };
}

export async function findAvailableByRoomId(roomId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("beds")
    .select("*")
    .eq("room_id", roomId)
    .eq("status", "available")
    .order("bed_number");
  return result as { data: Record<string, unknown>[] | null; error: { message: string } | null };
}

export async function bulkCreate(beds: Record<string, unknown>[]) {
  const supabase = await createClient();
  const result = await supabase.from("beds").insert(beds as never).select();
  return result as { data: Record<string, unknown>[] | null; error: { message: string } | null };
}
