
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_logs_user_date_desc 
ON daily_logs(user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_logs_period_only 
ON daily_logs(user_id, date) 
WHERE is_period = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_logs_month_partition 
ON daily_logs(user_id, (to_char(date, 'YYYY-MM')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_logs_recent_90days 
ON daily_logs(user_id, date DESC) 
WHERE date >= CURRENT_DATE - INTERVAL '90 days';

-- Cycle intelligence cache indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycle_cache_valid 
ON cycle_intelligence_cache(user_id, date, expires_at) 
WHERE expires_at > NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycle_cache_lookup 
ON cycle_intelligence_cache(user_id, date);

-- User cycle settings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_cycle_settings_user 
ON user_cycle_settings(user_id);

-- Add unique constraint if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_intelligence_cache_user_date_key'
    ) THEN
        ALTER TABLE cycle_intelligence_cache 
        ADD CONSTRAINT cycle_intelligence_cache_user_date_key 
        UNIQUE (user_id, date);
    END IF;
END $$;