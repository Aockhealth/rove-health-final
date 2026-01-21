-- backend/supabase/migrations/013_cache_invalidation_trigger.sql

CREATE OR REPLACE FUNCTION invalidate_cycle_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Invalidate cache when period data changes
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_period = true THEN
        DELETE FROM cycle_intelligence_cache
        WHERE user_id = NEW.user_id
          AND date >= NEW.date - INTERVAL '35 days'
          AND date <= NEW.date + INTERVAL '35 days';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_invalidate_cycle_cache ON daily_logs;

CREATE TRIGGER trigger_invalidate_cycle_cache
AFTER INSERT OR UPDATE ON daily_logs
FOR EACH ROW
WHEN (NEW.is_period = true)
EXECUTE FUNCTION invalidate_cycle_cache();