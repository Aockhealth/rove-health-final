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
