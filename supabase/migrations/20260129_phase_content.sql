-- Table to store the full JSON content for each phase
-- This replaces the static frontend/src/data/phase-content.ts file

create table if not exists phase_content (
  phase text primary key check (phase in ('Menstrual', 'Follicular', 'Ovulatory', 'Luteal')),
  content jsonb not null, -- Stores the full PhaseContent object
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table phase_content enable row level security;

-- Allow public read access (authenticated users)
create policy "Authenticated users can read phase content"
  on phase_content for select
  to authenticated
  using (true);

-- Allow authenticated users to insert (for auto-seeding)
create policy "Authenticated users can insert phase content"
  on phase_content for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update (for CMS features later)
create policy "Authenticated users can update phase content"
  on phase_content for update
  to authenticated
  using (true);

-- Allow public read access (anon users - if needed for landing page etc, but mainly auth)
create policy "Public read access for phase content"
  on phase_content for select
  to anon
  using (true);

-- Function to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_phase_content_updated_at
before update on phase_content
for each row
execute function update_updated_at_column();
