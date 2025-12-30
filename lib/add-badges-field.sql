-- Add badges field to all category tables
-- This script adds the badges TEXT[] field to all existing category tables

-- Add badges field to soaps table
ALTER TABLE soaps ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to herbal_teas table
ALTER TABLE herbal_teas ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to lotions table
ALTER TABLE lotions ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to oils table
ALTER TABLE oils ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to beard_care table
ALTER TABLE beard_care ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to shampoos table
ALTER TABLE shampoos ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to roll_ons table
ALTER TABLE roll_ons ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges field to elixirs table
ALTER TABLE elixirs ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Update the updated_at trigger to include badges field
-- (The existing trigger should already handle this, but we'll make sure)

-- Add some sample badges to existing products for testing
UPDATE soaps SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Empire Bar';
UPDATE soaps SET badges = ARRAY['trending', 'new'] WHERE title = 'Tea Tree Bar';
UPDATE soaps SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Lavender Dreams';

UPDATE herbal_teas SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Chamomile Calm';
UPDATE herbal_teas SET badges = ARRAY['trending', 'new'] WHERE title = 'Green Energy';
UPDATE herbal_teas SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Sleepy Time';

UPDATE lotions SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Hydrating Lotion';
UPDATE lotions SET badges = ARRAY['trending', 'new'] WHERE title = 'Anti-Aging Cream';
UPDATE lotions SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Vitamin C Serum';

UPDATE oils SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Argan Oil';
UPDATE oils SET badges = ARRAY['trending', 'new'] WHERE title = 'Coconut Oil';
UPDATE oils SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Rosehip Oil';

UPDATE beard_care SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Beard Oil';
UPDATE beard_care SET badges = ARRAY['trending', 'new'] WHERE title = 'Beard Balm';
UPDATE beard_care SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Beard Wash';

UPDATE shampoos SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Daily Shampoo';
UPDATE shampoos SET badges = ARRAY['trending', 'new'] WHERE title = 'Clarifying Shampoo';
UPDATE shampoos SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Repair Shampoo';

UPDATE roll_ons SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Deodorant Roll-On';
UPDATE roll_ons SET badges = ARRAY['trending', 'new'] WHERE title = 'Antiperspirant Roll-On';
UPDATE roll_ons SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Natural Deodorant';

UPDATE elixirs SET badges = ARRAY['bestseller', 'organic'] WHERE title = 'Detox Elixir';
UPDATE elixirs SET badges = ARRAY['trending', 'new'] WHERE title = 'Energy Elixir';
UPDATE elixirs SET badges = ARRAY['best_selling', 'premium'] WHERE title = 'Beauty Elixir';