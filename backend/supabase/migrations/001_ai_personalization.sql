-- Migration: HIPAA Compliant Tables + AI Personalization
-- Run this migration to add new tables for AI personalization and HIPAA compliance

-- ==========================================
-- 1. USER WEIGHT GOALS (Weight Loss Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_weight_goals (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  current_weight_kg NUMERIC NOT NULL,
  target_weight_kg NUMERIC NOT NULL,
  weekly_rate_kg NUMERIC DEFAULT 0.4 CHECK (weekly_rate_kg BETWEEN 0.25 AND 0.75),
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS for weight goals
ALTER TABLE user_weight_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weight goals" ON user_weight_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight goals" ON user_weight_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight goals" ON user_weight_goals FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 2. USER FITNESS PROFILE (Extended Personalization)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_fitness_profile (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  fitness_goal TEXT CHECK (fitness_goal IN ('strength', 'endurance', 'flexibility', 'weight_loss', 'muscle_gain', 'maintenance', 'energy', 'hormone_balance')),
  preferred_workout_time TEXT CHECK (preferred_workout_time IN ('morning', 'afternoon', 'evening')),
  workout_duration_mins INTEGER DEFAULT 30,
  equipment_available TEXT[] DEFAULT '{}',
  injuries_limitations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS for fitness profile
ALTER TABLE user_fitness_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fitness profile" ON user_fitness_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fitness profile" ON user_fitness_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fitness profile" ON user_fitness_profile FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 3. AI CACHE KEYS (For Hybrid Caching)
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_cache_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  cache_type TEXT CHECK (cache_type IN ('diet', 'exercise', 'workout', 'phase')),
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  hit_count INTEGER DEFAULT 0
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_cache_key ON ai_cache_keys(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON ai_cache_keys(expires_at);

-- Function to increment cache hit count
CREATE OR REPLACE FUNCTION increment_cache_hit(key TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_cache_keys SET hit_count = hit_count + 1 WHERE cache_key = key;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. AUDIT LOGS (HIPAA Compliance)
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'PHI_ACCESS', 'PHI_CREATE', 'PHI_UPDATE', 'PHI_DELETE',
    'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT',
    'EXPORT_DATA', 'AI_REQUEST'
  )),
  user_id UUID REFERENCES public.profiles(id),
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type, created_at DESC);

-- RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- 5. AUDIT TRIGGERS FOR PHI TABLES
-- ==========================================
CREATE OR REPLACE FUNCTION log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (event_type, user_id, resource_type, resource_id, details)
  VALUES (
    CASE TG_OP
      WHEN 'INSERT' THEN 'PHI_CREATE'
      WHEN 'UPDATE' THEN 'PHI_UPDATE'
      WHEN 'DELETE' THEN 'PHI_DELETE'
      ELSE 'PHI_ACCESS'
    END,
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('operation', TG_OP)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to PHI tables
DROP TRIGGER IF EXISTS audit_daily_logs ON daily_logs;
CREATE TRIGGER audit_daily_logs 
  AFTER INSERT OR UPDATE OR DELETE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION log_phi_access();

DROP TRIGGER IF EXISTS audit_cycle_settings ON user_cycle_settings;
CREATE TRIGGER audit_cycle_settings 
  AFTER INSERT OR UPDATE OR DELETE ON user_cycle_settings
  FOR EACH ROW EXECUTE FUNCTION log_phi_access();

-- ==========================================
-- 6. EXTEND USER_LIFESTYLE (Add fitness_goal)
-- ==========================================
-- Note: user_lifestyle table may already exist, so we use ALTER TABLE
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_lifestyle' AND column_name = 'fitness_goal') THEN
    ALTER TABLE user_lifestyle ADD COLUMN fitness_goal TEXT;
  END IF;
END $$;

-- ==========================================
-- 7. DATA EXPORT FUNCTION (HIPAA Right of Access)
-- ==========================================
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Log the export request
  INSERT INTO audit_logs (event_type, user_id, details)
  VALUES ('EXPORT_DATA', target_user_id, '{"reason": "user_request"}');
  
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE id = target_user_id),
    'onboarding', (SELECT row_to_json(o) FROM user_onboarding o WHERE user_id = target_user_id),
    'cycle_settings', (SELECT row_to_json(c) FROM user_cycle_settings c WHERE user_id = target_user_id),
    'weight_goals', (SELECT row_to_json(w) FROM user_weight_goals w WHERE user_id = target_user_id),
    'fitness_profile', (SELECT row_to_json(f) FROM user_fitness_profile f WHERE user_id = target_user_id),
    'daily_logs', (SELECT jsonb_agg(row_to_json(l)) FROM daily_logs l WHERE user_id = target_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
