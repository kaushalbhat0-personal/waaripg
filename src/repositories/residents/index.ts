import { createClient } from "@/lib/supabase/server";
import type { Resident } from "@/types";

type DbResident = Record<string, unknown>;
type DbContact = Record<string, unknown>;

export type ResidentRow = Resident;

export type FindAllParams = {
  search?: string;
  type?: string;
  status?: string;
  gender?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export async function findAll(params: FindAllParams = {}) {
  const supabase = await createClient();
  const {
    search,
    type,
    status,
    gender,
    page = 1,
    pageSize = 10,
    sort,
    order = "desc",
  } = params;

  let query = supabase
    .from("residents")
    .select("*, emergency_contacts(*)", { count: "exact" })
    .is("deleted_at", null);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }
  if (type) {
    query = query.eq("type", type);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (gender) {
    query = query.eq("gender", gender);
  }

  const sortColumn = sort === "name" ? "name" : "created_at";
  query = query.order(sortColumn, { ascending: order === "asc" });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query;
}

export async function findById(id: string) {
  const supabase = await createClient();
  return supabase
    .from("residents")
    .select("*, emergency_contacts(*)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
}

export async function findByPhone(phone: string) {
  const supabase = await createClient();
  return supabase
    .from("residents")
    .select("id, name, phone, type, status")
    .eq("phone", phone)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function findByEmail(email: string) {
  const supabase = await createClient();
  return supabase
    .from("residents")
    .select("id, name, email, type, status")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function create(data: {
  resident: DbResident;
  emergencyContacts?: DbContact[];
}) {
  const supabase = await createClient();

  const { data: resident, error } = await supabase
    .from("residents")
    .insert(data.resident as never)
    .select()
    .single();

  if (error) {
    return { data: null as Resident | null, error };
  }

  const residentRow = (resident ?? { id: "" }) as { id: string };

  if (data.emergencyContacts?.length) {
    const contacts = data.emergencyContacts.map((c) => ({
      ...c,
      resident_id: residentRow.id,
    }));

    const { error: contactsError } = await supabase
      .from("emergency_contacts")
      .insert(contacts as never);

    if (contactsError) {
      return { data: null, error: contactsError };
    }
  }

  return { data: resident as Resident, error: null };
}

export async function update(
  id: string,
  data: {
    resident: DbResident;
    emergencyContacts?: DbContact[];
  },
) {
  const supabase = await createClient();

  const { data: resident, error } = await supabase
    .from("residents")
    .update(data.resident as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null as Resident | null, error };
  }

  if (data.emergencyContacts) {
    await supabase
      .from("emergency_contacts")
      .delete()
      .eq("resident_id", id);

    if (data.emergencyContacts.length > 0) {
      const contacts = data.emergencyContacts.map((c) => ({
        ...c,
        resident_id: id,
      }));

      const { error: contactsError } = await supabase
        .from("emergency_contacts")
        .insert(contacts as never);

      if (contactsError) {
        return { data: null, error: contactsError };
      }
    }
  }

  return { data: resident as Resident, error: null };
}

export async function archive(id: string) {
  const supabase = await createClient();
  return supabase
    .from("residents")
    .update({
      status: "terminated",
      archived_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
}

export async function softDelete(id: string) {
  const supabase = await createClient();
  return supabase
    .from("residents")
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", id);
}
