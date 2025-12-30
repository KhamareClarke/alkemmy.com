// Script to add email field to addresses table
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

async function addEmailToAddresses() {
  try {
    console.log('🔧 Adding email field to addresses table...');
    
    // Add email column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE addresses ADD COLUMN IF NOT EXISTS email TEXT;'
    });
    
    if (alterError) {
      console.error('❌ Error adding email column:', alterError);
      return;
    }
    
    console.log('✅ Email column added successfully!');
    console.log('📧 Now you can update order statuses and customers will receive email notifications!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addEmailToAddresses();




