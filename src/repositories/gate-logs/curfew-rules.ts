import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/tenant";
import type { CurfewRule } from "@/features/gate-logs/types";
import type { CreateCurfewRuleInput } from "@/features/gate-logs/schemas";

export async function findActiveCurfewRules() {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  let query = supabase
    .from("curfew_rules")
    .select("*")
    .eq("is_active", true)
    .order("curfew_time", { ascending: true });

  if (orgId) query = query.eq("organization_id", orgId);

  return query as unknown as Promise<{
    data: CurfewRule[] | null;
    error: { message: string } | null;
  }>;
}

export async function findCurfewRuleForResident(
  residentType: string,
  roomType?: string,
  propertyId?: string,
) {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  let query = supabase
    .from("curfew_rules")
    .select("*")
    .eq("is_active", true)
    .or(`resident_type.eq.${residentType},resident_type.eq.all`)
    .order("curfew_time", { ascending: false })
    .limit(1);

  if (orgId) query = query.eq("organization_id", orgId);
  if (roomType) query = query.or(`room_type.eq.${roomType},room_type.is.null`);
  if (propertyId) query = query.or(`property_id.eq.${propertyId},property_id.is.null`);

  return query.maybeSingle() as unknown as Promise<{
    data: CurfewRule | null;
    error: { message: string } | null;
  }>;
}

export async function createCurfewRule(data: CreateCurfewRuleInput) {
  const supabase = await createClient();
  return supabase
    .from("curfew_rules")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: CurfewRule | null;
    error: { message: string } | null;
  }>;
}

export async function findAllCurfewRules() {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  let query = supabase
    .from("curfew_rules")
    .select("*")
    .order("created_at", { ascending: false });

  if (orgId) query = query.eq("organization_id", orgId);

  return query as unknown as Promise<{
    data: CurfewRule[] | null;
    error: { message: string } | null;
  }>;
}

export async function updateCurfewRule(
  id: string,
  data: Partial<CreateCurfewRuleInput & { is_active: boolean }>,
) {
  const supabase = await createClient();
  return supabase
    .from("curfew_rules")
    .update(data as never)
    .eq("id", id) as unknown as Promise<{ error: { message: string } | null }>;
}
