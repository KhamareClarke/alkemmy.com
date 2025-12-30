// Test script for checkout system
// This script tests the checkout flow without requiring a full frontend

const { createOrder, updateOrderPaymentStatus } = require('../lib/order-api');

async function testCheckoutFlow() {
  console.log('🧪 Testing Checkout System...\n');

  try {
    // Test data
    const testOrderData = {
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '07123456789',
        addressLine1: '123 Test Street',
        addressLine2: 'Apartment 4B',
        city: 'London',
        state: 'Greater London',
        postalCode: 'SW1A 1AA',
        country: 'United Kingdom',
      },
      billingSameAsShipping: true,
      paymentMethod: 'card',
      saveAddress: false,
    };

    const testCartItems = [
      {
        id: 'test-product-1',
        name: 'Test Soap Bar',
        image: '/images/test-soap.jpg',
        quantity: 2,
        price: 12.99,
        category: 'soaps',
        slug: 'test-soap-bar',
      },
      {
        id: 'test-product-2',
        name: 'Test Oil',
        image: '/images/test-oil.jpg',
        quantity: 1,
        price: 24.99,
        category: 'oils',
        slug: 'test-oil',
      },
    ];

    const testUserId = 'test-user-id';

    console.log('📦 Test Order Data:');
    console.log('- Customer:', `${testOrderData.shippingAddress.firstName} ${testOrderData.shippingAddress.lastName}`);
    console.log('- Email:', testOrderData.shippingAddress.email);
    console.log('- Items:', testCartItems.length);
    console.log('- Payment Method:', testOrderData.paymentMethod);
    console.log('');

    // Test order creation
    console.log('🛒 Creating test order...');
    const { order, orderItems } = await createOrder(testOrderData, testCartItems, testUserId);
    
    console.log('✅ Order created successfully!');
    console.log('- Order ID:', order.id);
    console.log('- Order Number:', order.order_number);
    console.log('- Total Amount: £' + order.total_amount.toFixed(2));
    console.log('- Order Items:', orderItems.length);
    console.log('');

    // Test payment status update
    console.log('💳 Updating payment status...');
    await updateOrderPaymentStatus(order.id, 'paid');
    console.log('✅ Payment status updated to "paid"');
    console.log('');

    console.log('🎉 Checkout system test completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Set up your environment variables (.env.local)');
    console.log('2. Configure Stripe keys for payment processing');
    console.log('3. Test the full checkout flow in the browser');
    console.log('4. Set up email service for order confirmations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCheckoutFlow();
}

module.exports = { testCheckoutFlow };




