-- Guarantees the conflict target that lib/plan.ts (and lib/onboarding.ts,
-- lib/profile.ts) rely on actually exists.
--
-- The migrations in this repo declare user_lifestyle.user_id and
-- user_weight_goals.user_id as PRIMARY KEY, but the live DB reports a
-- constraint named "user_lifestyle_user_id_key" -- the name Postgres gives a
-- UNIQUE (not a PK) constraint -- which means those tables were created there
-- with a surrogate `id` primary key plus a separate UNIQUE (user_id). An
-- upsert that says onConflict: 'user_id' needs SOME unique index on user_id to
-- exist; a PK on user_id satisfies that, and so does the UNIQUE. This adds the
-- UNIQUE only where neither is present, so every environment converges on a
-- schema where "one lifestyle row / one weight goal per user" is enforced and
-- addressable as a conflict target.
--
-- Idempotent and safe to re-run.

DO $$
DECLARE
    has_unique BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public' AND t.relname = 'user_lifestyle'
          AND i.indisunique
          AND i.indnatts = 1
          AND i.indkey[0] = (
              SELECT attnum FROM pg_attribute
              WHERE attrelid = t.oid AND attname = 'user_id'
          )
    ) INTO has_unique;

    IF NOT has_unique THEN
        ALTER TABLE public.user_lifestyle
            ADD CONSTRAINT user_lifestyle_user_id_key UNIQUE (user_id);
    END IF;
END $$;

DO $$
DECLARE
    has_unique BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public' AND t.relname = 'user_weight_goals'
          AND i.indisunique
          AND i.indnatts = 1
          AND i.indkey[0] = (
              SELECT attnum FROM pg_attribute
              WHERE attrelid = t.oid AND attname = 'user_id'
          )
    ) INTO has_unique;

    IF NOT has_unique THEN
        ALTER TABLE public.user_weight_goals
            ADD CONSTRAINT user_weight_goals_user_id_key UNIQUE (user_id);
    END IF;
END $$;
