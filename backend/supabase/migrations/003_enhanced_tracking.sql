-- Migration: 003_enhanced_tracking.sql
-- Purpose: Add MPIQ tracking, comprehensive daily logs, and intelligence caching

-- 1. Add MPIQ and extended tracking columns to daily_logs
ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS mpiq_consistency text,
ADD COLUMN IF NOT EXISTS mpiq_appearance text,
ADD COLUMN IF NOT EXISTS mpiq_sensation text,
ADD COLUMN IF NOT EXISTS mpiq_score int, -- Calculated fertility score (1-10)
ADD COLUMN IF NOT EXISTS moods text[] default '{}',
ADD COLUMN IF NOT EXISTS exercise_types text[] default '{}',
ADD COLUMN IF NOT EXISTS exercise_minutes int,
ADD COLUMN IF NOT EXISTS water_intake int,
ADD COLUMN IF NOT EXISTS sleep_minutes int,
ADD COLUMN IF NOT EXISTS sleep_quality text[] default '{}',
ADD COLUMN IF NOT EXISTS disruptors text[] default '{}', -- Alcohol, stress, travel
ADD COLUMN IF NOT EXISTS self_love_tags text[] default '{}',
ADD COLUMN IF NOT EXISTS note text;

-- 2. Create table for caching AI intelligence (to reduce costs/latency)
CREATE TABLE IF NOT EXISTS cycle_intelligence_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null, -- Cache bucketed by date
  phase text, -- Invalidate if phase prediction changes
  data jsonb not null, -- The massive dashboard JSON
  computed_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '1 hour'),
  
  -- Ensure one cache entry per user/date to avoid bloat
  UNIQUE(user_id, date)
);

-- 3. Create tables for Progressive Workout Architecture
-- Track individual exercise history
CREATE TABLE IF NOT EXISTS exercise_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  exercise_name text not null,
  date date not null,
  sets_completed int,
  reps_completed int[], -- Array of reps per set, e.g. [10, 10, 8]
  weight_used numeric,  -- kg
  difficulty_rating int, -- 1-5 RPE
  notes text
);

CREATE INDEX IF NOT EXISTS idx_exercise_history_user_date ON exercise_history(user_id, date);

-- Track aggregated stats per exercise (for AI lookup)
CREATE TABLE IF NOT EXISTS exercise_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  exercise_name text not null,
  
  -- Personal Records
  pr_reps int,
  pr_sets int,
  pr_weight numeric,
  pr_date date,
  
  -- Recent Performance (rolling window)
  last_performed date,
  last_reps int,
  last_sets int,
  last_weight numeric,
  trend text, -- 'improving', 'plateau', 'declining'
  
  updated_at timestamptz default now(),
  
  UNIQUE(user_id, exercise_name)
);

-- Track generated daily plans (Consistency Cache)
CREATE TABLE IF NOT EXISTS daily_generated_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  phase text not null,
  diet_plan jsonb,
  workout_plan jsonb,
  generated_at timestamptz default now(),
  
  UNIQUE(user_id, date)
);

-- 4. Enable RLS
ALTER TABLE cycle_intelligence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_generated_plans ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Intelligence Cache: Users read their own, System (functions) writes
CREATE POLICY "Users can view own cache" ON cycle_intelligence_cache 
  FOR SELECT USING (auth.uid() = user_id);

-- Exercise History: Users read/write their own
CREATE POLICY "Users can view own exercise history" ON exercise_history 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise history" ON exercise_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercise history" ON exercise_history 
  FOR UPDATE USING (auth.uid() = user_id);

-- Exercise Stats: Users read own, System writes (mostly) but users might trigger updates
CREATE POLICY "Users can view own exercise stats" ON exercise_stats 
  FOR SELECT USING (auth.uid() = user_id);

-- Daily Plans: Users read their own, System writes
CREATE POLICY "Users can view own daily plans" ON daily_generated_plans 
  FOR SELECT USING (auth.uid() = user_id);
