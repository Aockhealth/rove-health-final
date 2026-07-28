-- These tables reference auth.users without ON DELETE CASCADE (the
-- Postgres default is NO ACTION), so deleting a user from the dashboard
-- fails with a foreign-key violation whenever that user has any row in one
-- of these tables. Add CASCADE so deleting a user cleans up their data
-- instead of blocking the deletion.

ALTER TABLE period_events DROP CONSTRAINT period_events_user_id_fkey;
ALTER TABLE period_events ADD CONSTRAINT period_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE cycle_summary DROP CONSTRAINT cycle_summary_user_id_fkey;
ALTER TABLE cycle_summary ADD CONSTRAINT cycle_summary_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE cycle_intelligence_cache DROP CONSTRAINT cycle_intelligence_cache_user_id_fkey;
ALTER TABLE cycle_intelligence_cache ADD CONSTRAINT cycle_intelligence_cache_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE exercise_history DROP CONSTRAINT exercise_history_user_id_fkey;
ALTER TABLE exercise_history ADD CONSTRAINT exercise_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE exercise_stats DROP CONSTRAINT exercise_stats_user_id_fkey;
ALTER TABLE exercise_stats ADD CONSTRAINT exercise_stats_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE daily_generated_plans DROP CONSTRAINT daily_generated_plans_user_id_fkey;
ALTER TABLE daily_generated_plans ADD CONSTRAINT daily_generated_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
