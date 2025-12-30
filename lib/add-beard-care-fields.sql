-- Add fragrance and concern fields to beard_care table
ALTER TABLE beard_care 
ADD COLUMN IF NOT EXISTS fragrance TEXT,
ADD COLUMN IF NOT EXISTS concern TEXT;

-- Update existing records with sample data
UPDATE beard_care 
SET 
  fragrance = CASE 
    WHEN title ILIKE '%woody%' OR title ILIKE '%sandalwood%' THEN 'Woody'
    WHEN title ILIKE '%citrus%' OR title ILIKE '%lemon%' THEN 'Citrus'
    WHEN title ILIKE '%musk%' THEN 'Musk'
    WHEN title ILIKE '%herbal%' THEN 'Herbal'
    ELSE 'Woody'
  END,
  concern = CASE 
    WHEN title ILIKE '%growth%' THEN 'Growth'
    WHEN title ILIKE '%soft%' THEN 'Softening'
    WHEN title ILIKE '%itch%' THEN 'Itch Relief'
    WHEN title ILIKE '%shine%' THEN 'Shine'
    ELSE 'Growth'
  END
WHERE fragrance IS NULL OR concern IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beard_care_fragrance ON beard_care(fragrance);
CREATE INDEX IF NOT EXISTS idx_beard_care_concern ON beard_care(concern);








