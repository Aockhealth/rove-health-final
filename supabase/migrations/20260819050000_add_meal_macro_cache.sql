-- Shared macro-estimate cache for estimate-meal-macros edge function.
-- Global (not per-user) since a food's composition is an objective fact, not
-- personal data — one Gemini call for "1 plate dal" benefits every user who
-- later logs "dal" in any gram-convertible unit (katori, bowl, cup, etc.),
-- not just the person who first triggered it.
--
-- Two row "tiers", distinguished by the `unit` column:
--   - unit = '__per_100g__'  -> gram-convertible tier: macros per 100g of
--     food_key. Populated whenever the logged unit has a known gram
--     equivalent (katori, bowl, plate, cup, glass, tbsp, tsp, scoop, g/kg/ml/l).
--     Any future request in ANY gram-convertible unit for the same food_key
--     scales off this row with zero AI calls.
--   - unit = '__none__' or a specific non-convertible unit (e.g. 'piece') ->
--     freeform tier: macros per single unit of food_key in that exact unit.
--     Only scales for repeats of the same unit (e.g. "2 pieces" off a cached
--     "1 piece"), not cross-unit.

create table if not exists public.meal_macro_cache (
  id uuid primary key default gen_random_uuid(),
  food_key text not null,
  unit text not null,
  calories numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  confidence text not null default 'medium',
  hits integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (food_key, unit)
);

create index if not exists meal_macro_cache_food_key_idx on public.meal_macro_cache (food_key);

alter table public.meal_macro_cache enable row level security;

-- No client policies: this table is only ever read/written by the
-- estimate-meal-macros edge function using the service-role key. Regular
-- users (anon/authenticated) get no direct access.
