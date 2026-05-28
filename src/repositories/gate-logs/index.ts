import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/tenant";
import type { GateLogWithResident, ResidentPresence } from "@/features/gate-logs/types";
import type { GateLogFilterParams } from "@/features/gate-logs/schemas";

export async function findGateLogs(params: GateLogFilterParams = {}) {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();
  const {
    resident_id,
    entry_type,
    is_late,
    date,
    date_from,
    date_to,
    search,
    page = 1,
    pageSize = 25,
  } = params;

  let query = supabase
    .from("gate_logs")
    .select("*, resident:residents(id, name, phone, type)", { count: "exact" })
    .order("timestamp", { ascending: false });

  if (orgId) query = query.eq("organization_id", orgId);

  if (resident_id) query = query.eq("resident_id", resident_id);
  if (entry_type) query = query.eq("entry_type", entry_type);
  if (is_late !== undefined) query = query.eq("is_late", is_late);
  if (date) {
    query = query.gte("timestamp", `${date}T00:00:00`);
    query = query.lte("timestamp", `${date}T23:59:59`);
  }
  if (date_from) query = query.gte("timestamp", date_from);
  if (date_to) query = query.lte("timestamp", date_to);
  if (search) {
    query = query.textSearch("notes", search, { type: "plain" });
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  return query as unknown as Promise<{
    data: GateLogWithResident[] | null;
    error: { message: string } | null;
    count: number | null;
  }>;
}

export async function createGateLog(data: {
  organization_id?: string | null;
  resident_id: string;
  entry_type: "entry" | "exit";
  timestamp?: string;
  is_late?: boolean;
  verified_by?: string;
  verified_by_name?: string;
  method?: string;
  notes?: string | null;
  override_reason?: string | null;
  overridden_by?: string | null;
}) {
  const supabase = await createClient();
  return supabase
    .from("gate_logs")
    .insert(data as never)
    .select("*, resident:residents(id, name, phone, type)")
    .single() as unknown as Promise<{
    data: GateLogWithResident | null;
    error: { message: string } | null;
  }>;
}

export async function findActiveEntryForResident(
  residentId: string,
  orgId?: string | null,
): Promise<{
  data: { id: string; timestamp: string; entry_type: string } | null;
  error: { message: string } | null;
}> {
  const supabase = await createClient();
  let query = supabase
    .from("gate_logs")
    .select("id, timestamp, entry_type")
    .eq("resident_id", residentId)
    .order("timestamp", { ascending: false })
    .limit(1);

  if (orgId) query = query.eq("organization_id", orgId);

  const { data, error } = await query.maybeSingle();

  if (error?.code === "PGRST116") return { data: null, error: null };
  return {
    data: data as { id: string; timestamp: string; entry_type: string } | null,
    error,
  };
}

// ============================================================
// OPTIMIZED: Replaces N+1 iterative query with batch fetch
// ============================================================
export async function getResidentPresence(): Promise<{
  data: ResidentPresence[] | null;
  error: { message: string } | null;
}> {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  // Fetch all active residents
  let residentQuery = supabase
    .from("residents")
    .select("id, name, phone, type")
    .eq("status", "active")
    .is("deleted_at", null);

  if (orgId) residentQuery = residentQuery.eq("organization_id", orgId);

  const { data: residents, error: residentError } = await residentQuery;

  if (residentError || !residents) {
    return { data: null, error: residentError };
  }

  const residentIds = (residents as { id: string }[]).map((r) => r.id);

  if (residentIds.length === 0) {
    return { data: [], error: null };
  }

  // BATCH: Fetch latest gate log for ALL residents in one query
  // Uses Postgres DISTINCT ON pattern via Supabase
  // We fetch the most recent log per resident in a single round-trip
  const { data: latestLogs } = await supabase
    .from("gate_logs")
    .select("resident_id, entry_type, timestamp, is_late")
    .in("resident_id", residentIds)
    .order("timestamp", { ascending: false });

  // Build a lookup map (resident_id -> latest log)
  const logMap = new Map<string, { entry_type: string; timestamp: string; is_late: boolean }>();
  if (latestLogs) {
    for (const log of latestLogs as { resident_id: string; entry_type: string; timestamp: string; is_late: boolean }[]) {
      if (!logMap.has(log.resident_id)) {
        logMap.set(log.resident_id, log);
      }
    }
  }

  const presenceData: ResidentPresence[] = (residents as { id: string; name: string; phone: string; type: string }[]).map((r) => {
    const last = logMap.get(r.id);
    return {
      resident_id: r.id,
      name: r.name,
      phone: r.phone,
      type: r.type,
      is_inside: last?.entry_type === "entry",
      last_entry: last?.entry_type === "entry" ? last.timestamp : null,
      last_exit: last?.entry_type === "exit" ? last.timestamp : null,
      is_late: last?.is_late ?? false,
    };
  });

  return { data: presenceData, error: null };
}

export async function getTodayGateStats(): Promise<{
  data: { entries: number; exits: number; late: number } | null;
  error: { message: string } | null;
}> {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();
  const today = new Date().toISOString().split("T")[0] ?? "";

  let query = supabase
    .from("gate_logs")
    .select("entry_type, is_late")
    .gte("timestamp", `${today}T00:00:00`)
    .lte("timestamp", `${today}T23:59:59`);

  if (orgId) query = query.eq("organization_id", orgId);

  const { data: logs, error } = await query;

  if (error) return { data: null, error };

  const entries = (logs as unknown as Array<Record<string, unknown>>) ?? [];
  return {
    data: {
      entries: entries.filter((l) => l.entry_type === "entry").length,
      exits: entries.filter((l) => l.entry_type === "exit").length,
      late: entries.filter((l) => l.is_late).length,
    },
    error: null,
  };
}

export async function getActiveResidentCount(): Promise<number> {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  let query = supabase
    .from("residents")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("deleted_at", null);

  if (orgId) query = query.eq("organization_id", orgId);

  const { count } = await query;
  return count ?? 0;
}

export async function updateGateLog(
  id: string,
  data: { override_reason?: string; overridden_by?: string; notes?: string; verified_by?: string; verified_by_name?: string },
) {
  const supabase = await createClient();
  return supabase
    .from("gate_logs")
    .update(data as never)
    .eq("id", id) as unknown as Promise<{ error: { message: string } | null }>;
}
