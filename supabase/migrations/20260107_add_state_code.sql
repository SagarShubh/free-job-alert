ALTER TABLE jobs ADD COLUMN IF NOT EXISTS state_code TEXT;
CREATE INDEX IF NOT EXISTS idx_jobs_state_code ON jobs(state_code);
