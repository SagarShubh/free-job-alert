-- DANGER: This will delete all existing data in these tables
drop table if exists public.job_dates;
drop table if exists public.job_fees;
drop table if exists public.job_links;
drop table if exists public.job_vacancies;
drop table if exists public.jobs;

-- Now re-create them
create extension if not exists "uuid-ossp";

-- 1. JOBS Table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  post_date date default current_date,
  update_date date,
  total_vacancy text,
  brief_info text,
  organization text,
  exam_name text,
  is_featured boolean default false,
  job_type text check (job_type in ('state', 'central', 'bank', 'teaching', 'engineering', 'police', 'other')),
  state_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. JOB APPLICATION FEES
create table public.job_fees (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  category_name text not null,
  fee_amount text not null,
  display_order int default 0
);

-- 3. JOB IMPORTANT DATES
create table public.job_dates (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  event_description text not null,
  event_date text,
  display_order int default 0
);

-- 4. VACANCY DETAILS
create table public.job_vacancies (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  post_name text not null,
  total_posts text,
  qualification text,
  display_order int default 0
);

-- 5. IMPORTANT LINKS
create table public.job_links (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  link_title text not null,
  url text,
  is_active boolean default true,
  display_order int default 0
);

-- Row Level Security (RLS) Setup
alter table public.jobs enable row level security;
alter table public.job_fees enable row level security;
alter table public.job_dates enable row level security;
alter table public.job_vacancies enable row level security;
alter table public.job_links enable row level security;

-- Policies (Public Read Access)
create policy "Allow public read access on jobs" on public.jobs for select using (true);
create policy "Allow public read access on job_fees" on public.job_fees for select using (true);
create policy "Allow public read access on job_dates" on public.job_dates for select using (true);
create policy "Allow public read access on job_vacancies" on public.job_vacancies for select using (true);
create policy "Allow public read access on job_links" on public.job_links for select using (true);

-- Insert Dummy Data for Testing
insert into public.jobs (title, slug, post_date, total_vacancy, brief_info, job_type, state_code)
values 
('SBI SCO Recruitment 2025', 'sbi-sco-2025', current_date, '150+', 'State Bank of India (SBI) has announced recruitment for Specialist Cadre Officers.', 'bank', 'ALL');
