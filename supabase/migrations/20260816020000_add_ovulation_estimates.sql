-- Audit trail for TTC ovulation reads: "why did the app say day 15 last
-- month?" is a support question, a debugging question, and eventually
-- possibly a regulatory one, so the computed signal needs to be durable, not
-- just recomputed live every time and thrown away.
--
-- signal_snapshot stores the full computed OvulationSignal as JSON at write
-- time. It is deliberately NOT called "posterior" — this algorithm computes
-- a rule-based read (predict vs. confirm, see shared/cycle/ttc.ts), not a
-- Bayesian probability distribution, and naming the column that would imply
-- a kind of statistical output this codebase doesn't produce.

CREATE TABLE IF NOT EXISTS ovulation_estimates (
  user_id uuid REFERENCES auth.users NOT NULL,
  cycle_start date NOT NULL,
  status text NOT NULL,
  method text NOT NULL,
  confirmed_date date,
  predicted_date date,
  fertile_window_start date,
  fertile_window_end date,
  confidence text NOT NULL,
  contributing_signals text[] NOT NULL DEFAULT '{}',
  anovulatory_detected boolean NOT NULL DEFAULT false,
  anovulatory_reasons text[] NOT NULL DEFAULT '{}',
  periovulatory_nsaid_flag boolean NOT NULL DEFAULT false,
  explanation text,
  signal_snapshot jsonb NOT NULL,
  algorithm_version text NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, cycle_start)
);

ALTER TABLE ovulation_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ovulation estimates" ON ovulation_estimates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ovulation estimates" ON ovulation_estimates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ovulation estimates" ON ovulation_estimates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ovulation_estimates_user ON ovulation_estimates (user_id, cycle_start DESC);

COMMENT ON TABLE ovulation_estimates IS 'One row per cycle: the latest computed ovulation read, recomputed and upserted on every new signal event (TTC mode).';
COMMENT ON COLUMN ovulation_estimates.signal_snapshot IS 'The full OvulationSignal object at write time, for audit/debugging — not a probability distribution.';
COMMENT ON COLUMN ovulation_estimates.algorithm_version IS 'Which version of the engine produced this row — required so a later weight/threshold change can never silently reinterpret old history.';
