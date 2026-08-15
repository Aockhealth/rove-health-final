-- Ground-truth data for the predicted-vs-actual period date: every time a
-- genuinely new period start is logged (not an edit to the current one), the
-- app asks a one-tap "did that land about where we said it would?" and this
-- captures both the objective delta and her subjective read of it. Cheapest
-- possible way to start accumulating validation data for future prediction
-- work — no strips, no wearable, just what the app already predicts and logs.
CREATE TABLE IF NOT EXISTS public.period_prediction_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start_date DATE NOT NULL,      -- the actual, newly logged period start
    predicted_date DATE,                  -- what the app had been predicting before this log
    days_off INTEGER,                     -- predicted_date -> period_start_date, signed (negative = early)
    was_accurate BOOLEAN,                 -- her tap: did this feel about right?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_period_prediction_feedback_user
    ON public.period_prediction_feedback (user_id, period_start_date DESC);

ALTER TABLE public.period_prediction_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prediction feedback"
    ON public.period_prediction_feedback
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prediction feedback"
    ON public.period_prediction_feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
