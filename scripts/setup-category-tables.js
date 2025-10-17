const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing Supabase URL environment variable.');
  console.log('Please create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://xvbhcvwjwsjgzjpfpogy.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCategoryTables() {
  console.log('🚀 Setting up category-specific tables...');
  
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../lib/category-tables-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement);
          throw error;
        }
      }
    }
    
    console.log('✅ Category tables created successfully!');
    console.log('\nCreated tables:');
    console.log('- soaps');
    console.log('- herbal_teas');
    console.log('- lotions');
    console.log('- oils');
    console.log('- beard_care');
    console.log('- shampoos');
    console.log('- roll_ons');
    console.log('- elixirs');
    
    console.log('\n🎉 Setup completed! You can now run the migration script.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    if (error.message.includes('function exec_sql')) {
      console.log('\n💡 Note: The exec_sql function might not be available.');
      console.log('Please run the SQL schema manually in your Supabase SQL Editor:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of lib/category-tables-schema.sql');
      console.log('4. Execute the SQL');
    }
    
    process.exit(1);
  }
}

// Run setup
setupCategoryTables();
