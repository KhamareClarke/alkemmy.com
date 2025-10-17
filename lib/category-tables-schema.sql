-- Category-specific tables schema for Alkemmy.com
-- Each category has its own table with specific fields

-- 1. SOAPS TABLE
CREATE TABLE IF NOT EXISTS soaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  soap_type VARCHAR(100), -- e.g., 'Bar', 'Liquid', 'Exfoliating'
  skin_type VARCHAR(100), -- e.g., 'All Skin Types', 'Sensitive', 'Oily'
  scent VARCHAR(100), -- e.g., 'Unscented', 'Lavender', 'Tea Tree'
  weight_grams INTEGER, -- Weight of soap bar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HERBAL TEAS TABLE
CREATE TABLE IF NOT EXISTS herbal_teas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  tea_type VARCHAR(100), -- e.g., 'Green', 'Black', 'Herbal', 'White'
  benefits TEXT[] DEFAULT '{}', -- e.g., ['Weight Loss', 'Detox', 'Energy']
  caffeine_level VARCHAR(50), -- e.g., 'Caffeine-Free', 'Low', 'Medium', 'High'
  steeping_time INTEGER, -- Minutes
  temperature_celsius INTEGER, -- Water temperature
  weight_grams INTEGER, -- Package weight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LOTIONS TABLE
CREATE TABLE IF NOT EXISTS lotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  lotion_type VARCHAR(100), -- e.g., 'Body Lotion', 'Face Cream', 'Hand Cream'
  skin_type VARCHAR(100), -- e.g., 'All Skin Types', 'Dry', 'Sensitive'
  spf_level INTEGER, -- SPF rating if applicable
  volume_ml INTEGER, -- Volume in milliliters
  texture VARCHAR(100), -- e.g., 'Light', 'Medium', 'Rich'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. OILS TABLE
