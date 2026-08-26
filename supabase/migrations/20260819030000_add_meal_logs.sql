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
