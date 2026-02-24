-- Canonical lifecycle columns for hard-gated onboarding/privacy flow
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS privacy_consented_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_step INT,
  ADD COLUMN IF NOT EXISTS onboarding_flow_version TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN onboarding_status SET DEFAULT 'privacy_pending',
  ALTER COLUMN onboarding_step SET DEFAULT 1,
  ALTER COLUMN onboarding_flow_version SET DEFAULT 'v2';

UPDATE public.profiles
SET privacy_consented_at = COALESCE(privacy_consented_at, privacy_agreed_at)
WHERE privacy_consented_at IS NULL
  AND privacy_agreed_at IS NOT NULL;

UPDATE public.profiles
SET onboarding_status = CASE
  WHEN COALESCE(onboarding_completed, FALSE) THEN 'onboarding_complete'
  WHEN COALESCE(privacy_consented_at, privacy_agreed_at) IS NOT NULL THEN 'onboarding_in_progress'
  ELSE 'privacy_pending'
END
WHERE onboarding_status IS NULL;

UPDATE public.profiles
SET onboarding_step = CASE
  WHEN onboarding_status = 'onboarding_complete' THEN 6
  WHEN onboarding_status = 'onboarding_in_progress' THEN LEAST(GREATEST(COALESCE(onboarding_step, 1), 1), 6)
  ELSE 1
END
WHERE onboarding_step IS NULL
   OR onboarding_step < 1
   OR onboarding_step > 6;

UPDATE public.profiles
SET onboarding_flow_version = COALESCE(NULLIF(onboarding_flow_version, ''), 'v2')
WHERE onboarding_flow_version IS NULL
   OR onboarding_flow_version = '';

UPDATE public.profiles
SET onboarding_completed = (onboarding_status = 'onboarding_complete')
WHERE onboarding_completed IS DISTINCT FROM (onboarding_status = 'onboarding_complete');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_onboarding_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_onboarding_status_check
      CHECK (onboarding_status IN ('privacy_pending', 'onboarding_in_progress', 'onboarding_complete'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_onboarding_step_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_onboarding_step_check
      CHECK (onboarding_step BETWEEN 1 AND 6);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_onboarding_flow_version_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_onboarding_flow_version_check
      CHECK (onboarding_flow_version IN ('v1', 'v2'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status
  ON public.profiles (onboarding_status);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_flow_version
  ON public.profiles (onboarding_flow_version);

-- Atomic onboarding completion in one transactional RPC
CREATE OR REPLACE FUNCTION public.complete_onboarding_v2(
  p_name TEXT,
  p_goals TEXT[],
  p_conditions TEXT[],
  p_symptoms JSONB,
  p_last_period_start DATE,
  p_cycle_length_days INT,
  p_period_length_days INT,
  p_is_irregular BOOLEAN,
  p_period_history JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_range RECORD;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'Name must be at least 2 characters';
  END IF;

  IF p_last_period_start IS NULL THEN
    RAISE EXCEPTION 'last_period_start is required';
  END IF;

  IF p_cycle_length_days IS NULL OR p_cycle_length_days < 15 OR p_cycle_length_days > 90 THEN
    RAISE EXCEPTION 'cycle_length_days must be between 15 and 90';
  END IF;

  IF p_period_length_days IS NULL OR p_period_length_days < 1 OR p_period_length_days > 15 THEN
    RAISE EXCEPTION 'period_length_days must be between 1 and 15';
  END IF;

  UPDATE public.profiles
  SET
    full_name = trim(p_name),
    onboarding_completed = TRUE,
    onboarding_status = 'onboarding_complete',
    onboarding_step = 6,
    onboarding_flow_version = COALESCE(NULLIF(onboarding_flow_version, ''), 'v2'),
    updated_at = NOW()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;

  INSERT INTO public.user_onboarding (
    user_id,
    goals,
    conditions,
    typical_symptoms,
    tracker_mode,
    updated_at
  )
  VALUES (
    v_user_id,
    COALESCE(p_goals, '{}'),
    COALESCE(p_conditions, '{}'),
    CASE WHEN jsonb_typeof(p_symptoms) = 'array' THEN p_symptoms ELSE '[]'::JSONB END,
    'menstruation',
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    goals = EXCLUDED.goals,
    conditions = EXCLUDED.conditions,
    typical_symptoms = EXCLUDED.typical_symptoms,
    tracker_mode = COALESCE(public.user_onboarding.tracker_mode, EXCLUDED.tracker_mode),
    updated_at = NOW();

  INSERT INTO public.user_cycle_settings (
    user_id,
    last_period_start,
    cycle_length_days,
    period_length_days,
    is_irregular,
    updated_at
  )
  VALUES (
    v_user_id,
    p_last_period_start,
    p_cycle_length_days,
    p_period_length_days,
    COALESCE(p_is_irregular, FALSE),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    last_period_start = EXCLUDED.last_period_start,
    cycle_length_days = EXCLUDED.cycle_length_days,
    period_length_days = EXCLUDED.period_length_days,
    is_irregular = EXCLUDED.is_irregular,
    updated_at = NOW();

  IF jsonb_typeof(COALESCE(p_period_history, '[]'::JSONB)) = 'array' THEN
    FOR v_range IN
      SELECT
        start_date::DATE AS start_date,
        end_date::DATE AS end_date
      FROM jsonb_to_recordset(COALESCE(p_period_history, '[]'::JSONB))
        AS r(start_date TEXT, end_date TEXT)
    LOOP
      CONTINUE WHEN v_range.start_date IS NULL
        OR v_range.end_date IS NULL
        OR v_range.end_date < v_range.start_date;

      INSERT INTO public.daily_logs (
        user_id,
        date,
        is_period,
        flow_intensity,
        updated_at
      )
      SELECT
        v_user_id,
        gs::DATE,
        TRUE,
        'Normal',
        NOW()
      FROM generate_series(v_range.start_date, v_range.end_date, INTERVAL '1 day') AS gs
      ON CONFLICT (user_id, date) DO UPDATE
      SET
        is_period = EXCLUDED.is_period,
        flow_intensity = COALESCE(public.daily_logs.flow_intensity, EXCLUDED.flow_intensity),
        updated_at = NOW();
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'nextRoute', '/cycle-sync'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_onboarding_v2(
  TEXT,
  TEXT[],
  TEXT[],
  JSONB,
  DATE,
  INT,
  INT,
  BOOLEAN,
  JSONB
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.complete_onboarding_v2(
  TEXT,
  TEXT[],
  TEXT[],
  JSONB,
  DATE,
  INT,
  INT,
  BOOLEAN,
  JSONB
) TO authenticated;
