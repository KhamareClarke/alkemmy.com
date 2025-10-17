-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  category VARCHAR(100) DEFAULT 'bundles',
  tags TEXT[] DEFAULT '{}',
  bundle_items JSONB DEFAULT '[]', -- Array of product IDs and quantities
  inventory INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundles_is_active ON bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundles_is_featured ON bundles(is_featured);
CREATE INDEX IF NOT EXISTS idx_bundles_category ON bundles(category);
CREATE INDEX IF NOT EXISTS idx_bundles_created_at ON bundles(created_at DESC);

-- Enable RLS
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "bundles_select_policy" ON bundles
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated' OR
    auth.role() = 'anon'
  );

CREATE POLICY "bundles_insert_policy" ON bundles
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "bundles_update_policy" ON bundles
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "bundles_delete_policy" ON bundles
  FOR DELETE USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bundles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bundles_updated_at
  BEFORE UPDATE ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_bundles_updated_at();




