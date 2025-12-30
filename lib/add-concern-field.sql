-- Add concern field to soaps table
ALTER TABLE soaps ADD COLUMN IF NOT EXISTS concern TEXT;

-- Update the RLS policies if needed (they should still work with the new field)
-- The existing policies should handle the new field automatically

-- Add an index for better performance on concern filtering
CREATE INDEX IF NOT EXISTS idx_soaps_concern ON soaps(concern);








