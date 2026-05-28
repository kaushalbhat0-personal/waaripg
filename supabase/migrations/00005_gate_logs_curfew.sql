-- Gate Logs & Entry Management System
-- Migration 00005: Gate logs, curfew rules, attendance, violations

-- ============================================================
-- ENHANCED GATE LOGS
-- ============================================================
create type public.entry_type as enum ('entry', 'exit');

create table if not exists public.gate_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  resident_id uuid not null references public.residents(id),
  entry_type entry_type not null,
  timestamp timestamptz not null default now(),
  is_late boolean not null default false,
  verified_by uuid references auth.users(id),
  verified_by_name text,
  method text not null default 'manual' check (method in ('manual', 'qr', 'rfid', 'biometric', 'face')),
  notes text,
  override_reason text,
  overridden_by uuid references auth.users(id),
  metadata jsonb,
  created_at timestamptz not null default now(),

  -- Immutable constraint
  constraint gate_logs_immutable check (created_at = created_at)
);

create index idx_gate_logs_resident on public.gate_logs(resident_id);
create index idx_gate_logs_timestamp on public.gate_logs(timestamp desc);
create index idx_gate_logs_type on public.gate_logs(entry_type);
create index idx_gate_logs_late on public.gate_logs(is_late);
create index idx_gate_logs_resident_type on public.gate_logs(resident_id, entry_type);
create index idx_gate_logs_org on public.gate_logs(organization_id);
create index idx_gate_logs_date on public.gate_logs(((timestamp AT TIME ZONE 'UTC')::date));

-- ============================================================
-- CURFEW RULES
-- ============================================================
create table if not exists public.curfew_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  name text not null,
  resident_type text check (resident_type in ('pg', 'hostel', 'all')),
  room_type text,
  property_id uuid references public.properties(id),
  curfew_time time not null,
  grace_period_minutes int not null default 30,
  applicable_days int[] not null default '{1,2,3,4,5,6,7}', -- 1=Mon .. 7=Sun
  is_active boolean not null default true,
  penalty_amount numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_curfew_rules_org on public.curfew_rules(organization_id);
create index idx_curfew_rules_active on public.curfew_rules(is_active);

-- ============================================================
-- ATTENDANCE SNAPSHOTS (daily presence)
-- ============================================================
create type public.attendance_status as enum (
  'present',
  'absent',
  'late',
  'excused',
  'unknown'
);

create table if not exists public.attendance_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  resident_id uuid not null references public.residents(id),
  snapshot_date date not null default current_date,
  status attendance_status not null default 'unknown',
  first_entry_at timestamptz,
  last_exit_at timestamptz,
  is_late boolean not null default false,
  late_minutes int,
  violation_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(resident_id, snapshot_date)
);

create index idx_attendance_date on public.attendance_snapshots(snapshot_date);
create index idx_attendance_resident on public.attendance_snapshots(resident_id);
create index idx_attendance_status on public.attendance_snapshots(status);
create index idx_attendance_org on public.attendance_snapshots(organization_id);

-- ============================================================
-- VIOLATION LOGS
-- ============================================================
create type public.violation_type as enum (
  'late_entry',
  'missing_checkout',
  'unauthorized_access',
  'curfew_breach',
  'repeat_offense'
);

create type public.violation_severity as enum ('low', 'medium', 'high', 'critical');

create table if not exists public.violation_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  resident_id uuid not null references public.residents(id),
  violation_type violation_type not null,
  severity violation_severity not null default 'medium',
  gate_log_id uuid references public.gate_logs(id),
  description text not null,
  detected_at timestamptz not null default now(),
  penalty_amount numeric(10,2),
  resolved boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),

  constraint violation_logs_immutable check (created_at = created_at)
);

create index idx_violations_resident on public.violation_logs(resident_id);
create index idx_violations_type on public.violation_logs(violation_type);
create index idx_violations_detected on public.violation_logs(detected_at desc);
create index idx_violations_org on public.violation_logs(organization_id);
create index idx_violations_resolved on public.violation_logs(resolved);

-- ============================================================
-- FUNCTION: Get current presence for a resident
-- ============================================================
create or replace function public.get_resident_presence(p_resident_id uuid)
returns boolean as $$
declare
  v_active_entry boolean;
begin
  select exists(
    select 1 from public.gate_logs
    where resident_id = p_resident_id
      and entry_type = 'entry'
      and timestamp > coalesce(
        (select max(timestamp) from public.gate_logs
         where resident_id = p_resident_id and entry_type = 'exit'),
        '1970-01-01'::timestamptz
      )
  ) into v_active_entry;
  return v_active_entry;
end;
$$ language plpgsql stable;

-- ============================================================
-- FUNCTION: Auto-generate daily attendance snapshot
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
begin
  for v_resident in (
    select r.id, r.type as resident_type
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

    insert into public.attendance_snapshots
      (organization_id, resident_id, snapshot_date, status, first_entry_at, last_exit_at, is_late, late_minutes)
    values
      ((select organization_id from public.residents where id = v_resident.id),
       v_resident.id, p_date, v_status, v_first_entry, v_last_exit, v_is_late, v_late_minutes)
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
