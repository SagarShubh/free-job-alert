-- Add columns to support Discovery Engine flat drafts
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS application_fee text,
ADD COLUMN IF NOT EXISTS age_limit text,
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS important_dates jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS important_links jsonb DEFAULT '[]'::jsonb;
