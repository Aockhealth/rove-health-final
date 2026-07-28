-- workout_sessions has RLS enabled but was never given policies (it was
-- created outside the tracked migrations, unlike exercise_history in
-- 003_enhanced_tracking.sql which already has this same policy set).
-- With RLS on and no policies, every insert/select is denied by default —
-- this is why saving a workout session failed with 42501.

CREATE POLICY "Users can view own workout sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);
