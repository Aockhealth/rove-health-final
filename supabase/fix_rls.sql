
-- Enable RLS on daily_plans if not already enabled
alter table daily_plans enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can insert their own plans" on daily_plans;
drop policy if exists "Users can update their own plans" on daily_plans;
drop policy if exists "Users can select their own plans" on daily_plans;
drop policy if exists "Users can delete their own plans" on daily_plans;

-- Create comprehensive policies
create policy "Users can insert their own plans"
on daily_plans for insert
with check (auth.uid() = user_id);

create policy "Users can update their own plans"
on daily_plans for update
using (auth.uid() = user_id);

create policy "Users can select their own plans"
on daily_plans for select
using (auth.uid() = user_id);

create policy "Users can delete their own plans"
on daily_plans for delete
using (auth.uid() = user_id);
