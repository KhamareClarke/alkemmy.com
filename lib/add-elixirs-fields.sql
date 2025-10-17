-- Add main_ingredient and form fields to elixirs table
ALTER TABLE elixirs 
ADD COLUMN IF NOT EXISTS main_ingredient TEXT,
ADD COLUMN IF NOT EXISTS form TEXT;

-- Update existing records with sample data
UPDATE elixirs 
SET 
  main_ingredient = CASE 
    WHEN title ILIKE '%amla%' THEN 'Amla'
    WHEN title ILIKE '%ashwagandha%' THEN 'Ashwagandha'
    WHEN title ILIKE '%turmeric%' THEN 'Turmeric'
    WHEN title ILIKE '%tulsi%' THEN 'Tulsi'
    WHEN title ILIKE '%giloy%' THEN 'Giloy'
    WHEN title ILIKE '%spirulina%' THEN 'Spirulina'
    ELSE 'Amla'
  END,
  form = CASE 
    WHEN title ILIKE '%drops%' THEN 'Drops'
    WHEN title ILIKE '%tonic%' THEN 'Tonic'
    WHEN title ILIKE '%capsules%' THEN 'Capsules'
    ELSE 'Liquid'
  END
WHERE main_ingredient IS NULL OR form IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_elixirs_main_ingredient ON elixirs(main_ingredient);
CREATE INDEX IF NOT EXISTS idx_elixirs_form ON elixirs(form);








