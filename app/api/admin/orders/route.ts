import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';
import { sendOrderStatusUpdateEmail } from '@/lib/email-service';

// Async function to send status update email without blocking the main request
async function sendStatusUpdateEmailAsync(currentOrder: any, status: string, previousStatus: string, userProfile: any) {
  try {
    console.log('📧 Preparing to send status update email...');
    console.log('Order:', currentOrder.order_number);
    console.log('Status change:', previousStatus, '->', status);
    
    // Get customer email from shipping address or user profile
    const customerEmail = currentOrder.shipping_address.email || 
                         (userProfile && userProfile.email) || 
                         null;
    console.log('Customer email:', customerEmail);

    if (!customerEmail || !customerEmail.includes('@')) {
      console.log('❌ No valid email address found. Email:', customerEmail);
      return;
    }

    const emailData = {
      orderNumber: currentOrder.order_number,
      customerName: `${currentOrder.shipping_address.first_name} ${currentOrder.shipping_address.last_name}`,
      customerEmail: customerEmail,
      newStatus: status,
      previousStatus: previousStatus,
      orderDate: new Date(currentOrder.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: (currentOrder.order_items || []).map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: currentOrder.total_amount,
      trackingNumber: status === 'shipped' ? `TRK-${currentOrder.order_number}` : undefined,
      estimatedDelivery: status === 'shipped' ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') : undefined
    };

    console.log('✅ Sending status update email to:', customerEmail);
    await sendOrderStatusUpdateEmail(emailData);
    console.log('✅ Status update email sent successfully!');
  } catch (emailError: any) {
    console.error('❌ Failed to send status update email:', emailError);
    console.error('Email error details:', emailError.message);
  }
}

export async function GET() {
  try {
    // First get all orders
    const { data: ordersData, error: ordersError } = await adminSupabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
    }

    // Then enrich each order with related data
    const enrichedOrders = await Promise.all(
      (ordersData || []).map(async (order) => {
        // Get shipping address
        let shipping_address = null;
        if (order.shipping_address_id) {
          const { data: addressData } = await adminSupabase
            .from('addresses')
            .select('*')
            .eq('id', order.shipping_address_id)
            .single();
          shipping_address = addressData;
        }

        // Get order items
        const { data: orderItems } = await adminSupabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        // Get user info if user_id exists
        let user = null;
        if (order.user_id) {
          const { data: userData } = await adminSupabase
            .from('profiles')
            .select('*')
            .eq('id', order.user_id)
            .single();
          user = userData;
        }

        return {
          ...order,
          shipping_address,
          order_items: orderItems || [],
          user
        };
      })
    );

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('📝 PATCH request received for orders');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { orderId, status } = body;

    if (!orderId || !status) {
      console.error('❌ Missing required fields:', { orderId, status });
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    // Get the current order data before updating
    const { data: currentOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select(`
        *,
        shipping_address:addresses!shipping_address_id(*),
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching order:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch order: ' + fetchError.message }, { status: 500 });
    }
    
    if (!currentOrder) {
      console.error('❌ Order not found for ID:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = currentOrder.status;

    // Get user profile if user_id exists
    let userProfile = null;
    if (currentOrder.user_id) {
      const { data: userData } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', currentOrder.user_id)
        .single();
      userProfile = userData;
    }

    // For cash on delivery orders, payment status should never be 'paid'
    // Since we don't have online payment system, all orders are cash on delivery
    let paymentStatus = 'pending';
    if (status === 'cancelled') {
      paymentStatus = 'failed';
    }
    // Never set to 'paid' for cash on delivery orders

    console.log('🔄 Updating order status:', { orderId, status, paymentStatus });
    
    const { error } = await adminSupabase
      .from('orders')
      .update({ 
        status,
        payment_status: paymentStatus
      })
      .eq('id', orderId);

    if (error) {
      console.error('❌ Error updating order status:', error);
      return NextResponse.json({ error: 'Failed to update order status: ' + error.message }, { status: 500 });
    }
    
    console.log('✅ Order status updated successfully');

    // Send status update email asynchronously (don't wait for it)
    if (previousStatus !== status && currentOrder.shipping_address) {
      // Don't await this - let it run in the background
      sendStatusUpdateEmailAsync(currentOrder, status, previousStatus, userProfile).catch(error => {
        console.error('❌ Background email sending failed:', error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in PATCH handler:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
