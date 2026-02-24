-- Create the table for AI Generation Events
-- This captures only generic generations (Chef/Coach) for dataset fine-tuning
CREATE TABLE IF NOT EXISTS public.ai_generation_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    skill TEXT NOT NULL, -- e.g., 'chef', 'coach'
    provider TEXT NOT NULL, -- e.g., 'gemini'
    model TEXT NOT NULL,
    latency_ms INTEGER,
    prompt_snapshot JSONB NOT NULL, -- The contextual variables fed into the prompt
    response_snapshot JSONB NOT NULL, -- The generated output returned to the user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure it with RLS (Row Level Security)
ALTER TABLE public.ai_generation_events ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own generation logs
CREATE POLICY "Users can view their own AI generation events"
    ON public.ai_generation_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only authenticated users (via backend) can insert their own events
CREATE POLICY "Users can insert their own AI generation events"
    ON public.ai_generation_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
