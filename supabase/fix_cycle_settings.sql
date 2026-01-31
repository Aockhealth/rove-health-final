-- Fix invalid cycle settings
-- Run this in Supabase SQL Editor

-- First, see current values
SELECT id, user_id, cycle_length_days, period_length_days, last_period_start 
FROM user_cycle_settings;

-- Then update to normal values (28-day cycle, 5-day period)
UPDATE user_cycle_settings 
SET 
    cycle_length_days = 28,
    period_length_days = 5
WHERE cycle_length_days < 21 OR period_length_days < 3;
