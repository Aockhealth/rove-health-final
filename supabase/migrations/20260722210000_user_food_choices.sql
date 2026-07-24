-- Chef v2 "pick your plate": every generation shows the user 3-4 real dish
-- options; her pick (or explicit regenerate-without-picking) is logged here.
-- This table is both the personalization source (preference summary +
-- recently-chosen anti-repeat list fed back into the options prompt) and a
-- product-analytics asset (what do users actually choose per phase?).
CREATE TABLE IF NOT EXISTS public.user_food_choices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phase TEXT NOT NULL,                -- Menstrual | Follicular | Ovulatory | Luteal
    meal_type TEXT NOT NULL,            -- snack | smoothie | salad
    options_shown JSONB NOT NULL,       -- the full options array the user saw
    chosen_name TEXT,                   -- NULL = regenerated without picking (all options rejected)
    chosen_index INTEGER,               -- position in options_shown, NULL when nothing chosen
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_food_choices_user_recent
    ON public.user_food_choices (user_id, created_at DESC);

ALTER TABLE public.user_food_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own food choices"
    ON public.user_food_choices
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food choices"
    ON public.user_food_choices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
