import { createClient } from "@/lib/supabase/server";
import type { AuditLog, AuditFilterParams, ActivityTimelineEvent, TimelineFilterParams } from "@/features/rbac/types";

export async function findAuditLogs(params: AuditFilterParams = {}) {
  const supabase = await createClient();
  const {
    action,
    actor_id,
    entity_type,
    entity_id,
    date_from,
    date_to,
    search,
    page = 1,
    pageSize = 25,
  } = params;

  let query = supabase
    .from("audit_logs")
    .select("*, actor:auth_users!actor_id(id, email)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (action) {
    query = query.eq("action", action);
  }
  if (actor_id) {
    query = query.eq("actor_id", actor_id);
  }
  if (entity_type) {
    query = query.eq("entity_type", entity_type);
  }
  if (entity_id) {
    query = query.eq("entity_id", entity_id);
  }
  if (date_from) {
    query = query.gte("created_at", date_from);
  }
  if (date_to) {
    query = query.lte("created_at", date_to);
  }
  if (search) {
    query = query.or(
      `actor_name.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query as unknown as Promise<{
    data: AuditLog[] | null;
    error: { message: string } | null;
    count: number | null;
  }>;
}

export async function findAuditLogById(id: string) {
  const supabase = await createClient();
  return supabase
    .from("audit_logs")
    .select("*, actor:auth_users!actor_id(id, email)")
    .eq("id", id)
    .single() as unknown as Promise<{
    data: AuditLog | null;
    error: { message: string } | null;
  }>;
}

export async function createAuditLog(data: {
  organization_id?: string | null;
  actor_id: string;
  actor_name?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}) {
  const supabase = await createClient();
  return supabase
    .from("audit_logs")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: AuditLog | null;
    error: { message: string } | null;
  }>;
}

export async function findTimelineEvents(params: TimelineFilterParams = {}) {
  const supabase = await createClient();
  const {
    entity_type,
    entity_id,
    actor_name,
    page = 1,
    pageSize = 20,
  } = params;

  let query = supabase
    .from("activity_timeline")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (entity_type) {
    query = query.eq("entity_type", entity_type);
  }
  if (entity_id) {
    query = query.eq("entity_id", entity_id);
  }
  if (actor_name) {
    query = query.ilike("actor_name", `%${actor_name}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  return query as unknown as Promise<{
    data: ActivityTimelineEvent[] | null;
    error: { message: string } | null;
    count: number | null;
  }>;
}

export async function createTimelineEvent(data: {
  audit_log_id: string;
  organization_id?: string | null;
  actor_name?: string | null;
  action_label: string;
  description: string;
  entity_type: string;
  entity_id: string;
  icon?: string | null;
  color?: string | null;
}) {
  const supabase = await createClient();
  return supabase
    .from("activity_timeline")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: ActivityTimelineEvent | null;
    error: { message: string } | null;
  }>;
}
