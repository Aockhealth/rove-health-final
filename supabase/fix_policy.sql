-- Fix duplicate policy name blocking updates on user_lifestyle
-- The original migration named both INSERT and UPDATE policies "Users can update own lifestyle".
-- This caused the UPDATE policy creation to fail, preventing users from updating their plan.

-- 1. Drop the ambiguous policy (likely the INSERT one)
DROP POLICY IF EXISTS "Users can update own lifestyle" ON public.user_lifestyle;

-- 2. Create clear INSERT policy
CREATE POLICY "Users can insert own lifestyle" ON public.user_lifestyle
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Create clear UPDATE policy
CREATE POLICY "Users can modify own lifestyle" ON public.user_lifestyle
    FOR UPDATE USING (auth.uid() = user_id);
