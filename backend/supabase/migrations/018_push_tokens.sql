-- Stores Expo push tokens registered from the mobile app (Item 27 of
-- docs/react-native-migration-team-plan.md — push-notification scaffolding).
-- One row per (user, device): a user can have several devices, so tokens are
-- upserted on device_id, not on user_id alone.

CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user ON user_push_tokens(user_id);

ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push tokens" ON user_push_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own push tokens" ON user_push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own push tokens" ON user_push_tokens
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own push tokens" ON user_push_tokens
  FOR DELETE USING (auth.uid() = user_id);
