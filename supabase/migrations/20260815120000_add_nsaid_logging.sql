-- TTC mode's quick-log sheet asks whether an NSAID/painkiller was taken
-- today, since NSAIDs are linked to suppressed ovulation around the fertile
-- window. One boolean per user per day, alongside bbt_celsius/opk_result.

ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS nsaid_taken boolean DEFAULT false;

COMMENT ON COLUMN daily_logs.nsaid_taken IS 'Whether an NSAID/painkiller was logged as taken this day (TTC mode).';
