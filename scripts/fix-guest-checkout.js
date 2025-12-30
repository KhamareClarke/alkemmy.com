// Script to fix guest checkout RLS policies
const fs = require('fs');
const path = require('path');

async function fixGuestCheckout() {
  try {
    console.log('🔧 Fixing guest checkout RLS policies...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'lib', 'fix-guest-checkout-rls.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL content to execute:');
    console.log(sqlContent);
    
    console.log('\n✅ Please run this SQL in your Supabase SQL editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL content above');
    console.log('4. Click "Run" to execute');
    
    console.log('\n🎯 This will:');
    console.log('- Allow NULL user_id for guest orders');
    console.log('- Update RLS policies to support guest checkout');
    console.log('- Enable both logged-in and guest users to place orders');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
fixGuestCheckout();




