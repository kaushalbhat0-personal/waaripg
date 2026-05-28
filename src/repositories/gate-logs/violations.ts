import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/tenant";
import type { ViolationLog, ViolationWithResident } from "@/features/gate-logs/types";
import type { ViolationFilterParams } from "@/features/gate-logs/schemas";

export async function findViolations(params: ViolationFilterParams = {}) {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();
  const {
    resident_id,
    violation_type,
    severity,
    resolved,
    date_from,
    date_to,
    page = 1,
    pageSize = 25,
  } = params;

  let query = supabase
    .from("violation_logs")
    .select("*, resident:residents(id, name, phone)", { count: "exact" })
    .order("detected_at", { ascending: false });

  if (orgId) query = query.eq("organization_id", orgId);
  if (resident_id) query = query.eq("resident_id", resident_id);
  if (violation_type) query = query.eq("violation_type", violation_type);
  if (severity) query = query.eq("severity", severity);
  if (resolved !== undefined) query = query.eq("resolved", resolved);
  if (date_from) query = query.gte("detected_at", date_from);
  if (date_to) query = query.lte("detected_at", date_to);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  return query as unknown as Promise<{
    data: ViolationWithResident[] | null;
    error: { message: string } | null;
    count: number | null;
  }>;
}

export async function createViolation(data: {
  organization_id?: string | null;
  resident_id: string;
  violation_type: string;
  severity?: string;
  gate_log_id?: string | null;
  description: string;
  penalty_amount?: number | null;
}) {
  const supabase = await createClient();
  return supabase
    .from("violation_logs")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: ViolationLog | null;
    error: { message: string } | null;
  }>;
}

export async function resolveViolation(
  id: string,
  resolvedBy: string,
  notes?: string,
) {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  let query = supabase
    .from("violation_logs")
    .update({
      resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      notes,
    } as never)
    .eq("id", id);

  if (orgId) query = query.eq("organization_id", orgId);

  return query as unknown as Promise<{ error: { message: string } | null }>;
}

export async function findViolationById(id: string) {
  const supabase = await createClient();
  return supabase
    .from("violation_logs")
    .select("*, resident:residents(id, name, phone)")
    .eq("id", id)
    .single() as unknown as Promise<{
    data: ViolationWithResident | null;
    error: { message: string } | null;
  }>;
}

export async function getViolationsCountToday(): Promise<number> {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();
  const today = new Date().toISOString().split("T")[0] ?? "";

  let query = supabase
    .from("violation_logs")
    .select("id", { count: "exact", head: true })
    .gte("detected_at", `${today}T00:00:00`);

  if (orgId) query = query.eq("organization_id", orgId);

  const { count } = await query;
  return count ?? 0;
}
