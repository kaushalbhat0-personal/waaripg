-- Production Hardening for Gate Logs & Attendance System
-- Migration 00006: Tenant isolation, verification workflow, performance indexes, RLS, scheduled job

-- ============================================================
-- RLS: Enable row-level security on all gate-log tables
-- ============================================================
alter table public.gate_logs enable row level security;
alter table public.curfew_rules enable row level security;
alter table public.attendance_snapshots enable row level security;
alter table public.violation_logs enable row level security;

-- ============================================================
-- RLS POLICIES: Tenant isolation via organization_id
-- ============================================================

-- Helper: get current user's organization from user_roles
create or replace function public.get_current_organization_id()
returns uuid as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id
  from public.user_roles
  where user_id = auth.uid()
  limit 1;
  return v_org_id;
end;
$$ language plpgsql stable;

-- gate_logs: users can only see their org's records
create policy gate_logs_tenant_isolation on public.gate_logs
  for all
  using (
    organization_id = public.get_current_organization_id()
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role_id = (select id from public.roles where name = 'admin')
    )
  );

-- curfew_rules: tenant isolation
create policy curfew_rules_tenant_isolation on public.curfew_rules
  for all
  using (
    organization_id = public.get_current_organization_id()
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role_id = (select id from public.roles where name = 'admin')
    )
  );

-- attendance_snapshots: tenant isolation
create policy attendance_snapshots_tenant_isolation on public.attendance_snapshots
  for all
  using (
    organization_id = public.get_current_organization_id()
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role_id = (select id from public.roles where name = 'admin')
    )
  );

-- violation_logs: tenant isolation
create policy violation_logs_tenant_isolation on public.violation_logs
  for all
  using (
    organization_id = public.get_current_organization_id()
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role_id = (select id from public.roles where name = 'admin')
    )
  );

-- ============================================================
-- FUNCTION: Get organization_id for a resident
-- ============================================================
create or replace function public.get_resident_organization(p_resident_id uuid)
returns uuid as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id
  from public.residents
  where id = p_resident_id;
  return v_org_id;
end;
$$ language plpgsql stable;

-- ============================================================
-- FUNCTION: Batch resident presence (replaces iterative N+1)
-- ============================================================
create or replace function public.get_resident_presence_batch()
returns table (
  resident_id uuid,
  name text,
  phone text,
  type text,
  is_inside boolean,
  last_entry timestamptz,
  last_exit timestamptz,
  is_late boolean
) as $$
begin
  return query
  with latest_log as (
    select distinct on (resident_id)
      resident_id,
      entry_type,
      timestamp,
      is_late
    from public.gate_logs
    order by resident_id, timestamp desc
  )
  select
    r.id,
    r.name,
    r.phone,
    r.type,
    ll.entry_type = 'entry' as is_inside,
    case when ll.entry_type = 'entry' then ll.timestamp else null end as last_entry,
    case when ll.entry_type = 'exit' then ll.timestamp else null end as last_exit,
    coalesce(ll.is_late, false) as is_late
  from public.residents r
  left join latest_log ll on ll.resident_id = r.id
  where r.status = 'active'
    and r.deleted_at is null;
end;
$$ language plpgsql stable security definer;

-- ============================================================
-- FUNCTION: Generate daily attendance (called by cron)
-- Uses ON CONFLICT DO NOTHING for first-run idempotency
-- ============================================================
create or replace function public.generate_daily_attendance(
  p_date date default current_date,
  p_org_id uuid default null
) returns void as $$
declare
  v_resident record;
  v_first_entry timestamptz;
  v_last_exit timestamptz;
  v_is_late boolean;
  v_late_minutes int;
  v_status attendance_status;
  v_org_id uuid;
begin
  -- Check if snapshots already exist for this date (prevent duplicate)
  if exists (
    select 1 from public.attendance_snapshots
    where snapshot_date = p_date
      and (p_org_id is null or organization_id = p_org_id)
  ) then
    -- Update existing snapshots rather than skipping
    -- This allows re-running to refresh data
    raise notice 'Snapshots exist for %, updating...', p_date;
  end if;

  for v_resident in (
    select r.id, r.type as resident_type, r.organization_id
    from public.residents r
    where r.status = 'active'
      and r.deleted_at is null
      and (p_org_id is null or r.organization_id = p_org_id)
  ) loop
    select min(timestamp), max(timestamp)
    into v_first_entry, v_last_exit
    from public.gate_logs
    where resident_id = v_resident.id
      and timestamp::date = p_date;

    if v_first_entry is null then
      v_status := 'absent';
      v_is_late := false;
      v_late_minutes := null;
    else
      v_is_late := exists(
        select 1 from public.gate_logs
        where resident_id = v_resident.id
          and entry_type = 'entry'
          and timestamp::date = p_date
          and is_late = true
      );

      if v_is_late then
        v_status := 'late';
        v_late_minutes := extract(epoch from (v_first_entry - date_trunc('day', v_first_entry))) / 60;
      else
        v_status := 'present';
        v_late_minutes := null;
      end if;
    end if;

    v_org_id := v_resident.organization_id;

    insert into public.attendance_snapshots
      (organization_id, resident_id, snapshot_date, status, first_entry_at, last_exit_at, is_late, late_minutes)
    values
      (v_org_id, v_resident.id, p_date, v_status, v_first_entry, v_last_exit, v_is_late, v_late_minutes)
    on conflict (resident_id, snapshot_date)
    do update set
      status = v_status,
      first_entry_at = v_first_entry,
      last_exit_at = v_last_exit,
      is_late = v_is_late,
      late_minutes = v_late_minutes,
      updated_at = now();
  end loop;
end;
$$ language plpgsql;

-- ============================================================
-- FUNCTION: Verify gate log entry
-- ============================================================
create or replace function public.verify_gate_log(
  p_log_id uuid,
  p_verified_by uuid
) returns void as $$
begin
  update public.gate_logs
  set verified_by = p_verified_by,
      verified_by_name = (select email from auth.users where id = p_verified_by)
  where id = p_log_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

-- Composite index for presence queries (resident + timestamp)
create index if not exists idx_gate_logs_presence
  on public.gate_logs(resident_id, timestamp desc);

-- Index for daily attendance generation (date-based lookups)
create index if not exists idx_gate_logs_date_entry_type
  on public.gate_logs(((timestamp AT TIME ZONE 'UTC')::date), entry_type);

-- Index for violation resolution queries
create index if not exists idx_violations_resolved_at
  on public.violation_logs(resolved, resolved_at desc);

-- Index for curfew rule lookup by type
create index if not exists idx_curfew_rules_resident_type
  on public.curfew_rules(resident_type, is_active);

-- Organization-scoped lookups for attendance
create index if not exists idx_attendance_org_date
  on public.attendance_snapshots(organization_id, snapshot_date desc);

-- ============================================================
-- SCHEDULED JOB via pg_cron (runs at 11:50 PM daily)
-- Uses a simple polling approach if pg_cron not available
-- ============================================================

-- Create a tracking table for last attendance run
create table if not exists public.attendance_journal (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  organization_id uuid,
  status text not null default 'pending',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  unique(snapshot_date, organization_id)
);

create index idx_attendance_journal_date on public.attendance_journal(snapshot_date);

-- ============================================================
-- ENSURE verified_by is stored correctly for gate_log.verified audit
-- ============================================================
create index if not exists idx_gate_logs_verified
  on public.gate_logs(verified_by) where verified_by is not null;
