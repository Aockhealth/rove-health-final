-- backend/supabase/migrations/099_security_hardening.sql

-- 1. Enable pgcrypto for future encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Harden SECURITY DEFINER functions with auth checks

-- 2.1 batch_mark_period_range
CREATE OR REPLACE FUNCTION batch_mark_period_range(
    user_id_param UUID,
    start_date DATE,
    end_date DATE,
    flow_intensity_param TEXT DEFAULT 'Normal'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    days_affected INT;
BEGIN
    IF (auth.uid() IS NULL OR auth.uid() <> user_id_param) THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch or not authenticated';
    END IF;

    -- Batch upsert all days in range
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date
    ),
    upserted AS (
        INSERT INTO daily_logs (user_id, date, is_period, flow_intensity, created_at, updated_at)
        SELECT 
            user_id_param,
            date,
            true,
            flow_intensity_param,
            NOW(),
            NOW()
        FROM date_series
        ON CONFLICT (user_id, date)
        DO UPDATE SET
            is_period = true,
            flow_intensity = flow_intensity_param,
            updated_at = NOW()
        RETURNING 1
    )
    SELECT COUNT(*) INTO days_affected FROM upserted;
    
    -- Invalidate cache for affected dates
    DELETE FROM cycle_intelligence_cache
    WHERE user_id = user_id_param
      AND date BETWEEN start_date AND end_date;
    
    RETURN json_build_object(
        'success', true,
        'days_updated', days_affected,
        'start_date', start_date,
        'end_date', end_date
    );
END;
$$;

