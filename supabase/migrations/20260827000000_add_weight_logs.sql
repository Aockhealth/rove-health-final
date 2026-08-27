-- Weight history. Before this, the app kept exactly one weight number per
-- user (user_lifestyle.weight_kg / user_weight_goals.current_weight_kg,
-- overwritten on every log), so there was no history to draw a trend from --
-- the single most habit-forming screen in a Healthify-style app couldn't
-- exist without it.
--
-- UNIQUE(user_id, date) from the start, matching the fix in
-- 20260826120000_unique_user_id_on_lifestyle_and_weight_goals.sql -- an
-- upsert with onConflict: 'user_id, date' needs that constraint to exist or
-- it silently plans as a plain INSERT and fails for a second log the same
-- day (e.g. weighing in again after correcting a typo).

CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs (user_id, date DESC);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Full set from the start, UPDATE carrying its own WITH CHECK -- the gap that
-- 20260826000000_repair_lifestyle_policies_and_weight_goal_columns.sql had to
-- go back and fix on two older tables.
CREATE POLICY "Users can view own weight logs" ON public.weight_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs" ON public.weight_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs" ON public.weight_logs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs" ON public.weight_logs
    FOR DELETE USING (auth.uid() = user_id);
