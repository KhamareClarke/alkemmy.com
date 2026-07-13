import { NextRequest, NextResponse } from 'next/server';
import { createOrder, updateOrderPaymentStatus } from '@/lib/order-api';
import type { OrderDiscountMeta } from '@/lib/order-types';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email-service';
import { sendSmsSafe } from '@/lib/sms/send';
import { buildSmsBody } from '@/lib/sms/templates';
import { CartItem } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import { resolveCheckoutDiscount } from '@/lib/discounts/resolve-checkout-discount';
import { incrementDiscountCodeUsage } from '@/lib/discounts/increment-discount-usage';
import { adminSupabase } from '@/lib/admin-supabase';
import { emitEmpireActivity } from '@/lib/empire-activity';
import { emitFleetIngest } from '@/lib/fleet-ingest';

export async function POST(request: NextRequest) {
  try {
    const { orderData, cartItems, userId, paymentIntentId, discount: discountPayload } =
      await request.json();

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

    let pricedCart = cartItems as CartItem[];
    let discountMeta: OrderDiscountMeta | null = null;
    try {
      const resolved = await resolveCheckoutDiscount(
        discountPayload?.id && discountPayload?.code
          ? { id: String(discountPayload.id), code: String(discountPayload.code) }
          : null,
        cartItems as CartItem[]
      );
      pricedCart = resolved.pricedCart as CartItem[];
      discountMeta = resolved.discountMeta;
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Invalid discount' }, { status: 400 });
    }

    const { order, orderItems } = await createOrder(
      orderData,
      pricedCart,
      userId,
      paymentIntentId,
      discountMeta
    );

    if (discountMeta?.discountCodeId) {
      await incrementDiscountCodeUsage(adminSupabase, discountMeta.discountCodeId);
    }

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

      const phoneRaw = orderData.shippingAddress?.phone;
      if (phoneRaw && String(phoneRaw).trim()) {
        sendSmsSafe({
          to: String(phoneRaw).trim(),
          type: 'order_confirmation',
          body: buildSmsBody('order_confirmation', { orderNumber: order.order_number }),
        });
      }
    }

    const customerEmail = orderData?.shippingAddress?.email || null;
    const customerName = orderData?.shippingAddress
      ? `${orderData.shippingAddress.firstName || ''} ${orderData.shippingAddress.lastName || ''}`.trim()
      : null;

    void emitEmpireActivity({
      event_type: paymentIntentId ? 'payment_succeeded' : 'lead_created',
      user_email: customerEmail,
      user_id: userId || null,
      user_name: customerName,
      message: paymentIntentId
        ? `Order ${order.order_number} paid (\u00a3${Number(order.total_amount || 0).toFixed(2)})`
        : `Order ${order.order_number} placed (\u00a3${Number(order.total_amount || 0).toFixed(2)})`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        payment_intent_id: paymentIntentId || null,
        item_count: orderItems?.length || 0,
        discount_code: discountMeta?.discountCode || null,
      },
      request,
    });

    void emitFleetIngest({
      event_type: 'order',
      summary: paymentIntentId
        ? `Order paid: ${order.order_number} — ${customerName || customerEmail || 'guest'} (£${Number(order.total_amount || 0).toFixed(2)})`
        : `Order placed: ${order.order_number} — ${customerName || customerEmail || 'guest'} (£${Number(order.total_amount || 0).toFixed(2)})`,
      payload: {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        customer_email: customerEmail,
        payment_intent_id: paymentIntentId || null,
        item_count: orderItems?.length || 0,
      },
    });

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
