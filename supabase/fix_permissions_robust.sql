-- ROBUST FIX: Reset all policies for user_lifestyle to ensure no conflicts
-- This script drops ALL existing policies for this table and recreates them cleanly.

-- 1. Drop all potentially conflicting policies
DROP POLICY IF EXISTS "Users can view own lifestyle" ON public.user_lifestyle;
DROP POLICY IF EXISTS "Users can update own lifestyle" ON public.user_lifestyle;
DROP POLICY IF EXISTS "Users can insert own lifestyle" ON public.user_lifestyle;
DROP POLICY IF EXISTS "Users can modify own lifestyle" ON public.user_lifestyle;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_lifestyle;

-- 2. Ensure RLS is enabled
ALTER TABLE public.user_lifestyle ENABLE ROW LEVEL SECURITY;

-- 3. Recreate clear, distinct policies
-- SELECT
CREATE POLICY "Users can view own lifestyle" ON public.user_lifestyle
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert own lifestyle" ON public.user_lifestyle
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own lifestyle" ON public.user_lifestyle
    FOR UPDATE USING (auth.uid() = user_id);
