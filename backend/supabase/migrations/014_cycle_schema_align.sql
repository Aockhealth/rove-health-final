-- Align cycle schema with app behavior
-- 1) Allow last_period_start to be NULL for new users (no data state)
-- 2) Enforce one daily log per user/date (required for upsert semantics)

ALTER TABLE public.user_cycle_settings
  ALTER COLUMN last_period_start DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.daily_logs
    GROUP BY user_id, date
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate daily_logs rows exist for (user_id, date). Resolve before adding unique index.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_logs_user_date_unique
  ON public.daily_logs (user_id, date);
