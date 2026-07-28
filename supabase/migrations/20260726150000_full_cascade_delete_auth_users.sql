-- Comprehensive fix for "can't delete a user" — the schema dump showed every
-- personal-data table's user_id FK (whether pointing at auth.users directly
-- or at public.profiles) has no ON DELETE behavior, so Postgres's default
-- (NO ACTION) blocks deleting a user the moment they have a row in ANY of
-- these tables. Personal/health data cascades with the user; audit and
-- telemetry tables instead SET NULL so the log/analytics row survives
-- (matches the SET NULL already used deliberately in
-- 20260221000000_ai_generation_telemetry.sql).
--
-- Safe to run even if some of these already cascade (e.g. from the earlier
-- 20260726140000 migration) — DROP+ADD on the same constraint name is a
-- harmless no-op in that case.

-- ── Personal/health data: CASCADE ──────────────────────────────────────────

ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.daily_logs DROP CONSTRAINT daily_logs_user_id_fkey;
ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_lifestyle DROP CONSTRAINT user_lifestyle_user_id_fkey;
ALTER TABLE public.user_lifestyle ADD CONSTRAINT user_lifestyle_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ai_cache_keys DROP CONSTRAINT ai_cache_keys_user_id_fkey;
ALTER TABLE public.ai_cache_keys ADD CONSTRAINT ai_cache_keys_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cycle_intelligence_cache DROP CONSTRAINT cycle_intelligence_cache_user_id_fkey;
ALTER TABLE public.cycle_intelligence_cache ADD CONSTRAINT cycle_intelligence_cache_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.exercise_history DROP CONSTRAINT exercise_history_user_id_fkey;
ALTER TABLE public.exercise_history ADD CONSTRAINT exercise_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.exercise_history DROP CONSTRAINT exercise_history_workout_session_id_fkey;
ALTER TABLE public.exercise_history ADD CONSTRAINT exercise_history_workout_session_id_fkey
  FOREIGN KEY (workout_session_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.exercise_stats DROP CONSTRAINT exercise_stats_user_id_fkey;
ALTER TABLE public.exercise_stats ADD CONSTRAINT exercise_stats_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.daily_generated_plans DROP CONSTRAINT daily_generated_plans_user_id_fkey;
ALTER TABLE public.daily_generated_plans ADD CONSTRAINT daily_generated_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.period_events DROP CONSTRAINT period_events_user_id_fkey;
ALTER TABLE public.period_events ADD CONSTRAINT period_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cycle_summary DROP CONSTRAINT cycle_summary_user_id_fkey;
ALTER TABLE public.cycle_summary ADD CONSTRAINT cycle_summary_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.workout_sessions DROP CONSTRAINT workout_sessions_user_id_fkey;
ALTER TABLE public.workout_sessions ADD CONSTRAINT workout_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_food_choices DROP CONSTRAINT user_food_choices_user_id_fkey;
ALTER TABLE public.user_food_choices ADD CONSTRAINT user_food_choices_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- These reference public.profiles(id) rather than auth.users directly, but
-- still need to cascade so deleting the (now-cascading) profiles row doesn't
-- get blocked by these in turn.
ALTER TABLE public.user_onboarding DROP CONSTRAINT user_onboarding_user_id_fkey;
ALTER TABLE public.user_onboarding ADD CONSTRAINT user_onboarding_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_cycle_settings DROP CONSTRAINT user_cycle_settings_user_id_fkey;
ALTER TABLE public.user_cycle_settings ADD CONSTRAINT user_cycle_settings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.daily_plans DROP CONSTRAINT daily_plans_user_id_fkey;
ALTER TABLE public.daily_plans ADD CONSTRAINT daily_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_weight_goals DROP CONSTRAINT user_weight_goals_user_id_fkey;
ALTER TABLE public.user_weight_goals ADD CONSTRAINT user_weight_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_fitness_profile DROP CONSTRAINT user_fitness_profile_user_id_fkey;
ALTER TABLE public.user_fitness_profile ADD CONSTRAINT user_fitness_profile_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_preferences DROP CONSTRAINT user_preferences_user_id_fkey;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ── Audit / telemetry data: SET NULL (row survives, just detached) ────────

-- chat_message_feedback.user_id is NOT NULL today; SET NULL requires it to
-- be nullable, so relax that constraint first.
ALTER TABLE public.chat_message_feedback ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.chat_message_feedback DROP CONSTRAINT chat_message_feedback_user_id_fkey;
ALTER TABLE public.chat_message_feedback ADD CONSTRAINT chat_message_feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.ai_generation_events DROP CONSTRAINT ai_generation_events_user_id_fkey;
ALTER TABLE public.ai_generation_events ADD CONSTRAINT ai_generation_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.onboarding_events DROP CONSTRAINT onboarding_events_user_id_fkey;
ALTER TABLE public.onboarding_events ADD CONSTRAINT onboarding_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
