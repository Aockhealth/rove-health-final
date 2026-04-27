-- Migration: User Preferences for Content Filtering
-- This table stores the "Tags" that map to the Content Library.
-- It simplifies personalization by flattening complex profiles into simple tag arrays.

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Diet Tags: ['vegetarian', 'jain', 'gluten_free', 'non_veg']
  -- Maps to content_library.tags (Diet category)
  diet_tags TEXT[] DEFAULT '{}',
  
  -- Fitness Tags: ['home_based', 'gym_based', 'beginner', 'advanced']
  -- Maps to content_library.tags (Fitness category)
  fitness_tags TEXT[] DEFAULT '{}',
  
  -- Health/Symptom Tags: ['pcos', 'endo', 'regular', 'irregular']
  -- Chronic conditions to always filter for
  health_tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
