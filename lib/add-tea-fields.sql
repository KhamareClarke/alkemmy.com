-- Add main_ingredient and form fields to herbal_teas table
ALTER TABLE herbal_teas 
ADD COLUMN IF NOT EXISTS main_ingredient TEXT,
ADD COLUMN IF NOT EXISTS form TEXT;

-- Update existing records with sample data
UPDATE herbal_teas 
SET 
  main_ingredient = CASE 
    WHEN title ILIKE '%green%' OR title ILIKE '%fat%' THEN 'Green Tea'
    WHEN title ILIKE '%chamomile%' THEN 'Chamomile'
    WHEN title ILIKE '%ginger%' THEN 'Ginger'
    ELSE 'Green Tea'
  END,
  form = CASE 
    WHEN title ILIKE '%chamomile%' THEN 'Tea Bags'
    ELSE 'Loose Leaf'
  END
WHERE main_ingredient IS NULL OR form IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_herbal_teas_main_ingredient ON herbal_teas(main_ingredient);
CREATE INDEX IF NOT EXISTS idx_herbal_teas_form ON herbal_teas(form);








