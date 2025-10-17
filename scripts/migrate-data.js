const { migrateData } = require('./setup-database');

async function main() {
  console.log('Starting data migration...');
  await migrateData();
  console.log('Migration completed!');
}

if (require.main === module) {
  main().catch(console.error);
}








