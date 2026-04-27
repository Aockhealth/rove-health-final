-- Content Library for Dynamic Recommendations
-- This table stores all the "snippets" (Recipes, Workouts, Rituals) 
-- that the Edge Function will select from based on user tags.

CREATE TABLE IF NOT EXISTS content_library (
  id uuid primary key default gen_random_uuid(),
  
  -- Category: What kind of content is this?
  category text not null check (category in ('fuel', 'move', 'ritual')),
  
  -- Phase: When should this be shown?
  phase text not null check (phase in ('Menstrual', 'Follicular', 'Ovulatory', 'Luteal')),
  
  -- Display Content
  title text not null,          -- e.g., "Spinach & Berry Smoothie"
  description text,             -- e.g., "Rich in iron for menstrual replenishment."
  icon text,                    -- e.g., "leaf", "dumbbell" (maps to Lucide icons on frontend)
  
  -- The Magic Filter: Personalization Tags
  -- Example: ['vegetarian', 'breakfast', 'low_calorie']
  tags text[] default '{}',
  
  -- Optional: External links or detailed markdown content
  content_url text,  
  detail_markdown text,

  created_at timestamptz default now()
);

-- Enable RLS (Read-only for users, Admin write access)
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON content_library
  FOR SELECT USING (true);

-- Indexes for fast filtering
CREATE INDEX idx_content_tags ON content_library using gin(tags);
CREATE INDEX idx_content_phase_cat ON content_library(phase, category);