CREATE TABLE IF NOT EXISTS oils (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  oil_type VARCHAR(100), -- e.g., 'Hair Oil', 'Body Oil', 'Face Oil', 'Essential Oil'
  application_area VARCHAR(100), -- e.g., 'Hair', 'Face', 'Body', 'All Over'
  extraction_method VARCHAR(100), -- e.g., 'Cold Pressed', 'Steam Distilled'
  volume_ml INTEGER, -- Volume in milliliters
  carrier_oil VARCHAR(100), -- e.g., 'Coconut', 'Jojoba', 'Argan'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BEARD CARE TABLE
CREATE TABLE IF NOT EXISTS beard_care (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  product_type VARCHAR(100), -- e.g., 'Beard Oil', 'Beard Balm', 'Beard Wash', 'Beard Brush'
  beard_length VARCHAR(100), -- e.g., 'Short', 'Medium', 'Long', 'All Lengths'
  scent VARCHAR(100), -- e.g., 'Unscented', 'Sandalwood', 'Cedarwood'
  hold_strength VARCHAR(100), -- e.g., 'Light', 'Medium', 'Strong' (for balms)
  volume_ml INTEGER, -- Volume in milliliters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SHAMPOOS TABLE
CREATE TABLE IF NOT EXISTS shampoos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  product_type VARCHAR(100), -- e.g., 'Shampoo', 'Conditioner', '2-in-1'
  hair_type VARCHAR(100), -- e.g., 'All Hair Types', 'Dry', 'Oily', 'Color-Treated'
  hair_concern VARCHAR(100), -- e.g., 'Volume', 'Moisture', 'Damage Repair'
  volume_ml INTEGER, -- Volume in milliliters
  sulfate_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ROLL ONS TABLE
CREATE TABLE IF NOT EXISTS roll_ons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  roll_on_type VARCHAR(100), -- e.g., 'Essential Oil', 'Deodorant', 'Pain Relief'
  application_area VARCHAR(100), -- e.g., 'Pulse Points', 'Underarms', 'Temples'
  scent VARCHAR(100), -- e.g., 'Lavender', 'Peppermint', 'Eucalyptus'
  volume_ml INTEGER, -- Volume in milliliters
  concentration VARCHAR(100), -- e.g., 'Diluted', 'Pure', 'Blend'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ELIXIRS TABLE
CREATE TABLE IF NOT EXISTS elixirs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  how_to_use TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  elixir_type VARCHAR(100), -- e.g., 'Immunity', 'Energy', 'Sleep', 'Detox'
  benefits TEXT[] DEFAULT '{}', -- e.g., ['Boosts Immunity', 'Improves Sleep', 'Increases Energy']
  dosage VARCHAR(100), -- e.g., '1 dropper daily', '2 teaspoons morning'
  volume_ml INTEGER, -- Volume in milliliters
  alcohol_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_soaps_slug ON soaps(slug);
CREATE INDEX IF NOT EXISTS idx_soaps_in_stock ON soaps(in_stock);
CREATE INDEX IF NOT EXISTS idx_soaps_rating ON soaps(rating);

CREATE INDEX IF NOT EXISTS idx_herbal_teas_slug ON herbal_teas(slug);
CREATE INDEX IF NOT EXISTS idx_herbal_teas_in_stock ON herbal_teas(in_stock);
CREATE INDEX IF NOT EXISTS idx_herbal_teas_rating ON herbal_teas(rating);

CREATE INDEX IF NOT EXISTS idx_lotions_slug ON lotions(slug);
CREATE INDEX IF NOT EXISTS idx_lotions_in_stock ON lotions(in_stock);
CREATE INDEX IF NOT EXISTS idx_lotions_rating ON lotions(rating);

CREATE INDEX IF NOT EXISTS idx_oils_slug ON oils(slug);
CREATE INDEX IF NOT EXISTS idx_oils_in_stock ON oils(in_stock);
CREATE INDEX IF NOT EXISTS idx_oils_rating ON oils(rating);

CREATE INDEX IF NOT EXISTS idx_beard_care_slug ON beard_care(slug);
CREATE INDEX IF NOT EXISTS idx_beard_care_in_stock ON beard_care(in_stock);
CREATE INDEX IF NOT EXISTS idx_beard_care_rating ON beard_care(rating);

CREATE INDEX IF NOT EXISTS idx_shampoos_slug ON shampoos(slug);
CREATE INDEX IF NOT EXISTS idx_shampoos_in_stock ON shampoos(in_stock);
CREATE INDEX IF NOT EXISTS idx_shampoos_rating ON shampoos(rating);

CREATE INDEX IF NOT EXISTS idx_roll_ons_slug ON roll_ons(slug);
CREATE INDEX IF NOT EXISTS idx_roll_ons_in_stock ON roll_ons(in_stock);
CREATE INDEX IF NOT EXISTS idx_roll_ons_rating ON roll_ons(rating);

CREATE INDEX IF NOT EXISTS idx_elixirs_slug ON elixirs(slug);
CREATE INDEX IF NOT EXISTS idx_elixirs_in_stock ON elixirs(in_stock);
CREATE INDEX IF NOT EXISTS idx_elixirs_rating ON elixirs(rating);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_soaps_updated_at BEFORE UPDATE ON soaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_herbal_teas_updated_at BEFORE UPDATE ON herbal_teas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lotions_updated_at BEFORE UPDATE ON lotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oils_updated_at BEFORE UPDATE ON oils FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beard_care_updated_at BEFORE UPDATE ON beard_care FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shampoos_updated_at BEFORE UPDATE ON shampoos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roll_ons_updated_at BEFORE UPDATE ON roll_ons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elixirs_updated_at BEFORE UPDATE ON elixirs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE soaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE herbal_teas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE beard_care ENABLE ROW LEVEL SECURITY;
ALTER TABLE shampoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE roll_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE elixirs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Enable read access for all users" ON soaps FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON herbal_teas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON lotions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON oils FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON beard_care FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON shampoos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON roll_ons FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON elixirs FOR SELECT USING (true);








