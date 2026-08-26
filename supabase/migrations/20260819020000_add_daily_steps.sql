-- Daily step count, synced from Apple Health / Health Connect (see
-- appleHealthSync.ts / healthConnectSync.ts) — the "step calculator" the
-- Move side of Cycle Sync was missing. No manual-entry UI for this; it only
-- ever arrives from the health platform sync, same as HRV/resting heart
-- rate/skin temperature.

ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS steps integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_steps_range_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_steps_range_check
        CHECK (steps IS NULL OR (steps >= 0 AND steps <= 100000));
  END IF;
END $$;

COMMENT ON COLUMN daily_logs.steps IS 'Daily step count synced from Apple Health / Health Connect. No manual entry — this is a device-measured field only.';
