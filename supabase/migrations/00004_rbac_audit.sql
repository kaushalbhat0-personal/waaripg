-- RBAC + Audit Logging System
-- Migration 00004: Roles, Permissions, Audit Logs, Activity Timeline

-- ============================================================
-- ROLES
-- ============================================================
create type public.role_name as enum ('admin', 'manager', 'accountant', 'guard');

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name role_name not null unique,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PERMISSIONS
-- ============================================================
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  module text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROLE PERMISSIONS (mapping)
-- ============================================================
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

create index idx_role_permissions_role on public.role_permissions(role_id);
create index idx_role_permissions_permission on public.role_permissions(permission_id);

-- ============================================================
-- USER ROLES (maps auth.users to roles, tenant-aware)
-- ============================================================
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  organization_id uuid,
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(user_id, role_id)
);

create index idx_user_roles_user on public.user_roles(user_id);
create index idx_user_roles_org on public.user_roles(organization_id);

-- ============================================================
-- AUDIT LOGS (immutable)
-- ============================================================
create type public.audit_action as enum (
  'resident.created',
  'resident.updated',
  'resident.archived',
  'room.created',
  'room.updated',
  'room.archived',
  'bed.created',
  'bed.updated',
  'bed.status_changed',
  'allocation.created',
  'allocation.updated',
  'allocation.transferred',
  'allocation.ended',
  'invoice.created',
  'invoice.updated',
  'invoice.cancelled',
  'payment.recorded',
  'payment.refunded',
  'charge.created',
  'charge.updated',
  'gate_log.created',
  'gate_log.verified',
  'role.assigned',
  'role.revoked',
  'permission.updated',
  'settings.updated',
  'user.login',
  'user.logout'
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  actor_id uuid not null references auth.users(id),
  actor_name text,
  action audit_action not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),

  -- Immutable constraint: no updates allowed
  constraint audit_logs_immutable check (created_at = created_at)
);

-- Preventing updates/deletes via trigger
create or replace function public.prevent_audit_log_mutations()
returns trigger as $$
begin
  raise exception 'audit_logs are immutable: insert only';
end;
$$ language plpgsql;

create trigger trg_prevent_audit_update
  before update on public.audit_logs
  for each row execute function public.prevent_audit_log_mutations();

create trigger trg_prevent_audit_delete
  before delete on public.audit_logs
  for each row execute function public.prevent_audit_log_mutations();

create index idx_audit_logs_org on public.audit_logs(organization_id);
create index idx_audit_logs_actor on public.audit_logs(actor_id);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

