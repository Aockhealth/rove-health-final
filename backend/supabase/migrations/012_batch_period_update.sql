-- backend/supabase/migrations/012_batch_period_update.sql

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