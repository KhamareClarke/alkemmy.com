const fs = require('fs');
const path = require('path');

async function addTeaFields() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'lib', 'add-tea-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('SQL script to add tea fields:');
    console.log('================================');
    console.log(sql);
    console.log('================================');
    console.log('\nPlease run this SQL script in your Supabase SQL Editor to add the new fields to the herbal_teas table.');
    console.log('\nAfter running the SQL script, the admin panel should work correctly for herbal tea products.');
    
  } catch (error) {
    console.error('Error reading SQL file:', error);
  }
}

addTeaFields();








