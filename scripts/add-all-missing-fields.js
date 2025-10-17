const fs = require('fs');
const path = require('path');

async function addAllMissingFields() {
  try {
    // Read all the SQL files
    const teaFieldsPath = path.join(__dirname, '..', 'lib', 'add-tea-fields.sql');
    const beardCareFieldsPath = path.join(__dirname, '..', 'lib', 'add-beard-care-fields.sql');
    const rollOnsFieldsPath = path.join(__dirname, '..', 'lib', 'add-roll-ons-fields.sql');
    const elixirsFieldsPath = path.join(__dirname, '..', 'lib', 'add-elixirs-fields.sql');
    
    const teaFieldsSql = fs.readFileSync(teaFieldsPath, 'utf8');
    const beardCareFieldsSql = fs.readFileSync(beardCareFieldsPath, 'utf8');
    const rollOnsFieldsSql = fs.readFileSync(rollOnsFieldsPath, 'utf8');
    const elixirsFieldsSql = fs.readFileSync(elixirsFieldsPath, 'utf8');
    
    console.log('SQL scripts to fix ALL admin panel filter issues:');
    console.log('==================================================');
    console.log('\n1. HERBAL TEAS FIELDS:');
    console.log('----------------------');
    console.log(teaFieldsSql);
    console.log('\n2. BEARD CARE FIELDS:');
    console.log('---------------------');
    console.log(beardCareFieldsSql);
    console.log('\n3. ROLL-ONS FIELDS:');
    console.log('-------------------');
    console.log(rollOnsFieldsSql);
    console.log('\n4. ELIXIRS FIELDS:');
    console.log('------------------');
    console.log(elixirsFieldsSql);
    console.log('==================================================');
    console.log('\nPlease run these SQL scripts in your Supabase SQL Editor to fix all filter issues.');
    console.log('\nAfter running all scripts, the admin panel will work correctly for ALL categories!');
    
  } catch (error) {
    console.error('Error reading SQL files:', error);
  }
}

addAllMissingFields();








