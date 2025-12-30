// Test script to check if reviews system is working
const testReviewsAPI = async () => {
  console.log('🧪 Testing Reviews API...');
  
  try {
    // Test 1: Check if we can fetch reviews (should work even with empty table)
    console.log('\n1. Testing GET /api/reviews...');
    const response = await fetch('http://localhost:3000/api/reviews?productId=test-product');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET /api/reviews works!');
      console.log('   Reviews:', data.reviews?.length || 0);
      console.log('   Average Rating:', data.averageRating);
      console.log('   Total Reviews:', data.totalReviews);
    } else {
      console.log('❌ GET /api/reviews failed:', response.status, response.statusText);
      const error = await response.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  try {
    // Test 2: Check if we can fetch average ratings
    console.log('\n2. Testing GET /api/reviews/average...');
    const response = await fetch('http://localhost:3000/api/reviews/average?productIds=test1,test2');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET /api/reviews/average works!');
      console.log('   Averages:', data.averages);
    } else {
      console.log('❌ GET /api/reviews/average failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  console.log('\n🔍 If tests fail, the issue is likely:');
  console.log('   - Reviews table not created in Supabase');
  console.log('   - RLS policies not set up correctly');
  console.log('   - Server not running on port 3000');
};

// Run the test
testReviewsAPI();




