-- backend/supabase/migrations/010_cycle_intelligence_cached.sql

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