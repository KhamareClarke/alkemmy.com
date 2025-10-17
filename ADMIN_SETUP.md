# Admin Panel Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Your existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NEW: Service Role Key for Admin Access (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Get Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Add it to your `.env.local` file as `SUPABASE_SERVICE_ROLE_KEY`

## How It Works

The admin panel now uses secure API routes (`/api/admin/users` and `/api/admin/orders`) that run on the server side with the service role key. This ensures:

- ✅ **Security**: Service role key never exposed to client
- ✅ **RLS Bypass**: Admin operations bypass Row Level Security
- ✅ **Full Access**: Can view all users and orders

## Alternative: SQL Policies Method

If you prefer to use SQL policies instead of the service role key, run this SQL in your Supabase SQL Editor:

```sql
-- Replace 'your-admin-email@example.com' with your actual admin email
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' IN (
    'your-admin-email@example.com'  -- Add your admin email here
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can view all addresses" ON addresses
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (is_admin());
```

## Admin Access

- **URL**: `/admin`
- **Password**: `alkemmy2024` (change this in the code if needed)

## What the Admin Panel Shows

1. **Users Tab**: All registered users with order statistics
2. **Orders Tab**: All orders (guest and registered) with status management
3. **Products Tab**: Original product management functionality

## Troubleshooting

If you still see "No users found" or "No orders found":

1. Make sure you have the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`
2. Restart your development server after adding the environment variable
3. Check the browser console for any error messages
4. Verify your Supabase project has data in the tables
