-- LH ovulation-strip readings, one row per test.
--
-- Kept in its own table rather than as daily_logs columns (unlike
-- bbt_celsius/opk_result) because the kit being sourced reads as a graded
-- band against its own printed backing card, not a simple negative/low/
-- high/peak pick — it needs the richer shape below (which strip of the box,
-- the surge flag the algorithm computes, and the exact test time, which
-- matters because LH reads higher in afternoon/evening urine).
--
-- band_level is intentionally a plain int, not constrained to a fixed range
-- here: the exact number of grades the physical kit's backing card
-- distinguishes is still being confirmed (assumed 5: 0=no line .. 4=darker-
-- than-control) — see docs/ttc-mode-implementation-plan.md §1. Locking the
-- CHECK constraint to a specific count is a follow-up once that's confirmed,
-- not a blocker for this migration.

CREATE TABLE IF NOT EXISTS lh_readings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  test_time timestamptz NOT NULL,
  cycle_day int,
  band_level int NOT NULL,
  kit_strip_number int,
  surge_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE lh_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own LH readings" ON lh_readings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own LH readings" ON lh_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own LH readings" ON lh_readings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lh_readings_user_date ON lh_readings (user_id, date DESC);

COMMENT ON TABLE lh_readings IS 'Graded LH ovulation-strip readings, one per day (TTC mode).';
COMMENT ON COLUMN lh_readings.band_level IS 'Grade read off the kit''s own backing card, 0 = no line upward. Not yet range-constrained — see file header.';
COMMENT ON COLUMN lh_readings.kit_strip_number IS 'Which strip of the box this was (1-5) — drives the "N strips left" reorder nudge.';
COMMENT ON COLUMN lh_readings.surge_flag IS 'Set by the algorithm (baseline + N grades), never user-entered directly.';

-- Personalizes which cycle days she actually tests, instead of a fixed
-- day-11-14 default that assumes a textbook cycle — see
-- docs/ttc-mode-implementation-plan.md §0.
ALTER TABLE user_cycle_settings
  ADD COLUMN IF NOT EXISTS baseline_lh_band numeric,
  ADD COLUMN IF NOT EXISTS recommended_test_start_day int;

COMMENT ON COLUMN user_cycle_settings.baseline_lh_band IS 'Rolling median of her own lowest-tertile LH band readings across cycles. Null until enough history exists.';
COMMENT ON COLUMN user_cycle_settings.recommended_test_start_day IS 'Cycle day to suggest starting her LH kit, personalized from her own cycle history once available; defaults to day 10 in application code until then.';
