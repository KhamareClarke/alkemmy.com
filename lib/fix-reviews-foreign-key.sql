-- Fix reviews table foreign key constraint
-- The reviews table currently references 'users' table but should reference 'profiles' table

-- First, drop the existing foreign key constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add the correct foreign key constraint to reference profiles table
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also ensure the reviews table has the correct structure
-- Add any missing columns if needed
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id UUID NOT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Ensure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;

-- Create RLS policies
CREATE POLICY "reviews_select_policy" ON reviews
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() = user_id OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "reviews_insert_policy" ON reviews
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.uid() = user_id
  );

CREATE POLICY "reviews_update_policy" ON reviews
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.uid() = user_id
  );

CREATE POLICY "reviews_delete_policy" ON reviews
  FOR DELETE USING (
    auth.role() = 'service_role' OR
    auth.uid() = user_id
  );




