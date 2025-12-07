-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Extends Auth)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- USER ONBOARDING (Health Metrics)
create table user_onboarding (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  date_of_birth date,
  height_cm numeric,
  weight_kg numeric,
  activity_level text check (activity_level in ('sedentary', 'moderate', 'active', 'athlete')),
  dietary_preferences text[], -- e.g., ['vegan', 'gluten-free']
  metabolic_conditions text[], -- e.g., ['pcos', 'thyroid']
  primary_goal text check (primary_goal in ('weight_loss', 'maintenance', 'muscle_gain', 'energy', 'hormone_balance')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- USER CYCLE SETTINGS
create table user_cycle_settings (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  last_period_start date not null,
  cycle_length_days int default 28,
  period_length_days int default 5,
  is_irregular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- DAILY PLANS (AI Cache)
create table daily_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  plan_content jsonb not null, -- Stores the entire AI JSON response (nutrition, movement, focus)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, date)
);

-- RLS POLICIES
alter table profiles enable row level security;
alter table user_onboarding enable row level security;
alter table user_cycle_settings enable row level security;
alter table daily_plans enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Onboarding policies
create policy "Users can view own onboarding." on user_onboarding for select using ( auth.uid() = user_id );
create policy "Users can insert own onboarding." on user_onboarding for insert with check ( auth.uid() = user_id );
create policy "Users can update own onboarding." on user_onboarding for update using ( auth.uid() = user_id );

-- Cycle Settings policies
create policy "Users can view own cycle settings." on user_cycle_settings for select using ( auth.uid() = user_id );
create policy "Users can insert own cycle settings." on user_cycle_settings for insert with check ( auth.uid() = user_id );
create policy "Users can update own cycle settings." on user_cycle_settings for update using ( auth.uid() = user_id );

-- Daily Plans policies
create policy "Users can view own daily plans." on daily_plans for select using ( auth.uid() = user_id );
create policy "Users can insert own daily plans." on daily_plans for insert with check ( auth.uid() = user_id );

-- TRIGGERS
-- Handle new user creation (auto-create profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
