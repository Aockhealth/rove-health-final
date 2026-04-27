-- Validate insights phase calculations against tracker logic (manual run)
-- Replace :user_id with the target user's UUID

WITH logs AS (
  SELECT
    date,
    is_period
  FROM daily_logs
  WHERE user_id = :user_id
  ORDER BY date
),
period_streaks AS (
  SELECT
    date,
    CASE
      WHEN lag(date) OVER (ORDER BY date) = date - INTERVAL '1 day' THEN NULL
      ELSE date
    END AS streak_start
  FROM logs
  WHERE is_period IS TRUE
),
logs_with_start AS (
  SELECT
    l.*,
    MAX(ps.streak_start) OVER (ORDER BY l.date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS latest_streak_start
  FROM logs l
  LEFT JOIN period_streaks ps ON ps.date = l.date
),
settings AS (
  SELECT
    last_period_start,
    cycle_length_days,
    period_length_days
  FROM user_cycle_settings
  WHERE user_id = :user_id
),
calc_base AS (
  SELECT
    lws.*,
    COALESCE(
      lws.latest_streak_start,
      CASE
        WHEN s.last_period_start <= lws.date THEN s.last_period_start
        ELSE NULL
      END
    ) AS effective_start,
    COALESCE(s.cycle_length_days, 28) AS cycle_len,
    COALESCE(s.period_length_days, 5) AS period_len
  FROM logs_with_start lws
  CROSS JOIN settings s
),
phase_calculations AS (
  SELECT
    date,
    is_period,
    effective_start,
    CASE WHEN effective_start IS NULL THEN NULL ELSE (date - effective_start) END AS diff_days,
    CASE WHEN effective_start IS NULL THEN NULL ELSE ((date - effective_start) % cycle_len) + 1 END AS cycle_day,
    CASE
      WHEN is_period IS TRUE THEN 'Menstrual'
      WHEN effective_start IS NULL THEN NULL
      WHEN date <= CURRENT_DATE AND (date - effective_start) >= cycle_len THEN 'Luteal'
      WHEN ((date - effective_start) % cycle_len) + 1 <= period_len
           AND is_period IS DISTINCT FROM FALSE THEN 'Menstrual'
      WHEN ((date - effective_start) % cycle_len) + 1 < cycle_len - 15 THEN 'Follicular'
      WHEN ((date - effective_start) % cycle_len) + 1 <= cycle_len - 13 THEN 'Ovulatory'
      ELSE 'Luteal'
    END AS phase
  FROM calc_base
)
SELECT
  date,
  is_period,
  effective_start,
  cycle_day,
  phase,
  CASE
    WHEN diff_days IS NULL THEN NULL
    WHEN diff_days >= cycle_len THEN diff_days + 1 - cycle_len
    ELSE 0
  END AS late_by_days
FROM phase_calculations
ORDER BY date DESC;
