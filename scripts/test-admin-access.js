// Test script to check admin access to Supabase data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAdminAccess() {
  console.log('🔍 Testing admin access to Supabase...\n');

  try {
    // Test profiles table
    console.log('📊 Testing profiles table...');
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      if (profiles.length > 0) {
        console.log('   Sample profile:', profiles[0]);
      }
    }

    // Test orders table
    console.log('\n📦 Testing orders table...');
    const { data: orders, error: ordersError } = await adminSupabase
      .from('orders')
      .select('*')
      .limit(5);
    
    if (ordersError) {
      console.error('❌ Orders error:', ordersError.message);
    } else {
      console.log(`✅ Found ${orders.length} orders`);
      if (orders.length > 0) {
        console.log('   Sample order:', orders[0]);
      }
    }

    // Test addresses table
    console.log('\n🏠 Testing addresses table...');
    const { data: addresses, error: addressesError } = await adminSupabase
      .from('addresses')
      .select('*')
      .limit(5);
    
    if (addressesError) {
      console.error('❌ Addresses error:', addressesError.message);
    } else {
      console.log(`✅ Found ${addresses.length} addresses`);
      if (addresses.length > 0) {
        console.log('   Sample address:', addresses[0]);
      }
    }

    // Test order_items table
    console.log('\n🛒 Testing order_items table...');
    const { data: orderItems, error: orderItemsError } = await adminSupabase
      .from('order_items')
      .select('*')
      .limit(5);
    
    if (orderItemsError) {
      console.error('❌ Order items error:', orderItemsError.message);
    } else {
      console.log(`✅ Found ${orderItems.length} order items`);
      if (orderItems.length > 0) {
        console.log('   Sample order item:', orderItems[0]);
      }
    }

    console.log('\n🎉 Admin access test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAdminAccess();




