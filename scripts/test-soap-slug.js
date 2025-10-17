// Test script to check soap slug functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSoapSlug() {
  console.log('🧪 Testing Soap Slug Functionality...');
  
  try {
    // Test 1: Check if soaps table exists and has data
    console.log('\n1. Checking soaps table...');
    const { data: soaps, error: soapsError } = await supabase
      .from('soaps')
      .select('id, title, slug')
      .limit(5);

    if (soapsError) {
      console.log('❌ Error accessing soaps table:', soapsError.message);
      return;
    }

    console.log('✅ Soaps table accessible');
    console.log('   Found', soaps?.length || 0, 'soaps');
    
    if (soaps && soaps.length > 0) {
      console.log('   Sample soaps:');
      soaps.forEach(soap => {
        console.log(`   - ${soap.title} (slug: ${soap.slug})`);
      });

      // Test 2: Try to get a specific soap by slug
      const firstSoap = soaps[0];
      console.log(`\n2. Testing getSoapBySlug with "${firstSoap.slug}"...`);
      
      const { data: soapBySlug, error: slugError } = await supabase
        .from('soaps')
        .select('*')
        .eq('slug', firstSoap.slug)
        .single();

      if (slugError) {
        console.log('❌ Error fetching soap by slug:', slugError.message);
      } else {
        console.log('✅ Successfully fetched soap by slug');
        console.log('   Title:', soapBySlug.title);
        console.log('   Price: £' + soapBySlug.price);
      }
    } else {
      console.log('⚠️  No soaps found in database');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSoapSlug();




