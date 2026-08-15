-- TTC (trying-to-conceive) mode logs two new biomarkers, one reading per day:
-- basal body temperature and a graded ovulation test strip (OPK) result.
-- Both live on daily_logs alongside flow_intensity/cervical_discharge rather
-- than in a new table, because they're the same shape: one value per user per
-- day. Existing daily_logs RLS policies already cover the new columns.
--
-- Temperature is stored in Celsius; the °F toggle in the app is a display-only
-- conversion so there is a single canonical unit in the database.

ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS bbt_celsius numeric(4, 2),
  ADD COLUMN IF NOT EXISTS opk_result text;

-- Guard each constraint so re-running the migration on an already-migrated
-- database is a no-op (ADD CONSTRAINT has no IF NOT EXISTS form).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_opk_result_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_opk_result_check
        CHECK (opk_result IS NULL OR opk_result IN ('negative', 'low', 'high', 'peak'));
  END IF;

  -- 34-40°C brackets every plausible basal reading; anything outside it is a
  -- typo (e.g. a Fahrenheit value entered into a Celsius field), and a bad
  -- temperature silently corrupts the coverline the algorithm derives from it.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_bbt_celsius_range_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_bbt_celsius_range_check
        CHECK (bbt_celsius IS NULL OR (bbt_celsius >= 34 AND bbt_celsius <= 40));
  END IF;
END $$;

COMMENT ON COLUMN daily_logs.bbt_celsius IS 'Basal body temperature in Celsius, manually entered on waking (TTC mode).';
COMMENT ON COLUMN daily_logs.opk_result IS 'Graded ovulation test strip reading: negative | low | high | peak (TTC mode).';
