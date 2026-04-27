-- supabase/migrations/017_cycle_summary_unique.sql

-- Add a unique constraint to cycle_summary so we can safely UPSERT
-- without creating duplicate cycle entries when the Edge Function runs.
ALTER TABLE cycle_summary 
ADD CONSTRAINT unique_user_cycle_start UNIQUE (user_id, cycle_start_date);
