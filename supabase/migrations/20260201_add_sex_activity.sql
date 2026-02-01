-- Migration: Add sexual activity column to daily_logs
-- Adds tracking for sexual activity with multiple select options

ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS sex_activity text[] DEFAULT '{}';

-- Update index if necessary (usually not needed for array columns unless searching specific values frequently)
