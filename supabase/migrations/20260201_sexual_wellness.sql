-- Add sexual wellness columns to daily_logs
ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS contraception TEXT[] DEFAULT '{}';
