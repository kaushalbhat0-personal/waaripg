import { createClient } from "@/lib/supabase/server";
import type { Resident } from "@/types";

export async function findAll(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const { search, status, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from("residents")
    .select("*, emergency_contacts(*)", { count: "exact" })
    .eq("type", "hostel")
    .is("deleted_at", null);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,institution_name.ilike.%${search}%,roll_number.ilike.%${search}%`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  return { data: (data ?? []) as Resident[], error, count: count ?? 0 };
}

export async function findById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("residents")
    .select("*, emergency_contacts(*)")
    .eq("id", id)
    .eq("type", "hostel")
    .is("deleted_at", null)
    .single();

  return { data: data as Resident | null, error };
}

export async function create(data: Partial<Resident>) {
  const supabase = await createClient();

  const { data: resident, error } = await supabase
    .from("residents")
    .insert({ ...data, type: "hostel" } as never)
    .select("*, emergency_contacts(*)")
    .single();

  return { data: resident as Resident | null, error };
}

export async function update(id: string, data: Partial<Resident>) {
  const supabase = await createClient();

  const { data: resident, error } = await supabase
    .from("residents")
    .update(data as never)
    .eq("id", id)
    .select("*, emergency_contacts(*)")
    .single();

  return { data: resident as Resident | null, error };
}

export async function remove(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("residents")
    .update({ deleted_at: new Date().toISOString(), status: "terminated" } as never)
    .eq("id", id)
    .eq("type", "hostel");

  return { error };
}
