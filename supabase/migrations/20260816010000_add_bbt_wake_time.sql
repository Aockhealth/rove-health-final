-- Basal body temperature is only meaningful measured at a consistent wake
-- time — a reading taken far from her usual time is excluded from
-- baseline/rise detection (see shared/cycle/ttc.ts's collectCycleReadings).
-- Stored separately from bbt_celsius since a day can have a temperature
-- reading with no wake time yet (e.g. backfilled/legacy data).

ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS bbt_wake_time timestamptz;

COMMENT ON COLUMN daily_logs.bbt_wake_time IS 'When the BBT reading was taken — used to exclude readings far from her rolling wake-time average this cycle (TTC mode).';
