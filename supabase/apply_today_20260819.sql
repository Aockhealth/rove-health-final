-- Combined migration: everything added on 19 Aug 2026.
-- Convenience file for pasting into the Supabase SQL editor in one go.
-- The 5 source files below remain the source of truth for the migration
-- history (supabase/migrations/2026081900*.sql, 2026081904*.sql) — if you
-- ever adopt the Supabase CLI (supabase db push), use those, not this one.
-- Every statement here is idempotent (IF NOT EXISTS / guarded DO blocks /
-- DROP POLICY IF EXISTS before every CREATE POLICY), so it's safe to run
-- even if some of these were already applied — including a partial or
-- failed previous attempt.

-- ============================================================================
-- 1/5 — fertility_share_links.sql (partner sharing)
-- ============================================================================

-- Shareable, read-only partner link for TTC fertile-window status.
--
-- Deliberately token-based rather than a second Rove account for the
-- partner: no invite flow, no second login, revocable by regenerating the
-- token. The token table itself is never directly readable by anon/public —
-- every read goes through get_shared_fertility_status below, which returns
-- only a minimal display subset (status/window/confidence), never the raw
-- ovulation_estimates row, the user_id, or anything else in her account.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS fertility_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_viewed_at timestamptz
);

ALTER TABLE fertility_share_links ENABLE ROW LEVEL SECURITY;

-- Owner-only access to the token table itself. A partner viewing the link
-- never queries this table directly — see the SECURITY DEFINER function
-- below, which is the only path from a token to any data.
DROP POLICY IF EXISTS "Users can view own share links" ON fertility_share_links;
CREATE POLICY "Users can view own share links" ON fertility_share_links
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own share links" ON fertility_share_links;
CREATE POLICY "Users can create own share links" ON fertility_share_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can revoke own share links" ON fertility_share_links;
CREATE POLICY "Users can revoke own share links" ON fertility_share_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fertility_share_links_user ON fertility_share_links (user_id);
CREATE INDEX IF NOT EXISTS idx_fertility_share_links_token ON fertility_share_links (token) WHERE revoked_at IS NULL;

COMMENT ON TABLE fertility_share_links IS 'Token-based read-only partner links for TTC fertile-window status. Revoke by setting revoked_at rather than deleting, so a stale client-side "link copied" state fails closed, not silently to a reused token.';

