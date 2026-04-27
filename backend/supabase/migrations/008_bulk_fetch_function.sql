
CREATE OR REPLACE FUNCTION fetch_logs_bulk(
    user_id_param UUID,
    month_keys TEXT[]
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    date DATE,
    symptoms TEXT[],
    is_period BOOLEAN,
    flow_intensity TEXT,
    moods TEXT[],
    notes TEXT,
    cervical_discharge TEXT,
    exercise_types TEXT[],
    exercise_minutes INTEGER,
    water_intake INTEGER,
    self_love_tags TEXT[],
    self_love_other TEXT,
    sleep_quality TEXT[],
    sleep_minutes INTEGER,
    disruptors TEXT[],
    mpiq_consistency TEXT,
    mpiq_appearance TEXT,
    mpiq_sensation TEXT,
    mpiq_score INTEGER,
    note TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.id,
        dl.user_id,
        dl.date,
        dl.symptoms,
        dl.is_period,
        dl.flow_intensity,
        dl.moods,
        dl.notes,
        dl.cervical_discharge,
        dl.exercise_types,
        dl.exercise_minutes,
        dl.water_intake,
        dl.self_love_tags,
        dl.self_love_other,
        dl.sleep_quality,
        dl.sleep_minutes,
        dl.disruptors,
        dl.mpiq_consistency,
        dl.mpiq_appearance,
        dl.mpiq_sensation,
        dl.mpiq_score,
        dl.note,
        dl.created_at,
        dl.updated_at
    FROM daily_logs dl
    WHERE dl.user_id = user_id_param
      AND to_char(dl.date, 'YYYY-MM') = ANY(month_keys)
    ORDER BY dl.date;
END;
$$;