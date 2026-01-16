-- Ensure user_lifestyle table exists
CREATE TABLE IF NOT EXISTS public.user_lifestyle (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    activity_level TEXT,
    diet_preference TEXT,
    fitness_goal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_lifestyle ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own lifestyle" ON public.user_lifestyle
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own lifestyle" ON public.user_lifestyle
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lifestyle" ON public.user_lifestyle
    FOR UPDATE USING (auth.uid() = user_id);

-- Ensure user_weight_goals has start_weight_kg
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_weight_goals' AND column_name = 'start_weight_kg') THEN
        ALTER TABLE public.user_weight_goals ADD COLUMN start_weight_kg NUMERIC;
    END IF;
END $$;
