-- Migration: Onboarding V2 Schema Updates (Data Collection)

-- 1. Create user_lifestyle table
CREATE TABLE IF NOT EXISTS public.user_lifestyle (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    diet_preference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_lifestyle
ALTER TABLE public.user_lifestyle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lifestyle data"
    ON public.user_lifestyle FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lifestyle data"
    ON public.user_lifestyle FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lifestyle data"
    ON public.user_lifestyle FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. Add privacy_consented_at to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='privacy_consented_at') THEN
        ALTER TABLE public.profiles ADD COLUMN privacy_consented_at TIMESTAMPTZ;
    END IF;
END
$$;

-- 3. Update the complete_onboarding_v2 RPC to accept new fields
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

  -- 1. Update Profile (name + onboarding status only — no goals here)
  UPDATE public.profiles
  SET
    full_name = trim(p_name),
    onboarding_completed = TRUE,
    onboarding_status = 'onboarding_complete',
    onboarding_step = 4,
    onboarding_flow_version = 'v2',
    updated_at = NOW()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;

  -- 2. Insert/Update user_onboarding (goals, conditions, symptoms)
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

  -- 3. Insert/Update user_cycle_settings
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

  -- 4. Expand period history ranges into daily_logs
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
