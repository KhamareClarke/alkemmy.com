import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email-service';
import { sendSmsSafe } from '@/lib/sms/send';
import { buildSmsBody } from '@/lib/sms/templates';
import { adminSupabase } from '@/lib/admin-supabase';
import { incrementDiscountCodeUsage } from '@/lib/discounts/increment-discount-usage';
import type { OrderDiscountMeta } from '@/lib/order-types';
import { emitEmpireActivity } from '@/lib/empire-activity';

// Ensure this route is always dynamic (no static optimization) so Stripe can reach it
export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/** GET: allow Stripe or you to verify the endpoint URL exists (returns 200). */
export async function GET() {
  return NextResponse.json(
    { ok: true, endpoint: 'stripe-webhook', message: 'Use POST with Stripe webhook events.' },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe or webhook secret not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Helper function to find order by payment intent ID
async function findOrderByPaymentIntentId(paymentIntentId: string) {
  // First, try to find by payment_intent_id column (if it exists)
  let { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_method', 'stripe')
    .eq('payment_status', 'pending')
    .eq('payment_intent_id', paymentIntentId)
    .limit(1);

  // If no results from column lookup, try searching in notes field
  if (!orders || orders.length === 0 || error) {
    const { data: ordersByNotes, error: notesError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_method', 'stripe')
      .eq('payment_status', 'pending')
      .ilike('notes', `%${paymentIntentId}%`)
      .limit(1);
    
    if (!notesError && ordersByNotes && ordersByNotes.length > 0) {
      orders = ordersByNotes;
      error = null;
    } else if (notesError) {
      error = notesError;
    }
  }

  return { orders, error };
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment Intent succeeded:', paymentIntent.id);

  // Find order by payment_intent_id
  const { orders, error: findError } = await findOrderByPaymentIntentId(paymentIntent.id);

  if (findError) {
    console.error('Error finding order:', findError);
    throw findError;
  }

  if (!orders || orders.length === 0) {
    console.log(`No order found for payment intent ${paymentIntent.id}`);
    return;
  }

  const order = orders[0];

  // Update order payment status
  const updateData: any = {
    payment_status: 'paid',
    status: 'processing',
    updated_at: new Date().toISOString(),
  };

  // Try to add payment_intent_id if column exists
  try {
    updateData.payment_intent_id = paymentIntent.id;
  } catch (e) {
    // Column might not exist yet, that's okay
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', order.id);

  if (updateError) {
    console.error('Error updating order:', updateError);
    throw updateError;
  }

  console.log(`Order ${order.order_number} marked as paid`);

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const { data: shippingAddress } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', order.shipping_address_id)
    .single();

  void emitEmpireActivity({
    event_type: 'payment_succeeded',
    user_email: shippingAddress?.email || null,
    user_id: order.user_id || null,
    user_name: shippingAddress ? `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim() : null,
    message: `Order ${order.order_number} paid (\u00a3${Number(order.total_amount || 0).toFixed(2)})`,
    metadata: {
      order_id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_intent_id: paymentIntent.id,
      amount_received: paymentIntent.amount_received,
      currency: paymentIntent.currency,
    },
  });

  // Send confirmation emails
  if (shippingAddress && orderItems) {
    const emailData = {
      orderNumber: order.order_number,
      customerName: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
      customerEmail: shippingAddress.email,
      totalAmount: order.total_amount,
      items: orderItems.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        address: shippingAddress.address_line_1 + (shippingAddress.address_line_2 ? `, ${shippingAddress.address_line_2}` : ''),
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postal_code,
        country: shippingAddress.country
      },
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
      orderDate: new Date(order.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    try {
      await sendOrderConfirmationEmail(emailData);
      await sendAdminNotificationEmail(emailData);
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Don't throw - email failure shouldn't fail the webhook
    }

    const phone = shippingAddress.phone;
    if (phone && String(phone).trim()) {
      sendSmsSafe({
        to: String(phone).trim(),
        type: 'order_confirmation',
        body: buildSmsBody('order_confirmation', { orderNumber: order.order_number }),
      });
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment Intent failed:', paymentIntent.id);

  // Find order by payment_intent_id
  const { orders, error: findError } = await findOrderByPaymentIntentId(paymentIntent.id);

  if (findError) {
    console.error('Error finding order:', findError);
    throw findError;
  }

  if (!orders || orders.length === 0) {
    console.log(`No order found for payment intent ${paymentIntent.id}`);
    return;
  }

  const order = orders[0];

  // Update order payment status
  const updateData: any = {
    payment_status: 'failed',
    status: 'pending',
    updated_at: new Date().toISOString(),
  };

  // Try to add payment_intent_id if column exists
  try {
    updateData.payment_intent_id = paymentIntent.id;
  } catch (e) {
    // Column might not exist yet, that's okay
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', order.id);

  if (updateError) {
    console.error('Error updating order:', updateError);
    throw updateError;
  }

  console.log(`Order ${order.order_number} marked as payment failed`);

  void emitEmpireActivity({
    event_type: 'payment_failed',
    user_id: order.user_id || null,
    message: `Order ${order.order_number} payment failed`,
    metadata: {
      order_id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_intent_id: paymentIntent.id,
      stripe_error: paymentIntent.last_payment_error?.message || null,
    },
  });

  if (order.shipping_address_id) {
    const { data: addr } = await supabase
      .from('addresses')
      .select('phone')
      .eq('id', order.shipping_address_id)
      .single();
    const phone = addr?.phone;
    if (phone && String(phone).trim()) {
      sendSmsSafe({
        to: String(phone).trim(),
        type: 'payment_failed',
        body: buildSmsBody('payment_failed', {
          orderNumber: order.order_number,
          amount: order.total_amount != null ? `£${Number(order.total_amount).toFixed(2)}` : undefined,
        }),
      });
    }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  try {
    // Get metadata from session
    const metadata = session.metadata;
    const tempOrderId = metadata?.to || metadata?.tempOrderId; // Support both old and new format
    if (!tempOrderId) {
      console.error('No tempOrderId found in checkout session metadata');
      return;
    }

    // Retrieve temporary order
    const { data: tempOrder, error: tempOrderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', tempOrderId)
      .single();

    if (tempOrderError || !tempOrder) {
      console.error('Error retrieving temporary order:', tempOrderError);
      return;
    }

    // Try to get order data from checkout_sessions table first
    let orderData: any;
    let cartItems: any[];
    
    const { data: checkoutSession } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('temp_order_id', tempOrderId)
      .single();

    let discountMeta: OrderDiscountMeta | null = null;
    if (checkoutSession) {
      orderData = checkoutSession.order_data;
      cartItems = checkoutSession.cart_items;
      if (checkoutSession.discount) {
        discountMeta = checkoutSession.discount as any;
      }
    } else {
      // Fall back to parsing from notes (compact format)
      const orderNotes = JSON.parse(tempOrder.notes || '{}');
      
      // Reconstruct order data from compact format
      // Support both old format (email) and new ultra-compact format (e)
      const hasEmail = orderNotes.email || orderNotes.e;

      if (hasEmail) {
        if (orderNotes.d) {
          discountMeta = orderNotes.d as any;
        }
        // Compact format - reconstruct full order data
        const { data: tempAddress } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', tempOrder.shipping_address_id)
          .single();

        if (tempAddress) {
          orderData = {
            shippingAddress: {
              firstName: tempAddress.first_name,
              lastName: tempAddress.last_name,
              email: tempAddress.email,
              phone: tempAddress.phone,
              addressLine1: tempAddress.address_line_1,
              addressLine2: tempAddress.address_line_2,
              city: tempAddress.city,
              state: tempAddress.state,
              postalCode: tempAddress.postal_code,
              country: tempAddress.country,
            },
            billingSameAsShipping: true,
            paymentMethod: 'stripe',
            saveAddress: false,
          };
          
          // Reconstruct cart items from compact format
          // Support both old format (items) and new ultra-compact format (i)
          const items = orderNotes.items || orderNotes.i || [];
          
          // Fetch full product data from database to reconstruct cart items
          const productIds = items.map((item: any) => item.id);
          if (productIds.length > 0) {
            const { data: products, error: productsError } = await supabase
              .from('products')
              .select('id, name, image, price')
              .in('id', productIds);
            
            if (!productsError && products) {
              // Map products to cart items with quantities and prices from compact data
              cartItems = items.map((item: any) => {
                const product = products.find((p: any) => p.id === item.id);
                if (product) {
                  return {
                    id: product.id,
                    name: product.name,
                    image: product.image || '',
                    quantity: item.qty || item.q || 1,
                    price: item.price || item.p || product.price || 0,
                    slug: '', // Not needed for order creation
                  };
                }
                // Fallback if product not found
                return {
                  id: item.id,
                  name: 'Product',
                  image: '',
                  quantity: item.qty || item.q || 1,
                  price: item.price || item.p || 0,
                  slug: '',
                };
              });
            } else {
              console.error('Error fetching products for cart reconstruction:', productsError);
              // Fallback to minimal cart items
              cartItems = items.map((item: any) => ({
                id: item.id,
                name: 'Product',
                image: '',
                quantity: item.qty || item.q || 1,
                price: item.price || item.p || 0,
                slug: '',
              }));
            }
          } else {
            cartItems = [];
          }
        } else {
          console.error('Could not retrieve temporary address');
          return;
        }
      } else {
        // Old format - try to parse
        orderData = orderNotes.orderData;
        cartItems = orderNotes.cartItems;
      }
    }

    const userId = (metadata?.uid || metadata?.userId) === 'guest' ? undefined : (metadata?.uid || metadata?.userId);

    // Import createOrder function
    const { createOrder } = await import('@/lib/order-api');

    // Create the actual order (this will create addresses and order items)
    const { order, orderItems } = await createOrder(orderData, cartItems, userId, undefined, discountMeta);

    if (discountMeta?.discountCodeId) {
      await incrementDiscountCodeUsage(adminSupabase, discountMeta.discountCodeId);
    }

    // Get payment intent ID if available
    let paymentIntentId: string | undefined;
    if (session.payment_intent && typeof session.payment_intent === 'string') {
      paymentIntentId = session.payment_intent;
    } else if (session.payment_intent) {
      paymentIntentId = (session.payment_intent as Stripe.PaymentIntent).id;
    }

    // Update order notes to include session_id and payment_intent_id for lookup
    const notesUpdate = [
      order.notes || '',
      `Stripe Checkout Session: ${session.id}`,
      paymentIntentId ? `Payment Intent: ${paymentIntentId}` : '',
    ].filter(Boolean).join('\n');

    // Update order payment status and notes
    if (paymentIntentId) {
      const { updateOrderPaymentStatus } = await import('@/lib/order-api');
      await updateOrderPaymentStatus(order.id, 'paid', paymentIntentId);
    }

    // Update notes with session ID
    await supabase
      .from('orders')
      .update({ notes: notesUpdate })
      .eq('id', order.id);

    // Clean up temporary data
    // Delete checkout session if it exists
    await supabase
      .from('checkout_sessions')
      .delete()
      .eq('temp_order_id', tempOrderId);

    // Delete temporary address
    if (tempOrder.shipping_address_id) {
      await supabase
        .from('addresses')
        .delete()
        .eq('id', tempOrder.shipping_address_id);
    }
    
    // Delete temporary order
    await supabase
      .from('orders')
      .delete()
      .eq('id', tempOrderId);

    // Get shipping address for email
    const { data: shippingAddress } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', order.shipping_address_id)
      .single();

    // Send confirmation emails
    if (shippingAddress && orderItems) {
      const emailData = {
        orderNumber: order.order_number,
        customerName: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        customerEmail: shippingAddress.email,
        totalAmount: order.total_amount,
        items: orderItems.map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          address: shippingAddress.address_line_1 + (shippingAddress.address_line_2 ? `, ${shippingAddress.address_line_2}` : ''),
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postal_code,
          country: shippingAddress.country
        },
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntentId,
        orderDate: new Date(order.created_at).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      try {
        await sendOrderConfirmationEmail(emailData);
        await sendAdminNotificationEmail(emailData);
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Don't throw - email failure shouldn't fail the webhook
      }

      const phone = shippingAddress.phone;
      if (phone && String(phone).trim()) {
        sendSmsSafe({
          to: String(phone).trim(),
          type: 'order_confirmation',
          body: buildSmsBody('order_confirmation', { orderNumber: order.order_number }),
        });
      }
    }

    void emitEmpireActivity({
      event_type: 'payment_succeeded',
      user_email: shippingAddress?.email || null,
      user_id: userId || null,
      user_name: shippingAddress ? `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim() : null,
      message: `Order ${order.order_number} paid via Stripe Checkout (\u00a3${Number(order.total_amount || 0).toFixed(2)})`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        currency: session.currency,
        checkout_session_id: session.id,
        payment_intent_id: paymentIntentId || null,
        discount_code: discountMeta?.discountCode || null,
      },
    });

    console.log(`Order ${order.order_number} created from checkout session ${session.id}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Next.js App Router automatically handles raw body when using request.text()
// No additional configuration needed
