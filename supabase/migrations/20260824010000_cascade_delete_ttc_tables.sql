-- The five newest TTC/nutrition tables were created with a plain
-- `REFERENCES auth.users NOT NULL` (no ON DELETE behavior), which defaults
-- to NO ACTION — unlike every other personal-data table, which got
-- ON DELETE CASCADE in 20260726150000_full_cascade_delete_auth_users.sql.
-- In practice this means the delete-account edge function's
-- `supabase.auth.admin.deleteUser()` call fails with a foreign-key
-- violation for any user who has ever logged an LH strip, an ovulation
-- estimate, a fertility share link, a meal, or a lab result — i.e. anyone
-- who has actually used TTC mode. Bringing these in line with the rest.

ALTER TABLE public.lh_readings DROP CONSTRAINT lh_readings_user_id_fkey;
ALTER TABLE public.lh_readings ADD CONSTRAINT lh_readings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ovulation_estimates DROP CONSTRAINT ovulation_estimates_user_id_fkey;
ALTER TABLE public.ovulation_estimates ADD CONSTRAINT ovulation_estimates_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.fertility_share_links DROP CONSTRAINT fertility_share_links_user_id_fkey;
ALTER TABLE public.fertility_share_links ADD CONSTRAINT fertility_share_links_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.meal_logs DROP CONSTRAINT meal_logs_user_id_fkey;
ALTER TABLE public.meal_logs ADD CONSTRAINT meal_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.lab_results DROP CONSTRAINT lab_results_user_id_fkey;
ALTER TABLE public.lab_results ADD CONSTRAINT lab_results_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
