// Check if environment variables are set correctly
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = !!value;
  const displayValue = isSet ? `${value.substring(0, 20)}...` : 'NOT SET';
  
  console.log(`${isSet ? '✅' : '❌'} ${varName}: ${displayValue}`);
  
  if (!isSet) {
    allSet = false;
  }
});

console.log('\n' + (allSet ? '🎉 All environment variables are set!' : '⚠️  Some environment variables are missing!'));

if (!allSet) {
  console.log('\n📝 Add the missing variables to your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
}




