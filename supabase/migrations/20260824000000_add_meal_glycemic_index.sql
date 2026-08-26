-- Glycemic index rides along with the same AI call estimate-meal-macros
-- already makes for calories/macros when a meal is logged — one extra field
-- on the same request and cache row, not a separate lookup tool.

ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS glycemic_index smallint;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meal_logs_gi_range_check') THEN
    ALTER TABLE meal_logs ADD CONSTRAINT meal_logs_gi_range_check CHECK (glycemic_index IS NULL OR (glycemic_index >= 0 AND glycemic_index <= 100));
  END IF;
END $$;

COMMENT ON COLUMN meal_logs.glycemic_index IS 'AI-estimated glycemic index (0-100, glucose=100 scale) from estimate-meal-macros. Null when the meal has negligible carbohydrate or was logged before this column existed.';

-- GI is intrinsic to the food (doesn't scale with portion size the way
-- calories/macros do), so it's cached and read back as-is — never multiplied
-- by the grams/quantity scale factor the other columns use.
ALTER TABLE public.meal_macro_cache ADD COLUMN IF NOT EXISTS gi numeric;

COMMENT ON COLUMN public.meal_macro_cache.gi IS 'Glycemic index of food_key, 0-100, null if negligible carbohydrate. Intrinsic to the food — read back unscaled regardless of portion.';
