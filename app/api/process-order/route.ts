import { NextRequest, NextResponse } from 'next/server';
import { createOrder, updateOrderPaymentStatus } from '@/lib/order-api';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email-service';
import { CartItem } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderData, cartItems, userId, paymentIntentId } = await request.json();

    console.log('Processing order with data:', {
      orderData: orderData ? 'present' : 'missing',
      cartItems: cartItems ? cartItems.length : 'missing',
      userId: userId || 'guest',
      paymentIntentId: paymentIntentId || 'none'
    });

    if (!orderData || !cartItems || cartItems.length === 0) {
      console.log('Invalid order data:', { orderData, cartItems });
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Create the order
    const { order, orderItems } = await createOrder(orderData, cartItems, userId);

    // If payment was successful, update the order status
    if (paymentIntentId) {
      await updateOrderPaymentStatus(order.id, 'paid', paymentIntentId);
    }

    // Get shipping address for email
    const { data: shippingAddress } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', order.shipping_address_id)
      .single();

    // Send confirmation email to customer and notification to admin
    if (shippingAddress) {
      const emailData = {
        orderNumber: order.order_number,
        customerName: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
        customerEmail: orderData.shippingAddress.email,
        totalAmount: order.total_amount,
        items: orderItems.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
          address: orderData.shippingAddress.addressLine1 + (orderData.shippingAddress.addressLine2 ? `, ${orderData.shippingAddress.addressLine2}` : ''),
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postalCode: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country
        },
        paymentMethod: order.payment_method,
        orderDate: new Date(order.created_at).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Send customer confirmation email
      await sendOrderConfirmationEmail(emailData);
      
      // Send admin notification email
      await sendAdminNotificationEmail(emailData);
    }

    return NextResponse.json({
      success: true,
      order,
      orderItems,
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
