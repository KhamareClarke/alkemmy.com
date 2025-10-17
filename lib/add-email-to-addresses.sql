-- Add email field to addresses table for guest orders
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS email TEXT;

-- Update RLS policies to allow email access
DROP POLICY IF EXISTS "addresses_select_policy" ON addresses;
DROP POLICY IF EXISTS "addresses_insert_policy" ON addresses;
DROP POLICY IF EXISTS "addresses_update_policy" ON addresses;
DROP POLICY IF EXISTS "addresses_delete_policy" ON addresses;

-- Create new policies that include email field
CREATE POLICY "addresses_select_policy" ON addresses
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IS NULL OR
    auth.role() = 'service_role'
  );

CREATE POLICY "addresses_insert_policy" ON addresses
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    user_id IS NULL OR
    auth.role() = 'service_role'
  );

CREATE POLICY "addresses_update_policy" ON addresses
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    user_id IS NULL OR
    auth.role() = 'service_role'
  );

CREATE POLICY "addresses_delete_policy" ON addresses
  FOR DELETE USING (
    user_id = auth.uid() OR 
    user_id IS NULL OR
    auth.role() = 'service_role'
  );




