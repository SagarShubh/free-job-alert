-- Create enum for post types
create type post_type_enum as enum ('job_notification', 'admit_card', 'result');

-- Updates jobs table
alter table public.jobs 
add column if not exists post_type post_type_enum default 'job_notification';

-- Add index for faster filtering
create index if not exists idx_jobs_post_type on public.jobs(post_type);
