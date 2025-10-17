const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xvbhcvwjwsjgzjpfpogy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Ymhjdndqd3NqZ3pqcGZwb2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDEzOTksImV4cCI6MjA3NTUxNzM5OX0.OzrUu0NtIL0lrnjQM3J4cOyFWl2mK1yByWtGUcnBYys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Read the SQL schema
    const schemaPath = path.join(__dirname, '../lib/database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Note: In a real application, you would need to run this SQL through
    // the Supabase dashboard or use a migration tool
    console.log('Please run the following SQL in your Supabase dashboard:');
    console.log('=====================================');
    console.log(schema);
    console.log('=====================================');
    
    console.log('Database schema ready to be applied!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function migrateData() {
  console.log('Migrating product data...');
  
  try {
    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing products:', checkError);
      return;
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('Products already exist in database. Skipping migration.');
      return;
    }
    
    // Import the migration data
    const { migrateProducts } = require('../lib/migrate-data.js');
    await migrateProducts();
    
    console.log('Product data migration completed successfully!');
  } catch (error) {
    console.error('Error migrating data:', error);
  }
}

async function main() {
  console.log('Starting database setup and migration...');
  
  await setupDatabase();
  
  // Wait for user to apply schema
  console.log('\nAfter applying the schema in Supabase dashboard, run:');
  console.log('npm run migrate-data');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupDatabase, migrateData };
