-- Fix RLS policies to allow guest checkout
-- This allows orders and addresses to be created without a user_id for guest checkout

-- Update addresses table to allow NULL user_id for guest orders
ALTER TABLE addresses ALTER COLUMN user_id DROP NOT NULL;

-- Update orders table to allow NULL user_id for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can view own addresses or guest addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders or guest orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view order items for own orders or guest orders" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items for own orders or guest orders" ON order_items;

-- Create new policies that allow both authenticated and guest users
-- Addresses policies
CREATE POLICY "addresses_select_policy" ON addresses    
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "addresses_insert_policy" ON addresses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "addresses_update_policy" ON addresses
  FOR UPDATE USING (
    auth.uid() = user_id
  );

CREATE POLICY "addresses_delete_policy" ON addresses
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Orders policies
CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

-- Order items policies
CREATE POLICY "order_items_select_policy" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "order_items_insert_policy" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );




