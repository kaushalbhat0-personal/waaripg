-- Admin Bootstrap & Role Assignment
-- Migration 00010: Views, functions, indexes, trigger
-- Depends on 00009 for the user.onboarded enum value

-- ============================================================
-- ADMIN USERS VIEW
-- A safe view of auth.users for RBAC management.
-- Only exposes necessary fields; never exposes hashed passwords.
-- ============================================================
create or replace view public.admin_users
with (security_invoker = true)
as
select
  id,
  email,
  raw_user_meta_data ->> 'name' as name,
  raw_user_meta_data ->> 'phone' as phone,
  raw_user_meta_data ->> 'avatar_url' as avatar_url,
  case when raw_user_meta_data ->> 'is_active' = 'false' then false else true end as is_active,
  created_at,
  last_sign_in_at
from auth.users;

comment on view public.admin_users is 'Safe view of auth.users for RBAC management';

-- ============================================================
-- FUNCTION: Get a user's current role (name + id)
-- Returns null if the user has no role assigned.
-- ============================================================
create or replace function public.get_user_role(p_user_id uuid)
returns table (
  role_id uuid,
  role_name public.role_name,
  organization_id uuid
)
language plpgsql
stable
security definer
as $$
begin
  return query
  select
    ur.role_id,
    r.name,
    ur.organization_id
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = p_user_id
  limit 1;
end;
$$;

comment on function public.get_user_role is 'Returns the current role for a user, or empty if unassigned';

-- ============================================================
-- FUNCTION: Safe, idempotent role assignment
--
-- Features:
--   - Idempotent (skips if user already has the role)
--   - Validates role existence
--   - Validates that the target user exists in auth.users
--   - Returns the user_roles record
--   - No RLS bypass — intended to be called via service_role
-- ============================================================
create or replace function public.assign_user_role_safe(
  p_user_id uuid,
  p_role_name text,
  p_organization_id uuid default null,
  p_assigned_by uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_role_id uuid;
  v_existing_id uuid;
  v_result jsonb;
begin
  -- Validate role exists
  select id into v_role_id
  from public.roles
  where name = p_role_name::public.role_name;

  if v_role_id is null then
    return jsonb_build_object(
      'success', false,
      'error', format('Role "%s" does not exist', p_role_name)
    );
  end if;

  -- Check for duplicate assignment
  select id into v_existing_id
  from public.user_roles
  where user_id = p_user_id
    and role_id = v_role_id;

  if v_existing_id is not null then
    -- Already assigned — idempotent: return existing
    return jsonb_build_object(
      'success', true,
      'data', jsonb_build_object('id', v_existing_id, 'already_exists', true)
    );
  end if;

  -- Insert the role assignment
  insert into public.user_roles (user_id, role_id, organization_id, assigned_by)
  values (p_user_id, v_role_id, p_organization_id, p_assigned_by)
  returning id into v_existing_id;

  return jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('id', v_existing_id, 'already_exists', false)
  );
end;
$$;

comment on function public.assign_user_role_safe is 'Idempotent role assignment with validation. Call via service_role.';

-- ============================================================
-- FUNCTION: Bootstrap first admin user
--
--   Assigns admin role to the given user IF no admin currently
--   exists in the system.
--
-- Safety guarantees:
--   - Advisory lock to prevent race conditions (only one
--     bootstrap succeeds)
--   - Checks for ANY existing admin role assignment
--   - Idempotent — user keeps admin if already assigned
--   - Returns structured result
-- ============================================================
create or replace function public.bootstrap_first_admin(
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_admin_role_id uuid;
  v_admin_count bigint;
  v_existing_id uuid;
  v_lock_obtained boolean;
begin
  -- Acquire advisory lock (key = 0xADM1NB00T)
  select pg_try_advisory_xact_lock(2918384756) into v_lock_obtained;
  if not v_lock_obtained then
    return jsonb_build_object(
      'success', false,
      'error', 'Concurrent bootstrap attempt — try again'
    );
  end if;

  -- Get admin role ID
  select id into v_admin_role_id
  from public.roles
  where name = 'admin';

  if v_admin_role_id is null then
    return jsonb_build_object(
      'success', false,
      'error', 'Admin role not found — run migrations'
    );
  end if;

  -- Check if admin already exists
  select count(*) into v_admin_count
  from public.user_roles
  where role_id = v_admin_role_id;

  if v_admin_count > 0 then
    -- Admin already exists; check if this user is already one
    select id into v_existing_id
    from public.user_roles
    where user_id = p_user_id
      and role_id = v_admin_role_id;

    if v_existing_id is not null then
      return jsonb_build_object(
        'success', true,
        'data', jsonb_build_object('id', v_existing_id, 'already_exists', true, 'bootstrapped', false)
      );
    end if;

    return jsonb_build_object(
      'success', false,
      'error', 'Admin already exists — contact your system administrator'
    );
  end if;

  -- No admin exists — assign this user as admin
  insert into public.user_roles (user_id, role_id, assigned_by)
  values (p_user_id, v_admin_role_id, p_user_id)
  returning id into v_existing_id;

  return jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('id', v_existing_id, 'already_exists', false, 'bootstrapped', true)
  );
end;
$$;

comment on function public.bootstrap_first_admin is 'Assigns admin role to the first user. Uses advisory locks for race-condition safety.';

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_user_roles_role on public.user_roles(role_id);

-- ============================================================
-- TRIGGER: Auto-create timeline event for user.onboarded
-- ============================================================
create or replace function public.handle_onboarded_audit()
returns trigger as $$
begin
  insert into public.activity_timeline (
    audit_log_id,
    actor_name,
    action_label,
    description,
    entity_type,
    entity_id,
    icon,
    color
  )
  select
    new.id,
    new.actor_name,
    'User Onboarded',
    case
      when new.metadata ->> 'role_name' = 'admin' then 'First admin onboarded'
      else format('User assigned %s role', new.metadata ->> 'role_name')
    end,
    new.entity_type,
    new.entity_id,
    'UserCheck',
    'green'
  where new.action = 'user.onboarded';
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_onboarded_audit_to_timeline
  after insert on public.audit_logs
  for each row
  when (new.action = 'user.onboarded')
  execute function public.handle_onboarded_audit();
