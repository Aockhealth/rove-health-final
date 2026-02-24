CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_time
  ON public.onboarding_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_name_time
  ON public.onboarding_events (event_name, created_at DESC);

ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.onboarding_events TO anon, authenticated;
GRANT SELECT ON public.onboarding_events TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'onboarding_events'
      AND policyname = 'Users can view own onboarding events'
  ) THEN
    CREATE POLICY "Users can view own onboarding events"
      ON public.onboarding_events
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'onboarding_events'
      AND policyname = 'Users can insert onboarding events'
  ) THEN
    CREATE POLICY "Users can insert onboarding events"
      ON public.onboarding_events
      FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;
