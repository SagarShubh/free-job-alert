-- Add pattern detection columns to jobs table
ALTER TABLE jobs 
ADD COLUMN pattern_change_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN pattern_change_summary TEXT;

-- Create an index for fast filtering of changed exams
CREATE INDEX idx_jobs_pattern_change ON jobs(pattern_change_detected);
