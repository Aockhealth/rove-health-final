-- Sugar rides along with the same AI call estimate-meal-macros already makes
-- for calories/macros/GI, same pattern as 20260824000000_add_meal_glycemic_index.sql.
-- Unlike GI, sugar is never legitimately null (every food has a sugar amount,
-- even if 0) — the edge function treats a NULL sugar_g cache row purely as
-- "predates this column, needs a fresh estimate," no date-cutoff needed.

ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS sugar_g smallint;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meal_logs_sugar_range_check') THEN
    ALTER TABLE meal_logs ADD CONSTRAINT meal_logs_sugar_range_check CHECK (sugar_g IS NULL OR (sugar_g >= 0 AND sugar_g <= 500));
  END IF;
END $$;

COMMENT ON COLUMN meal_logs.sugar_g IS 'AI-estimated total sugar in grams (naturally occurring + added), a subset of carbs_g. Null when logged before this column existed.';

ALTER TABLE public.meal_macro_cache ADD COLUMN IF NOT EXISTS sugar_g numeric;

COMMENT ON COLUMN public.meal_macro_cache.sugar_g IS 'Sugar per 100g (gram-convertible tier) or per unit (freeform tier) of food_key, scales with portion like calories/protein/carbs/fat. Null only means this row predates the column.';
