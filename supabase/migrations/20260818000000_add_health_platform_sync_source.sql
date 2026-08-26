-- Health platform sync (Apple Health / Android Health Connect) writes into
-- the same daily_logs / lh_readings columns manual entry already uses.
-- This column is display/audit provenance only — "where did this day's
-- reading come from" — the TTC engine itself doesn't read it; the values
-- and disruptor tags it already validates against are what drive detection.
--
-- Sync only ever fills a NULL field (see mobile/src/lib/healthSyncWriter.ts)
-- — it never overwrites a value she entered herself — so this column can
-- only ever describe a reading Rove didn't have any other way to get.

ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS synced_from text;

ALTER TABLE lh_readings
  ADD COLUMN IF NOT EXISTS synced_from text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_synced_from_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_synced_from_check
        CHECK (synced_from IS NULL OR synced_from IN ('apple_health', 'health_connect'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lh_readings_synced_from_check'
  ) THEN
    ALTER TABLE lh_readings
      ADD CONSTRAINT lh_readings_synced_from_check
        CHECK (synced_from IS NULL OR synced_from IN ('apple_health', 'health_connect'));
  END IF;
END $$;

COMMENT ON COLUMN daily_logs.synced_from IS 'Which health platform (if any) filled in this day''s biomarker/sleep/period fields. Null means manually entered. Never set by overwriting an existing value.';
COMMENT ON COLUMN lh_readings.synced_from IS 'Which health platform (if any) supplied this reading. Null means manually entered via the app''s own LH strip log.';
