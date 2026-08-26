-- Secondary, informational-only signals pulled from Apple Health / Health
-- Connect: heart-rate variability, resting heart rate, and skin-temperature
-- deviation. These are never wired into detectOvulation (shared/cycle/ttc.ts)
-- — that engine's inputs stay BBT, LH/OPK, and cervical mucus, the signals
-- it was actually validated against (see the accuracy backtest). Adding a
-- new input to the algorithm itself is a science decision, not a plumbing
-- one; these columns exist so the data can be *shown* to her, not so it can
-- quietly start influencing a read she wasn't told changed.
--
-- One row per user per day, same shape as bbt_celsius/opk_result, so they
-- live on daily_logs rather than a new table.

ALTER TABLE daily_logs
  -- HRV in milliseconds. Apple reports SDNN; Health Connect reports RMSSD —
  -- two different formulas over the same underlying beat-to-beat variation,
  -- not directly equivalent. Stored in one column anyway (both are
  -- "HRV in ms" at the resolution this app shows it), but never compared
  -- across a platform switch — see hrv_source below.
  ADD COLUMN IF NOT EXISTS hrv_ms numeric(6, 2),
  ADD COLUMN IF NOT EXISTS hrv_source text,
  ADD COLUMN IF NOT EXISTS resting_heart_rate_bpm smallint,
  -- Deviation from her own recent baseline, in Celsius — never an absolute
  -- reading. Health Connect hands this over pre-computed; Apple's
  -- AppleSleepingWristTemperature is absolute, so appleHealthSync.ts derives
  -- a delta from her own recent readings before this is written, the same
  -- "measured against her own baseline, not a population one" rule the rest
  -- of this app's fertility signals already follow.
  ADD COLUMN IF NOT EXISTS skin_temp_delta_celsius numeric(4, 2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_hrv_source_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_hrv_source_check
        CHECK (hrv_source IS NULL OR hrv_source IN ('apple_sdnn', 'health_connect_rmssd'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_resting_heart_rate_range_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_resting_heart_rate_range_check
        CHECK (resting_heart_rate_bpm IS NULL OR (resting_heart_rate_bpm BETWEEN 25 AND 220));
  END IF;

  -- A real deviation is a fraction of a degree either way; anything past
  -- ±3°C is a unit/parsing error upstream, not a physiological reading.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_skin_temp_delta_range_check'
  ) THEN
    ALTER TABLE daily_logs
      ADD CONSTRAINT daily_logs_skin_temp_delta_range_check
        CHECK (skin_temp_delta_celsius IS NULL OR (skin_temp_delta_celsius BETWEEN -3 AND 3));
  END IF;
END $$;

COMMENT ON COLUMN daily_logs.hrv_ms IS 'Heart-rate variability, informational only — never an input to detectOvulation. See hrv_source for which formula produced it.';
COMMENT ON COLUMN daily_logs.hrv_source IS 'Which platform/formula computed hrv_ms: apple_sdnn or health_connect_rmssd — not directly comparable to each other.';
COMMENT ON COLUMN daily_logs.resting_heart_rate_bpm IS 'Resting heart rate from Apple Health / Health Connect, informational only.';
COMMENT ON COLUMN daily_logs.skin_temp_delta_celsius IS 'Skin temperature deviation from her own recent baseline, in Celsius. Informational only — never an input to detectOvulation.';
