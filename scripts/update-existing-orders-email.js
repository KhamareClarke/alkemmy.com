// Script to update existing orders with customer email from profiles
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExistingOrdersEmail() {
  try {
    console.log('🔧 Updating existing orders with customer email...');
    
    // Get all orders with null email in shipping address but have user_id
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        shipping_address_id,
        addresses!shipping_address_id(email),
        profiles!user_id(email)
      `)
      .not('user_id', 'is', null)
      .is('addresses.email', null);
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }
    
    console.log(`Found ${orders.length} orders to update`);
    
    for (const order of orders) {
      if (order.profiles && order.profiles.email) {
        // Update the shipping address with the user's email
        const { error: updateError } = await supabase
          .from('addresses')
          .update({ email: order.profiles.email })
          .eq('id', order.shipping_address_id);
        
        if (updateError) {
          console.error(`❌ Error updating order ${order.order_number}:`, updateError);
        } else {
          console.log(`✅ Updated order ${order.order_number} with email: ${order.profiles.email}`);
        }
      }
    }
    
    console.log('🎉 Finished updating existing orders!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateExistingOrdersEmail();
