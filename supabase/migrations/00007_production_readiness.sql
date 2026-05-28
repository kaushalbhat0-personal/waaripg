-- Migration 00007: Production readiness - onboarding, operational indexes

-- 1. Onboarding progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_steps TEXT[] DEFAULT '{}',
  current_step TEXT DEFAULT 'welcome',
  is_completed BOOLEAN DEFAULT FALSE,
  property_name TEXT,
  property_type TEXT CHECK (property_type IN ('pg', 'hostel')),
  total_rooms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);

-- 2. Updated_at trigger for onboarding_progress
CREATE OR REPLACE FUNCTION public.update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_onboarding_progress_updated_at ON public.onboarding_progress;
CREATE TRIGGER trg_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_progress_updated_at();

-- 3. Additional performance indexes (safe — use IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_violation_logs_resolved
  ON public.violation_logs(resolved, organization_id)
  WHERE resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_violation_logs_detected_resident
  ON public.violation_logs(detected_at DESC)
  WHERE resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_allocations_active_resident
  ON public.allocations(resident_id)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_allocations_property_room
  ON public.allocations(room_id)
  WHERE is_active = TRUE;

-- 4. Health check helper function
CREATE OR REPLACE FUNCTION public.check_database_health()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  detail TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT 'connection'::TEXT, 'ok'::TEXT, 'Database is reachable'::TEXT;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'residents') THEN
    RETURN QUERY SELECT 'schema.residents'::TEXT, 'ok'::TEXT, 'Table exists'::TEXT;
  ELSE
    RETURN QUERY SELECT 'schema.residents'::TEXT, 'error'::TEXT, 'Table missing'::TEXT;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rooms') THEN
    RETURN QUERY SELECT 'schema.rooms'::TEXT, 'ok'::TEXT, 'Table exists'::TEXT;
  ELSE
    RETURN QUERY SELECT 'schema.rooms'::TEXT, 'error'::TEXT, 'Table missing'::TEXT;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gate_logs') THEN
    RETURN QUERY SELECT 'schema.gate_logs'::TEXT, 'ok'::TEXT, 'Table exists'::TEXT;
  ELSE
    RETURN QUERY SELECT 'schema.gate_logs'::TEXT, 'error'::TEXT, 'Table missing'::TEXT;
  END IF;

  IF EXISTS (
    SELECT FROM pg_tables t
    JOIN pg_class c ON t.tablename = c.relname
    WHERE t.tablename IN ('residents', 'rooms', 'gate_logs')
    AND c.relrowsecurity = TRUE
  ) THEN
    RETURN QUERY SELECT 'rls'::TEXT, 'ok'::TEXT, 'RLS is enabled on key tables'::TEXT;
  ELSE
    RETURN QUERY SELECT 'rls'::TEXT, 'warn'::TEXT, 'RLS may not be enabled on all tables'::TEXT;
  END IF;

  RETURN QUERY SELECT 'activity'::TEXT, 'ok'::TEXT, 'Health check completed'::TEXT;
END;
$$;
