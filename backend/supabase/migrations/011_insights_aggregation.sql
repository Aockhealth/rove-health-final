-- backend/supabase/migrations/011_insights_aggregation.sql

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
    WITH phase_calculations AS (
        SELECT 
            date,
            symptoms,
            moods,
            sleep_quality,
            disruptors,
            exercise_types,
            notes,
            -- Calculate phase for each log
            CASE 
                WHEN ((date - cycle_settings.last_period_start::date) % COALESCE(cycle_settings.cycle_length_days, 28)) + 1 
                     <= COALESCE(cycle_settings.period_length_days, 5) THEN 'Menstrual'
                WHEN ((date - cycle_settings.last_period_start::date) % COALESCE(cycle_settings.cycle_length_days, 28)) + 1 
                     < COALESCE(cycle_settings.cycle_length_days, 28) - 15 THEN 'Follicular'
                WHEN ((date - cycle_settings.last_period_start::date) % COALESCE(cycle_settings.cycle_length_days, 28)) + 1 
                     <= COALESCE(cycle_settings.cycle_length_days, 28) - 13 THEN 'Ovulatory'
                ELSE 'Luteal'
            END AS phase
        FROM daily_logs
        WHERE user_id = user_id_param
          AND date >= CURRENT_DATE - INTERVAL '90 days'
    ),
    phase_counts AS (
        SELECT 
            phase,
            COUNT(*) as count
        FROM phase_calculations
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
            WHERE symptoms IS NOT NULL AND array_length(symptoms, 1) > 0
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
            WHERE moods IS NOT NULL AND array_length(moods, 1) > 0
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