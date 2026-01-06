-- Create types for source monitoring
create type source_status as enum ('active', 'blocked', 'error');
create type target_type_enum as enum ('job', 'admit_card', 'result');

-- Create sources table
create table public.sources (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  url text not null unique,
  pattern text, 
  target_type target_type_enum default 'job',
  last_checked_at timestamp with time zone,
  status source_status default 'active',
  error_log text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.sources enable row level security;
create policy "Allow public read access on sources" on public.sources for select using (true);
create policy "Allow service role full access on sources" on public.sources for all using (true);
