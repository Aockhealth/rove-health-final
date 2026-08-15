-- Adds a 1-5 severity rating per logged symptom, additive alongside the
-- existing `symptoms` presence array so nothing that already reads
-- daily_logs.symptoms (Insights, the health report, the phase engine) needs
-- to change. Keyed by the same label strings used in `symptoms`.
ALTER TABLE daily_logs
ADD COLUMN IF NOT EXISTS symptom_severity jsonb DEFAULT '{}'::jsonb;
