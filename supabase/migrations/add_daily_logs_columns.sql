-- Migration: Add missing columns to daily_logs table
-- This ensures the database schema matches the application's data model

-- Add missing columns to daily_logs
ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS moods text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
ADD COLUMN IF NOT EXISTS cervical_discharge text,
ADD COLUMN IF NOT EXISTS exercise_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS exercise_minutes int,
ADD COLUMN IF NOT EXISTS water_intake int DEFAULT 0,
ADD COLUMN IF NOT EXISTS self_love_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS self_love_other text DEFAULT '',
ADD COLUMN IF NOT EXISTS sleep_quality text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sleep_minutes int,
ADD COLUMN IF NOT EXISTS disruptors text[] DEFAULT '{}';

-- Add index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(user_id, date DESC);

-- Add index on is_period for period tracking queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_period ON daily_logs(user_id, is_period) WHERE is_period = true;
