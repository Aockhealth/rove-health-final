-- Migration: Fix Supabase Lint Issues
-- Date: 2026-02-18
-- Description: 
-- 1. Fix Function Search Path Mutable (security best practice)
-- 2. Move extensions to 'extensions' schema
-- 3. Fix Overly Permissive RLS Policies
-- 4. Enable RLS on public tables

-- ==========================================
-- 1. EXTENSION IN PUBLIC (Move to extensions schema)
-- ==========================================

CREATE SCHEMA IF NOT EXISTS extensions;

-- Move moddatetime if it exists in public
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'moddatetime' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER EXTENSION moddatetime SET SCHEMA extensions;
    END IF;
END $$;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Update search_path for database to include extensions
ALTER DATABASE postgres SET search_path TO public, extensions;

-- ==========================================
-- 2. FUNCTION SEARCH PATH MUTABLE
-- ==========================================

-- Helper macro-like approach: We must ALTER each function individually.

-- 2.1 increment_cache_hit
ALTER FUNCTION increment_cache_hit(text) SET search_path = public, extensions, pg_temp;

-- 2.2 log_phi_access
ALTER FUNCTION log_phi_access() SET search_path = public, extensions, pg_temp;

-- 2.3 batch_mark_period_range
ALTER FUNCTION batch_mark_period_range(uuid, date, date, text) SET search_path = public, extensions, pg_temp;

-- 2.4 get_cycle_intelligence
ALTER FUNCTION get_cycle_intelligence(uuid, date) SET search_path = public, extensions, pg_temp;

-- 2.5 get_insights_aggregated
ALTER FUNCTION get_insights_aggregated(uuid) SET search_path = public, extensions, pg_temp;

-- 2.6 fetch_logs_bulk
ALTER FUNCTION fetch_logs_bulk(uuid, text[]) SET search_path = public, extensions, pg_temp;

-- 2.7 export_user_data
ALTER FUNCTION export_user_data(uuid) SET search_path = public, extensions, pg_temp;

-- 2.8 handle_new_user
ALTER FUNCTION handle_new_user() SET search_path = public, extensions, pg_temp;


-- ==========================================
-- 3. RLS POLICY ALWAYS TRUE (Fix Permissive Policies)
-- ==========================================

-- 3.1 audit_logs
-- OLD: CREATE POLICY "Allow audit log inserts" ... WITH CHECK (true);
-- NEW: Restrict to authenticated users inserting their own logs (or system/service_role)
DROP POLICY IF EXISTS "Allow audit log inserts" ON public.audit_logs;

CREATE POLICY "Users can insert own audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3.2 phase_content
-- OLD: CREATE POLICY "Authenticated users can insert phase content" ... WITH CHECK (true);
-- NEW: Restrict to service_role only (Admin/Seed scripts). Users shouldn't insert phase content.
DROP POLICY IF EXISTS "Authenticated users can insert phase content" ON public.phase_content;

CREATE POLICY "Service role can insert phase content" 
ON public.phase_content 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Ensure update policy is also safe (it was using true)
DROP POLICY IF EXISTS "Authenticated users can update phase content" ON public.phase_content;
CREATE POLICY "Service role can update phase content" 
ON public.phase_content 
FOR UPDATE 
TO service_role 
USING (true);


-- ==========================================
-- 4. RLS DISABLED IN PUBLIC (Enable RLS)
-- ==========================================

-- 4.1 learn_articles
DO $$
BEGIN
    -- Check if table exists first to avoid error
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_articles') THEN
        ALTER TABLE public.learn_articles ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy for public read access if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learn_articles' AND policyname = 'Public read access') THEN
            CREATE POLICY "Public read access" 
            ON public.learn_articles 
            FOR SELECT 
            TO anon, authenticated 
            USING (true);
        END IF;
    END IF;
END $$;
