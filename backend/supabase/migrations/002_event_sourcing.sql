-- Migration: Event Sourcing Architecture
-- 1. Create period_events table (Source of Truth)
CREATE TABLE IF NOT EXISTS period_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  period_start_date date not null,
  source text default 'manual',
  created_at timestamptz default now()
);

-- RLS for period_events
ALTER TABLE period_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select own period_events" ON period_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own period_events" ON period_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own period_events" ON period_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own period_events" ON period_events FOR DELETE USING (auth.uid() = user_id);

-- 2. Create cycle_summary table (Derived / System Controlled)
CREATE TABLE IF NOT EXISTS cycle_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  cycle_start_date date not null,
  cycle_end_date date,
  cycle_length int,
  ovulation_date date,
  phase_data jsonb,
  confidence_score text,
  generated_at timestamptz default now()
);

-- RLS for cycle_summary
ALTER TABLE cycle_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select own cycle_summary" ON cycle_summary FOR SELECT USING (auth.uid() = user_id);
-- INTENTIONALLY OMITTING INSERT/UPDATE/DELETE FOR USERS
-- Only the Service Role (Edge Function) should modify this table.
