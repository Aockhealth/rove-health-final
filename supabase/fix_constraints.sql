-- Remove the restrictive CHECK constraint on primary_goal
-- This allows us to store multiple goals as a comma-separated string, or new goal types.
ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_primary_goal_check;

-- Optionally, if we added new tracker modes that aren't in the original check, we should drop that too.
-- The current code uses 'menstruation', 'ttc', 'menopause' which match the schema, but robustifying it is good.
-- ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_tracker_mode_check;
