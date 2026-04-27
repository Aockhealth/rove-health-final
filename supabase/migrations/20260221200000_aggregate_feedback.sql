-- Feedback Analysis Pipeline
-- Aggregates negative chat feedback for prompt refinement

-- Function to aggregate negative feedback patterns
CREATE OR REPLACE FUNCTION aggregate_chat_feedback(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    feedback_date DATE,
    negative_count BIGINT,
    total_count BIGINT,
    negative_rate NUMERIC,
    sample_messages JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.created_at::DATE AS feedback_date,
        COUNT(*) FILTER (WHERE f.feedback = -1) AS negative_count,
        COUNT(*) AS total_count,
        ROUND(
            COUNT(*) FILTER (WHERE f.feedback = -1)::NUMERIC / NULLIF(COUNT(*), 0),
            3
        ) AS negative_rate,
        -- Aggregate up to 5 sample negative messages per day (anonymized — no user_id)
        COALESCE(
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'assistant_message', LEFT(f.assistant_message, 200),
                    'session_id', f.session_id,
                    'created_at', f.created_at
                )
            ) FILTER (WHERE f.feedback = -1),
            '[]'::JSONB
        ) AS sample_messages
    FROM chat_message_feedback f
    WHERE f.created_at >= p_start_date
      AND f.created_at <= p_end_date
    GROUP BY f.created_at::DATE
    ORDER BY feedback_date DESC;
END;
$$;

-- Index to speed up feedback date-range queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at
    ON chat_message_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_negative
    ON chat_message_feedback(feedback) WHERE feedback = -1;
