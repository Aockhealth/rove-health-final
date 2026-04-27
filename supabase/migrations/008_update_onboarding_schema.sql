-- 1. Ensure new columns exist
ALTER TABLE user_onboarding
  ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conditions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS typical_symptoms jsonb DEFAULT '[]';

-- 2. Drop specific constraint if exists (safe to run even if column gone, usually)
-- But `DROP CONSTRAINT` is on valid table.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_onboarding_primary_goal_check') THEN
        ALTER TABLE user_onboarding DROP CONSTRAINT user_onboarding_primary_goal_check;
    END IF;
END $$;

-- 3. Migrate Data safely using Dynamic SQL
DO $$
BEGIN
    -- Handle primary_goal -> goals
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_onboarding' AND column_name = 'primary_goal') THEN
        EXECUTE 'UPDATE user_onboarding SET goals = ARRAY[primary_goal] WHERE primary_goal IS NOT NULL AND (goals IS NULL OR goals = ''{}'')';
    END IF;

    -- Handle metabolic_conditions -> conditions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_onboarding' AND column_name = 'metabolic_conditions') THEN
        EXECUTE 'UPDATE user_onboarding SET conditions = metabolic_conditions WHERE metabolic_conditions IS NOT NULL AND (conditions IS NULL OR conditions = ''{}'')';
    END IF;

    -- Remap Goal Values (Safe to run on 'goals' since we ensured it exists in step 1)
    -- Map 'hormone_balance' -> 'syncing'
    UPDATE user_onboarding SET goals = array_replace(goals, 'hormone_balance', 'syncing');
    -- Map 'maintenance' -> 'tracking'
    UPDATE user_onboarding SET goals = array_replace(goals, 'maintenance', 'tracking');
    -- Map 'energy' -> 'other'
    UPDATE user_onboarding SET goals = array_replace(goals, 'energy', 'other');

END $$;

-- 4. Cleanup Old Columns
ALTER TABLE user_onboarding 
  DROP COLUMN IF EXISTS primary_goal,
  DROP COLUMN IF EXISTS metabolic_conditions,
  DROP COLUMN IF EXISTS fitness_goal,
  DROP COLUMN IF EXISTS dietary_preferences;
