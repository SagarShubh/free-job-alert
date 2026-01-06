-- Add status and tracking fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS ai_confidence numeric;

-- Update RLS to only allow public to see published jobs
DROP POLICY IF EXISTS "Allow public read access on jobs" ON public.jobs;
CREATE POLICY "Allow public read access on published jobs" ON public.jobs 
FOR SELECT USING (status = 'published');

-- Allow authenticated users (admins) to see all jobs (drafts included)
CREATE POLICY "Allow admin full access" ON public.jobs 
FOR ALL USING (auth.role() = 'authenticated');
