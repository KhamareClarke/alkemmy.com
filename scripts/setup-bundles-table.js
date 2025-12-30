const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please make sure you have:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const bundlesTableSQL = `
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
  bundle_items JSONB DEFAULT '[]',
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
`;

async function setupBundlesTable() {
  console.log('🚀 Setting up bundles table...');
  
  try {
    // Check if bundles table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('bundles')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Bundles table already exists');
      return;
    }
    
    console.log('📝 Creating bundles table...');
    console.log('⚠️  Please run the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('='.repeat(80));
    console.log(bundlesTableSQL);
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Click "Run" to execute');
    console.log('');
    console.log('✅ After running the SQL, your bundles functionality will be ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupBundlesTable();