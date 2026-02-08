ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS chat_sessions_id VARCHAR(36) NULL AFTER source;

-- Drop constraint if exists to avoid error on re-adding (somewhat hacky but standard SQL doesn't have ADD CONSTRAINT IF NOT EXISTS easily without procedure)
-- detailed check is hard. simpler to just ignore if it fails or assume if column exists, constraint might too.
-- But for safety, let's just keep the column check.
-- If column exists, we assume constraint might exist or we just want to ensure column is there.

-- Actually, let's try to query information_schema if we can, but inside a simple .sql it is hard without procedure.
-- Let's try just the ADD COLUMN IF NOT EXISTS.
-- If the constraint fails, I will handle it.
