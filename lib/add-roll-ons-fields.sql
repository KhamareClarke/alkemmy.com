-- Add main_ingredient, formulation, and usage_area fields to roll_ons table
ALTER TABLE roll_ons 
ADD COLUMN IF NOT EXISTS main_ingredient TEXT,
ADD COLUMN IF NOT EXISTS formulation TEXT,
ADD COLUMN IF NOT EXISTS usage_area TEXT;

-- Update existing records with sample data
UPDATE roll_ons 
SET 
  main_ingredient = CASE 
    WHEN title ILIKE '%peppermint%' THEN 'Peppermint'
    WHEN title ILIKE '%lavender%' THEN 'Lavender'
    WHEN title ILIKE '%eucalyptus%' THEN 'Eucalyptus'
    WHEN title ILIKE '%lemongrass%' THEN 'Lemongrass'
    WHEN title ILIKE '%tea tree%' THEN 'Tea Tree'
    ELSE 'Peppermint'
  END,
  formulation = CASE 
    WHEN title ILIKE '%essential%' THEN 'Essential Oil Blend'
    WHEN title ILIKE '%herbal%' THEN 'Herbal Extract'
    WHEN title ILIKE '%alcohol%' THEN 'Alcohol-free'
    ELSE 'Essential Oil Blend'
  END,
  usage_area = CASE 
    WHEN title ILIKE '%headache%' OR title ILIKE '%forehead%' THEN 'Forehead'
    WHEN title ILIKE '%neck%' THEN 'Neck'
    WHEN title ILIKE '%wrist%' THEN 'Wrist'
    WHEN title ILIKE '%body%' THEN 'Body'
    ELSE 'Forehead'
  END
WHERE main_ingredient IS NULL OR formulation IS NULL OR usage_area IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roll_ons_main_ingredient ON roll_ons(main_ingredient);
CREATE INDEX IF NOT EXISTS idx_roll_ons_formulation ON roll_ons(formulation);
CREATE INDEX IF NOT EXISTS idx_roll_ons_usage_area ON roll_ons(usage_area);








