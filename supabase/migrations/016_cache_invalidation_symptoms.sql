-- supabase/migrations/016_cache_invalidation_symptoms.sql

CREATE OR REPLACE FUNCTION invalidate_cycle_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1. Invalidate long-term cycle cache when period dates change
    IF NEW.is_period = true THEN
        DELETE FROM cycle_intelligence_cache
        WHERE user_id = NEW.user_id
          AND date >= NEW.date - INTERVAL '35 days'
          AND date <= NEW.date + INTERVAL '35 days';
    END IF;

    -- 2. Smart Cache Invalidation
    -- If the user logs ANY new data (symptoms, mood, etc.), we immediately
    -- invalidate their currently active AI insight cache. 
    -- This forces the AI to regenerate on their next app open so it can read the fresh symptoms.
    DELETE FROM cycle_intelligence_cache
    WHERE user_id = NEW.user_id 
      AND expires_at > NOW();
    
    RETURN NEW;
END;
$$;

-- Drop the old trigger that was restricted to ONLY period days
DROP TRIGGER IF EXISTS trigger_invalidate_cycle_cache ON daily_logs;

-- Recreate trigger to fire on ALL updates and inserts in daily_logs
CREATE TRIGGER trigger_invalidate_cycle_cache
AFTER INSERT OR UPDATE ON daily_logs
FOR EACH ROW
EXECUTE FUNCTION invalidate_cycle_cache();