-- ============================================================
-- ACTIVITY TIMELINE (human-readable, derived from audit_logs)
-- ============================================================
create table if not exists public.activity_timeline (
  id uuid primary key default gen_random_uuid(),
  audit_log_id uuid not null references public.audit_logs(id) on delete cascade,
  organization_id uuid,
  actor_name text,
  action_label text not null,
  description text not null,
  entity_type text not null,
  entity_id text not null,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create index idx_timeline_org on public.activity_timeline(organization_id);
create index idx_timeline_entity on public.activity_timeline(entity_type, entity_id);
create index idx_timeline_created on public.activity_timeline(created_at desc);

-- ============================================================
-- SEED DATA: Permissions
-- ============================================================
insert into public.permissions (code, name, description, module) values
  -- residents
  ('residents.create', 'Create Residents', 'Create new resident records', 'residents'),
  ('residents.update', 'Update Residents', 'Modify resident information', 'residents'),
  ('residents.delete', 'Delete Residents', 'Archive or remove residents', 'residents'),
  ('residents.view', 'View Residents', 'View resident profiles and lists', 'residents'),
  -- rooms
  ('rooms.create', 'Create Rooms', 'Add new rooms', 'rooms'),
  ('rooms.update', 'Update Rooms', 'Modify room details', 'rooms'),
  ('rooms.delete', 'Delete Rooms', 'Archive or remove rooms', 'rooms'),
  ('rooms.view', 'View Rooms', 'View room details and lists', 'rooms'),
  -- beds
  ('beds.create', 'Create Beds', 'Add beds to rooms', 'beds'),
  ('beds.update', 'Update Beds', 'Modify bed status and details', 'beds'),
  ('beds.delete', 'Delete Beds', 'Remove beds', 'beds'),
  -- allocations
  ('allocations.create', 'Create Allocations', 'Allocate beds to residents', 'allocations'),
  ('allocations.update', 'Update Allocations', 'Modify allocations', 'allocations'),
  ('allocations.delete', 'Delete Allocations', 'End or remove allocations', 'allocations'),
  ('allocations.transfer', 'Transfer Allocations', 'Transfer residents between rooms/beds', 'allocations'),
  -- invoices
  ('invoices.create', 'Create Invoices', 'Generate new invoices', 'invoices'),
  ('invoices.update', 'Update Invoices', 'Modify invoice details', 'invoices'),
  ('invoices.delete', 'Delete Invoices', 'Cancel or remove invoices', 'invoices'),
  ('invoices.view', 'View Invoices', 'View invoice details', 'invoices'),
  ('invoices.generate', 'Generate Invoices', 'Auto-generate invoices from charges', 'invoices'),
  -- payments
  ('payments.record', 'Record Payments', 'Record incoming payments', 'payments'),
  ('payments.refund', 'Refund Payments', 'Process refunds', 'payments'),
  ('payments.view', 'View Payments', 'View payment records', 'payments'),
  ('payments.delete', 'Delete Payments', 'Remove payment records', 'payments'),
  -- charges
  ('charges.create', 'Create Charges', 'Add charge templates', 'charges'),
  ('charges.update', 'Update Charges', 'Modify charge templates', 'charges'),
  ('charges.delete', 'Delete Charges', 'Remove charge templates', 'charges'),
  ('charges.view', 'View Charges', 'View charge templates', 'charges'),
  -- gate logs
  ('gate-logs.create', 'Create Gate Logs', 'Record entry/exit', 'gate-logs'),
  ('gate-logs.view', 'View Gate Logs', 'View gate entry records', 'gate-logs'),
  ('gate-logs.verify', 'Verify Gate Logs', 'Approve late entries', 'gate-logs'),
  -- rbac
  ('roles.manage', 'Manage Roles', 'Create, assign, and modify roles', 'rbac'),
  ('audit-logs.view', 'View Audit Logs', 'Access audit log records', 'rbac'),
  -- settings
  ('settings.view', 'View Settings', 'View system settings', 'settings'),
  ('settings.update', 'Update Settings', 'Modify system settings', 'settings')
on conflict (code) do nothing;

-- ============================================================
-- SEED DATA: Roles
-- ============================================================
insert into public.roles (name, description) values
  ('admin', 'Full system access. Manage users, roles, and all operations.'),
  ('manager', 'Day-to-day operations. Manage residents, rooms, allocations, and gate logs.'),
  ('accountant', 'Financial operations. Manage invoices, payments, charges, and view audit logs.'),
  ('guard', 'Gate operations. Record entry/exit and view resident information.')
on conflict (name) do nothing;

-- ============================================================
-- SEED DATA: Role-Permission Mappings
-- ============================================================
do $$
declare
  admin_id uuid;
  manager_id uuid;
  accountant_id uuid;
  guard_id uuid;
begin
  select id into admin_id from public.roles where name = 'admin';
  select id into manager_id from public.roles where name = 'manager';
  select id into accountant_id from public.roles where name = 'accountant';
  select id into guard_id from public.roles where name = 'guard';

  -- Admin: all permissions
  insert into public.role_permissions (role_id, permission_id)
  select admin_id, id from public.permissions
  on conflict do nothing;

  -- Manager: residents, rooms, beds, allocations, gate-logs, settings.view
  insert into public.role_permissions (role_id, permission_id)
  select manager_id, id from public.permissions
  where code in (
    'residents.create', 'residents.update', 'residents.view',
    'rooms.create', 'rooms.update', 'rooms.view',
    'beds.create', 'beds.update',
    'allocations.create', 'allocations.update', 'allocations.transfer',
    'gate-logs.create', 'gate-logs.view', 'gate-logs.verify',
    'settings.view'
  )
  on conflict do nothing;

  -- Accountant: invoices, payments, charges, audit-logs.view
  insert into public.role_permissions (role_id, permission_id)
  select accountant_id, id from public.permissions
  where code in (
    'invoices.create', 'invoices.update', 'invoices.view', 'invoices.generate',
    'payments.record', 'payments.refund', 'payments.view',
    'charges.create', 'charges.update', 'charges.view',
    'audit-logs.view'
  )
  on conflict do nothing;

  -- Guard: gate-logs, residents.view
  insert into public.role_permissions (role_id, permission_id)
  select guard_id, id from public.permissions
  where code in (
    'gate-logs.create', 'gate-logs.view',
    'residents.view'
  )
  on conflict do nothing;
end;
$$;

-- ============================================================
-- FUNCTION: Check user permission
-- ============================================================
create or replace function public.has_permission(
  p_user_id uuid,
  p_permission text
) returns boolean as $$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = p_user_id
      and p.code = p_permission
  );
end;
$$ language plpgsql stable security definer;
