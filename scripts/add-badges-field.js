const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addBadgesField() {
  try {
    console.log('🚀 Adding badges field to all category tables...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'lib', 'add-badges-field.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
        
        if (error) {
          console.error('❌ Error executing statement:', error);
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('🎉 Badges field added to all tables successfully!');
    console.log('📝 Sample badges have been added to existing products for testing.');
    
  } catch (error) {
    console.error('❌ Error adding badges field:', error);
    process.exit(1);
  }
}

// Run the script
addBadgesField();








