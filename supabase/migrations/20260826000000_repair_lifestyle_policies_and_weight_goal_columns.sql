-- Repairs the fallout from 006_ensure_lifestyle.sql, which declared TWO
-- policies with the SAME name on public.user_lifestyle:
--
--   CREATE POLICY "Users can update own lifestyle" ... FOR INSERT ...
--   CREATE POLICY "Users can update own lifestyle" ... FOR UPDATE ...
--
-- Policy names must be unique per table, so the second CREATE POLICY raises
-- "policy already exists for table" and aborts the rest of that migration --
-- including the DO block at the bottom that adds
-- user_weight_goals.start_weight_kg.
--
-- Two user-visible consequences, both of which surfaced as Plan's
-- "could not update the plan":
--   1. user_lifestyle may have no UPDATE policy at all, so RLS silently
--      denies every upsert that resolves to an UPDATE (i.e. every edit after
--      the row first exists). Inserts worked, edits never did.
--   2. user_weight_goals.start_weight_kg may not exist, so any write naming
--      that column is rejected outright by PostgREST.
--
-- Idempotent and safe to re-run.

-- 1. Give user_lifestyle a correctly-named policy per command. Drop both the
--    misnamed pair and the intended names first so this converges no matter
--    which of them actually made it into a given environment.
DROP POLICY IF EXISTS "Users can update own lifestyle" ON public.user_lifestyle;
DROP POLICY IF EXISTS "Users can insert own lifestyle" ON public.user_lifestyle;
DROP POLICY IF EXISTS "Users can view own lifestyle"   ON public.user_lifestyle;

CREATE POLICY "Users can view own lifestyle" ON public.user_lifestyle
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lifestyle" ON public.user_lifestyle
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lifestyle" ON public.user_lifestyle
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Re-run the column add that the aborted migration never reached.
ALTER TABLE public.user_weight_goals
    ADD COLUMN IF NOT EXISTS start_weight_kg NUMERIC;

-- 3. Same class of gap on user_weight_goals: 001_ai_personalization.sql created
--    SELECT/INSERT/UPDATE policies, but an UPDATE policy without a WITH CHECK
--    clause lets a row be updated into a state that no longer satisfies the
--    predicate. Normalise all three here so an upsert (INSERT ... ON CONFLICT
--    DO UPDATE) is permitted end to end.
DROP POLICY IF EXISTS "Users can view own weight goals"   ON public.user_weight_goals;
DROP POLICY IF EXISTS "Users can insert own weight goals" ON public.user_weight_goals;
DROP POLICY IF EXISTS "Users can update own weight goals" ON public.user_weight_goals;

CREATE POLICY "Users can view own weight goals" ON public.user_weight_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight goals" ON public.user_weight_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight goals" ON public.user_weight_goals
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
