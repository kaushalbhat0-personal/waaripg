import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/tenant";
import type { AttendanceSnapshot, AttendanceWithResident } from "@/features/gate-logs/types";
import type { AttendanceFilterParams } from "@/features/gate-logs/schemas";

export async function findAttendance(params: AttendanceFilterParams = {}) {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();
  const {
    resident_id,
    date,
    date_from,
    date_to,
    status,
    page = 1,
    pageSize = 25,
  } = params;

  let query = supabase
    .from("attendance_snapshots")
    .select("*, resident:residents(id, name, phone)", { count: "exact" })
    .order("snapshot_date", { ascending: false });

  if (orgId) query = query.eq("organization_id", orgId);
  if (resident_id) query = query.eq("resident_id", resident_id);
  if (date) query = query.eq("snapshot_date", date);
  if (date_from) query = query.gte("snapshot_date", date_from);
  if (date_to) query = query.lte("snapshot_date", date_to);
  if (status) query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  return query as unknown as Promise<{
    data: AttendanceWithResident[] | null;
    error: { message: string } | null;
    count: number | null;
  }>;
}

export async function findAttendanceByDate(date: string) {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();

  let query = supabase
    .from("attendance_snapshots")
    .select("*, resident:residents(id, name, phone)")
    .eq("snapshot_date", date);

  if (orgId) query = query.eq("organization_id", orgId);

  return query as unknown as Promise<{
    data: AttendanceWithResident[] | null;
    error: { message: string } | null;
  }>;
}

export async function upsertAttendance(data: {
  organization_id?: string | null;
  resident_id: string;
  snapshot_date: string;
  status: string;
  first_entry_at?: string | null;
  last_exit_at?: string | null;
  is_late?: boolean;
  late_minutes?: number | null;
}) {
  const supabase = await createClient();
  return supabase
    .from("attendance_snapshots")
    .upsert(data as never, { onConflict: "resident_id,snapshot_date" } as never)
    .select()
    .single() as unknown as Promise<{
    data: AttendanceSnapshot | null;
    error: { message: string } | null;
  }>;
}

export async function getTodayAttendanceSummary() {
  const supabase = await createClient();
  const orgId = await getCurrentOrganizationId();
  const today = new Date().toISOString().split("T")[0] ?? "";

  let query = supabase
    .from("attendance_snapshots")
    .select("status")
    .eq("snapshot_date", today);

  if (orgId) query = query.eq("organization_id", orgId);

  const { data, error } = await query;

  if (error) return { data: null, error };

  const records = (data as unknown as Array<Record<string, unknown>>) ?? [];
  return {
    data: {
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
      excused: records.filter((r) => r.status === "excused").length,
      total: records.length,
    },
    error: null,
  };
}