-- 2.2 get_insights_aggregated
CREATE OR REPLACE FUNCTION get_insights_aggregated(
    user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    cycle_settings RECORD;
BEGIN
    IF (auth.uid() IS NULL OR auth.uid() <> user_id_param) THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch or not authenticated';
    END IF;

    -- Get cycle settings
    SELECT 
        last_period_start,
        cycle_length_days,
        period_length_days,
        is_irregular
    INTO cycle_settings
    FROM user_cycle_settings
    WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'No cycle settings found');
    END IF;
    
    -- Aggregate all insights in one query
    WITH logs AS (
        SELECT 
            date,
            symptoms,
            moods,
            sleep_quality,
            disruptors,
            exercise_types,
            notes,
            is_period
        FROM daily_logs
        WHERE user_id = user_id_param
          AND date >= CURRENT_DATE - INTERVAL '90 days'
    ),
    period_streaks AS (
        SELECT
            date,
            CASE
                WHEN lag(date) OVER (ORDER BY date) = date - INTERVAL '1 day' THEN NULL
                ELSE date
            END AS streak_start
        FROM logs
        WHERE is_period IS TRUE
    ),
    logs_with_start AS (
        SELECT
            l.*,
            MAX(ps.streak_start) OVER (ORDER BY l.date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS latest_streak_start
        FROM logs l
        LEFT JOIN period_streaks ps ON ps.date = l.date
    ),
    calc_base AS (
        SELECT
            lws.*,
            COALESCE(
                lws.latest_streak_start,
                CASE WHEN cycle_settings.last_period_start <= lws.date THEN cycle_settings.last_period_start ELSE NULL END
            ) AS effective_start,
            COALESCE(cycle_settings.cycle_length_days, 28) AS cycle_len,
            COALESCE(cycle_settings.period_length_days, 5) AS period_len
        FROM logs_with_start lws
    ),
    phase_calculations AS (
        SELECT 
            date,
            symptoms,
            moods,
            sleep_quality,
            disruptors,
            exercise_types,
            notes,
            is_period,
            CASE WHEN effective_start IS NULL THEN NULL ELSE (date - effective_start) END AS diff_days,
            CASE WHEN effective_start IS NULL THEN NULL ELSE ((date - effective_start) % cycle_len) + 1 END AS cycle_day,
            CASE 
                WHEN is_period IS TRUE THEN 'Menstrual'
                WHEN effective_start IS NULL THEN NULL
                WHEN date <= CURRENT_DATE AND (date - effective_start) >= cycle_len THEN 'Luteal'
                WHEN ((date - effective_start) % cycle_len) + 1 <= period_len
                     AND is_period IS DISTINCT FROM FALSE THEN 'Menstrual'
                WHEN ((date - effective_start) % cycle_len) + 1 < cycle_len - 15 THEN 'Follicular'
                WHEN ((date - effective_start) % cycle_len) + 1 <= cycle_len - 13 THEN 'Ovulatory'
                ELSE 'Luteal'
            END AS phase
        FROM calc_base
    ),
    phase_counts AS (
        SELECT 
            phase,
            COUNT(*) as count
        FROM phase_calculations
        WHERE phase IS NOT NULL
        GROUP BY phase
    ),
    symptom_aggregation AS (
        SELECT 
            phase,
            jsonb_object_agg(
                symptom,
                symptom_count
            ) as symptoms
        FROM (
            SELECT 
                phase,
                unnest(symptoms) as symptom,
                COUNT(*) as symptom_count
            FROM phase_calculations
            WHERE phase IS NOT NULL
              AND symptoms IS NOT NULL AND array_length(symptoms, 1) > 0
            GROUP BY phase, symptom
        ) s
        GROUP BY phase
    ),
    mood_aggregation AS (
        SELECT 
            phase,
            jsonb_object_agg(
                mood,
                mood_count
            ) as moods
        FROM (
            SELECT 
                phase,
                unnest(moods) as mood,
                COUNT(*) as mood_count
            FROM phase_calculations
            WHERE phase IS NOT NULL
              AND moods IS NOT NULL AND array_length(moods, 1) > 0
            GROUP BY phase, mood
        ) m
        GROUP BY phase
    ),
    all_tags AS (
        SELECT 
            array_agg(DISTINCT symptom ORDER BY symptom) FILTER (WHERE symptom IS NOT NULL) as all_symptoms,
            array_agg(DISTINCT mood ORDER BY mood) FILTER (WHERE mood IS NOT NULL) as all_moods,
            array_agg(DISTINCT sleep ORDER BY sleep) FILTER (WHERE sleep IS NOT NULL) as all_sleep,
            array_agg(DISTINCT disruptor ORDER BY disruptor) FILTER (WHERE disruptor IS NOT NULL) as all_disruptors,
            array_agg(DISTINCT exercise ORDER BY exercise) FILTER (WHERE exercise IS NOT NULL) as all_exercise
        FROM (
            SELECT 
                unnest(symptoms) as symptom,
                unnest(moods) as mood,
                unnest(sleep_quality) as sleep,
                unnest(disruptors) as disruptor,
                unnest(exercise_types) as exercise
            FROM phase_calculations
        ) tags
    ),
    recent_note AS (
        SELECT notes
        FROM phase_calculations
        WHERE notes IS NOT NULL AND notes != ''
        ORDER BY date DESC
        LIMIT 1
    )
    SELECT json_build_object(
        'phaseCounts', COALESCE((SELECT jsonb_object_agg(phase, count) FROM phase_counts), '{}'::jsonb),
        'symptomsByPhase', COALESCE((SELECT jsonb_object_agg(phase, symptoms) FROM symptom_aggregation WHERE symptoms IS NOT NULL), '{}'::jsonb),
        'moodsByPhase', COALESCE((SELECT jsonb_object_agg(phase, moods) FROM mood_aggregation WHERE moods IS NOT NULL), '{}'::jsonb),
        'aggregatedData', (
            SELECT json_build_object(
                'moods', COALESCE(all_moods, ARRAY[]::text[]),
                'sleep', COALESCE(all_sleep, ARRAY[]::text[]),
                'disruptors', COALESCE(all_disruptors, ARRAY[]::text[]),
                'exercise', COALESCE(all_exercise, ARRAY[]::text[]),
                'recentNote', COALESCE((SELECT notes FROM recent_note), '')
            )
            FROM all_tags
        ),
        'cycleSettings', json_build_object(
            'cycle_length_days', cycle_settings.cycle_length_days,
            'period_length_days', cycle_settings.period_length_days,
            'last_period_start', cycle_settings.last_period_start,
            'is_irregular', cycle_settings.is_irregular
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 2.3 get_cycle_intelligence
CREATE OR REPLACE FUNCTION get_cycle_intelligence(
    user_id_param UUID,
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cached_result JSON;
    computed_result JSON;
    cycle_settings RECORD;
    last_period DATE;
    cycle_day INT;
    diff_days INT;
    phase TEXT;
    cycle_len INT;
    period_len INT;
    ovulation_day INT;
BEGIN
    IF (auth.uid() IS NULL OR auth.uid() <> user_id_param) THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch or not authenticated';
    END IF;

    -- Try cache first (valid for 6 hours)
    SELECT data INTO cached_result
    FROM cycle_intelligence_cache
    WHERE user_id = user_id_param
      AND date = target_date
      AND expires_at > NOW();
    
    IF cached_result IS NOT NULL THEN
        RETURN cached_result;
    END IF;
    
    -- Get cycle settings
    SELECT 
        last_period_start,
        cycle_length_days,
        period_length_days
    INTO cycle_settings
    FROM user_cycle_settings
    WHERE user_id = user_id_param;
    
    IF cycle_settings.last_period_start IS NULL THEN
        RETURN json_build_object('error', 'No period start date set');
    END IF;
    
    -- Calculate phase
    last_period := cycle_settings.last_period_start::date;
    cycle_len := COALESCE(cycle_settings.cycle_length_days, 28);
    period_len := COALESCE(cycle_settings.period_length_days, 5);
    ovulation_day := cycle_len - 14;
    
    diff_days := target_date - last_period;
    cycle_day := (diff_days % cycle_len) + 1;
    
    IF cycle_day <= 0 THEN
        cycle_day := cycle_day + cycle_len;
    END IF;
    
    -- Determine phase
    IF cycle_day <= period_len THEN
        phase := 'Menstrual';
    ELSIF cycle_day < (ovulation_day - 1) THEN
        phase := 'Follicular';
    ELSIF cycle_day <= (ovulation_day + 1) THEN
        phase := 'Ovulatory';
    ELSE
        phase := 'Luteal';
    END IF;
    
    -- Build result
    computed_result := json_build_object(
        'phase', phase,
        'day', cycle_day,
        'last_period_start', last_period,
        'cycle_length', cycle_len,
        'period_length', period_len,
        'next_period_date', last_period + cycle_len,
        'days_until_next_period', (last_period + cycle_len) - target_date
    );
    
    -- Cache it (expires in 6 hours)
    INSERT INTO cycle_intelligence_cache (user_id, date, phase, data, expires_at)
    VALUES (
        user_id_param,
        target_date,
        phase,
        computed_result,
        NOW() + INTERVAL '6 hours'
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        data = computed_result,
        phase = phase,
        computed_at = NOW(),
        expires_at = NOW() + INTERVAL '6 hours';
    
    RETURN computed_result;
END;
$$;

-- 2.4 fetch_logs_bulk
CREATE OR REPLACE FUNCTION fetch_logs_bulk(
    user_id_param UUID,
    month_keys TEXT[]
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    date DATE,
    symptoms TEXT[],
    is_period BOOLEAN,
    flow_intensity TEXT,
    moods TEXT[],
    notes TEXT,
    cervical_discharge TEXT,
    exercise_types TEXT[],
    exercise_minutes INTEGER,
    water_intake INTEGER,
    self_love_tags TEXT[],
    self_love_other TEXT,
    sleep_quality TEXT[],
    sleep_minutes INTEGER,
    disruptors TEXT[],
    mpiq_consistency TEXT,
    mpiq_appearance TEXT,
    mpiq_sensation TEXT,
    mpiq_score INTEGER,
    note TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (auth.uid() IS NULL OR auth.uid() <> user_id_param) THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch or not authenticated';
    END IF;

    RETURN QUERY
    SELECT 
        dl.id,
        dl.user_id,
        dl.date,
        dl.symptoms,
        dl.is_period,
        dl.flow_intensity,
        dl.moods,
        dl.notes,
        dl.cervical_discharge,
        dl.exercise_types,
        dl.exercise_minutes,
        dl.water_intake,
        dl.self_love_tags,
        dl.self_love_other,
        dl.sleep_quality,
        dl.sleep_minutes,
        dl.disruptors,
        dl.mpiq_consistency,
        dl.mpiq_appearance,
        dl.mpiq_sensation,
        dl.mpiq_score,
        dl.note,
        dl.created_at,
        dl.updated_at
    FROM daily_logs dl
    WHERE dl.user_id = user_id_param
      AND to_char(dl.date, 'YYYY-MM') = ANY(month_keys)
    ORDER BY dl.date;
END;
$$;

-- 2.5 export_user_data
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
    IF (auth.uid() IS NULL OR auth.uid() <> target_user_id) THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch or not authenticated';
    END IF;

  -- Log the export request
  INSERT INTO audit_logs (event_type, user_id, details)
  VALUES ('EXPORT_DATA', target_user_id, '{"reason": "user_request"}');
  
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE id = target_user_id),
    'onboarding', (SELECT row_to_json(o) FROM user_onboarding o WHERE user_id = target_user_id),
    'cycle_settings', (SELECT row_to_json(c) FROM user_cycle_settings c WHERE user_id = target_user_id),
    'weight_goals', (SELECT row_to_json(w) FROM user_weight_goals w WHERE user_id = target_user_id),
    'fitness_profile', (SELECT row_to_json(f) FROM user_fitness_profile f WHERE user_id = target_user_id),
    'daily_logs', (SELECT jsonb_agg(row_to_json(l)) FROM daily_logs l WHERE user_id = target_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Harden RLS Policies

-- 3.1 Profiles: Restrict global read
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- 3.2 Add missing Delete policies for health tables
DO $$
DECLARE
    row RECORD;
BEGIN
    FOR row IN SELECT table_name FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name IN (
                   'user_onboarding', 
                   'user_cycle_settings', 
                   'daily_plans', 
                   'daily_logs', 
                   'user_weight_goals', 
                   'user_fitness_profile', 
                   'user_lifestyle',
                   'exercise_history',
                   'exercise_stats',
                   'daily_generated_plans',
                   'cycle_intelligence_cache'
               )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %I" ON %I', row.table_name, row.table_name);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON %I FOR DELETE USING (auth.uid() = user_id)', row.table_name, row.table_name);
    END LOOP;
END $$;

-- 3.3 Ensure UPDATE and INSERT policies for all health tables
-- daily_plans was missing UPDATE
DROP POLICY IF EXISTS "Users can update own daily plans" ON daily_plans;
CREATE POLICY "Users can update own daily plans" ON daily_plans FOR UPDATE USING (auth.uid() = user_id);

-- exercise_stats missing INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert own exercise stats" ON exercise_stats;
CREATE POLICY "Users can insert own exercise stats" ON exercise_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own exercise stats" ON exercise_stats;
CREATE POLICY "Users can update own exercise stats" ON exercise_stats FOR UPDATE USING (auth.uid() = user_id);

-- daily_generated_plans missing INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert own daily generated plans" ON daily_generated_plans;
CREATE POLICY "Users can insert own daily generated plans" ON daily_generated_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own daily generated plans" ON daily_generated_plans;
CREATE POLICY "Users can update own daily generated plans" ON daily_generated_plans FOR UPDATE USING (auth.uid() = user_id);

-- 4. Chat Message Feedback table hardening
CREATE TABLE IF NOT EXISTS public.chat_message_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID NOT NULL,
    assistant_message_id UUID NOT NULL,
    feedback INTEGER CHECK (feedback IN (1, -1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_feedback_user_msg 
ON public.chat_message_feedback(user_id, session_id, assistant_message_id);

ALTER TABLE public.chat_message_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their feedback" ON public.chat_message_feedback;
CREATE POLICY "Users own their feedback" 
ON public.chat_message_feedback 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
