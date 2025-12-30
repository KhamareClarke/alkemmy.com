-- Admin access policies for Supabase
-- This allows admin users to view all data regardless of RLS

-- First, let's create a function to check if a user is an admin
-- You'll need to replace 'your-admin-email@example.com' with your actual admin email
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user's email is in the admin list
  -- Add your admin emails here
  RETURN auth.jwt() ->> 'email' IN (
    'admin@alkemmy.com',  -- Replace with your admin email
    'your-admin-email@example.com'  -- Add more admin emails as needed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies for profiles table
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- Create admin policies for addresses table
CREATE POLICY "Admins can view all addresses" ON addresses
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all addresses" ON addresses
  FOR UPDATE USING (is_admin());

-- Create admin policies for orders table
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (is_admin());

-- Create admin policies for order_items table
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all order items" ON order_items
  FOR UPDATE USING (is_admin());

-- Alternative: If you want to bypass RLS completely for admin operations
-- (Use this only if the above doesn't work)

-- Grant service role permissions (this bypasses RLS)
-- GRANT ALL ON profiles TO service_role;
-- GRANT ALL ON addresses TO service_role;
-- GRANT ALL ON orders TO service_role;
-- GRANT ALL ON order_items TO service_role;




