-- Onboarding Progress RLS Policies
-- Migration 00011: Enable RLS and add user-scoped policies

-- Enable RLS (safe: no-op if already enabled)
alter table public.onboarding_progress enable row level security;

-- ============================================================
-- POLICY: Users can SELECT their own onboarding progress
-- ============================================================
create policy "Users can view own onboarding progress"
  on public.onboarding_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- POLICY: Users can INSERT their own onboarding progress
-- ============================================================
create policy "Users can create own onboarding progress"
  on public.onboarding_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- POLICY: Users can UPDATE their own onboarding progress
-- ============================================================
create policy "Users can update own onboarding progress"
  on public.onboarding_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- POLICY: Admin service-role can manage all rows (if needed)
-- ============================================================
create policy "Service role can manage all onboarding progress"
  on public.onboarding_progress
  for all
  to service_role
  using (true)
  with check (true);