-- The one path from a token to data. SECURITY DEFINER so it can read
-- ovulation_estimates on the owner's behalf without granting the anon/public
-- role any direct table access — the function itself is the access-control
-- boundary, and it hands back only the fields a partner actually needs to
-- see, never the full signal_snapshot, contributing_signals, or user_id.
CREATE OR REPLACE FUNCTION get_shared_fertility_status(p_token text)
RETURNS TABLE (
  status text,
  confidence text,
  fertile_window_start date,
  fertile_window_end date,
  confirmed_date date,
  predicted_date date,
  computed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT fsl.user_id INTO v_user_id
  FROM fertility_share_links fsl
  WHERE fsl.token = p_token AND fsl.revoked_at IS NULL;

  IF v_user_id IS NULL THEN
    RETURN; -- unknown or revoked token: empty result, not an error, so a stale link fails quietly
  END IF;

  UPDATE fertility_share_links
  SET last_viewed_at = now()
  WHERE fertility_share_links.token = p_token;

  RETURN QUERY
  SELECT
    oe.status,
    oe.confidence,
    oe.fertile_window_start,
    oe.fertile_window_end,
    oe.confirmed_date,
    oe.predicted_date,
    oe.computed_at
  FROM ovulation_estimates oe
  WHERE oe.user_id = v_user_id
  ORDER BY oe.cycle_start DESC
  LIMIT 1;
END;
$$;

-- Callable by an unauthenticated partner opening the link (anon) and by a
-- logged-in user previewing their own link (authenticated) — never granted
-- to PUBLIC at the table level, only this narrow function.
GRANT EXECUTE ON FUNCTION get_shared_fertility_status(text) TO anon, authenticated;

COMMENT ON FUNCTION get_shared_fertility_status IS 'The only way to read fertility data via a share token. Returns the latest ovulation_estimates row''s display fields for the token''s owner, or an empty result for an unknown/revoked token.';

-- ============================================================================
-- 2/5 — add_secondary_health_signals.sql (HRV / resting HR / skin temp)
-- ============================================================================

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

-- ============================================================================
-- 3/5 — add_daily_steps.sql (step count)
-- ============================================================================

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

-- ============================================================================
-- 4/5 — add_meal_logs.sql (nutrition tracker)
-- ============================================================================

-- Actual food logging, to pair with the existing macro *targets* shown on
-- the Plan tab (MacroFuelGauge reads content_library's phase-based
-- guidance — a recommendation, not a record of what she ate). Multiple
-- entries per day, so this is its own table rather than a daily_logs column.

CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  name text NOT NULL,
  calories smallint,
  protein_g smallint,
  carbs_g smallint,
  fat_g smallint,
  logged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal logs" ON meal_logs;
CREATE POLICY "Users can view own meal logs" ON meal_logs
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own meal logs" ON meal_logs;
CREATE POLICY "Users can insert own meal logs" ON meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own meal logs" ON meal_logs;
CREATE POLICY "Users can delete own meal logs" ON meal_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs (user_id, date);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meal_logs_calories_range_check') THEN
    ALTER TABLE meal_logs ADD CONSTRAINT meal_logs_calories_range_check CHECK (calories IS NULL OR (calories >= 0 AND calories <= 5000));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meal_logs_protein_range_check') THEN
    ALTER TABLE meal_logs ADD CONSTRAINT meal_logs_protein_range_check CHECK (protein_g IS NULL OR (protein_g >= 0 AND protein_g <= 500));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meal_logs_carbs_range_check') THEN
    ALTER TABLE meal_logs ADD CONSTRAINT meal_logs_carbs_range_check CHECK (carbs_g IS NULL OR (carbs_g >= 0 AND carbs_g <= 500));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meal_logs_fat_range_check') THEN
    ALTER TABLE meal_logs ADD CONSTRAINT meal_logs_fat_range_check CHECK (fat_g IS NULL OR (fat_g >= 0 AND fat_g <= 500));
  END IF;
END $$;

COMMENT ON TABLE meal_logs IS 'Manually logged meals — actual intake, distinct from the phase-based macro targets shown on the Plan tab.';

-- ============================================================================
-- 5/5 — add_lab_results_and_medication.sql (Clinical tab: lab feed + medication)
-- ============================================================================

-- Two pieces of the Clinical-tab restructuring: a lab-values feed and a
-- medication tracker, alongside the existing doctor-export report.
--
-- Lab results (testosterone, AMH, TSH, prolactin, LH:FSH ratio, ultrasound
-- notes) get their own table — irregular, one-value-at-a-time entries, not
-- a daily shape. Medication stays on daily_logs, matching bbt_celsius/
-- opk_result/nsaid_taken — one fertility-medication entry per day, logged
-- from the same TTC quick-log sheet.

CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  test_name text NOT NULL,
  value numeric,
  unit text,
  notes text,
  logged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lab results" ON lab_results;
CREATE POLICY "Users can view own lab results" ON lab_results
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own lab results" ON lab_results;
CREATE POLICY "Users can insert own lab results" ON lab_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own lab results" ON lab_results;
CREATE POLICY "Users can delete own lab results" ON lab_results
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lab_results_user_date ON lab_results (user_id, date DESC);

COMMENT ON TABLE lab_results IS 'Manually logged lab values (testosterone, AMH, TSH, prolactin, LH:FSH ratio, etc.) — irregular entries, shown on the Clinical tab, never read by detectOvulation.';

-- Medication (Letrozole, Clomid, etc.) — same shape as the existing TTC
-- daily_logs columns, logged from TtcQuickLogSheet alongside BBT/OPK/NSAID.
ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS fertility_medication text,
  ADD COLUMN IF NOT EXISTS fertility_medication_dose text;

COMMENT ON COLUMN daily_logs.fertility_medication IS 'Ovulation-induction medication taken this day (e.g. Letrozole, Clomiphene), if any. Not yet read by detectOvulation — display/tracking only until the engine change to interpret a medicated cycle is validated separately.';
COMMENT ON COLUMN daily_logs.fertility_medication_dose IS 'Free-text dose for fertility_medication, as she has it from her prescription — not validated or interpreted.';
