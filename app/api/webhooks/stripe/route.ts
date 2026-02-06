import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email-service';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

  // Get order details for email
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

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
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  try {
    // Get metadata from session
    const metadata = session.metadata;
    if (!metadata) {
      console.error('No metadata found in checkout session');
      return;
    }

    const userId = metadata.userId === 'guest' ? undefined : metadata.userId;
    const orderData = JSON.parse(metadata.orderData);
    const cartItems = JSON.parse(metadata.cartItems);

    // Import createOrder function
    const { createOrder } = await import('@/lib/order-api');

    // Create the order
    const { order, orderItems } = await createOrder(orderData, cartItems, userId);

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
    }

    console.log(`Order ${order.order_number} created from checkout session ${session.id}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Next.js App Router automatically handles raw body when using request.text()
// No additional configuration needed
