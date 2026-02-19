import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';
import { sendOrderStatusUpdateEmail } from '@/lib/email-service';

// Async function to send status update email without blocking the main request
async function sendStatusUpdateEmailAsync(currentOrder: any, status: string, previousStatus: string, userProfile: any) {
  try {
    console.log('📧 Preparing to send status update email...');
    console.log('Order:', currentOrder.order_number);
    console.log('Status change:', previousStatus, '->', status);
    
    // Get customer email: prefer shipping address, then registered user profile
    const customerEmail = (currentOrder.shipping_address && currentOrder.shipping_address.email) ||
                         (userProfile && userProfile.email) ||
                         null;
    console.log('Customer email:', customerEmail);

    if (!customerEmail || !customerEmail.includes('@')) {
      console.log('❌ No valid email address found. Email:', customerEmail);
      return;
    }

    // Customer name: from shipping address or from registered user profile
    const customerName = (currentOrder.shipping_address && currentOrder.shipping_address.first_name != null)
      ? `${currentOrder.shipping_address.first_name || ''} ${currentOrder.shipping_address.last_name || ''}`.trim()
      : (userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : 'Customer');

    const emailData = {
      orderNumber: currentOrder.order_number,
      customerName: customerName || 'Customer',
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    // Single order fetch (for modal) - always returns full order_items
    if (orderId) {
      const { data: order, error: orderError } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const [addressRes, itemsRes, profileRes] = await Promise.all([
        order.shipping_address_id
          ? adminSupabase.from('addresses').select('*').eq('id', order.shipping_address_id).single()
          : { data: null },
        adminSupabase.from('order_items').select('*').eq('order_id', order.id),
        order.user_id
          ? adminSupabase.from('profiles').select('*').eq('id', order.user_id).single()
          : { data: null }
      ]);

      const enriched = {
        ...order,
        shipping_address: addressRes.data ?? null,
        order_items: itemsRes.data ?? [],
        user: profileRes.data ?? null
      };
      return NextResponse.json({ order: enriched });
    }

    // List all orders
    const { data: ordersData, error: ordersError } = await adminSupabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
    }

    const orders = ordersData || [];
    if (orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const addressIds = Array.from(new Set(orders.map((o: any) => o.shipping_address_id).filter(Boolean)));
    const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));
    const orderIds = orders.map((o: any) => o.id);

    // Fetch order_items in chunks to avoid URL/query limits (e.g. 100 order IDs per request)
    const chunkSize = 100;
    const orderItemsByOrder: Record<string, any[]> = {};
    for (let i = 0; i < orderIds.length; i += chunkSize) {
      const chunk = orderIds.slice(i, i + chunkSize);
      const { data: items } = await adminSupabase.from('order_items').select('*').in('order_id', chunk);
      (items || []).forEach((item: any) => {
        (orderItemsByOrder[item.order_id] ??= []).push(item);
      });
    }

    const [addressesRes, profilesRes] = await Promise.all([
      addressIds.length > 0 ? adminSupabase.from('addresses').select('*').in('id', addressIds) : { data: [] },
      userIds.length > 0 ? adminSupabase.from('profiles').select('*').in('id', userIds) : { data: [] }
    ]);

    const addressesMap = new Map((addressesRes.data || []).map((a: any) => [a.id, a]));
    const profilesMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));

    const enrichedOrders = orders.map((order: any) => ({
      ...order,
      shipping_address: order.shipping_address_id ? addressesMap.get(order.shipping_address_id) ?? null : null,
      order_items: orderItemsByOrder[order.id] ?? [],
      user: order.user_id ? profilesMap.get(order.user_id) ?? null : null
    }));

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

    // Send status update email when we have a way to reach the customer (registered or guest with address email)
    const canSendEmail = (currentOrder.shipping_address && currentOrder.shipping_address.email) ||
                        (userProfile && userProfile.email);
    if (previousStatus !== status && canSendEmail) {
      sendStatusUpdateEmailAsync(currentOrder, status, previousStatus, userProfile).catch(error => {
        console.error('❌ Background email sending failed:', error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in PATCH handler:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
