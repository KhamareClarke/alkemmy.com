import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { resolveCheckoutDiscount } from '@/lib/discounts/resolve-checkout-discount';
import type { OrderDiscountMeta } from '@/lib/order-api';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const {
      cartItems,
      orderData,
      userId,
      successUrl,
      cancelUrl,
      discount: discountPayload,
    } = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!orderData || !orderData.shippingAddress) {
      return NextResponse.json(
        { error: 'Order data is required' },
        { status: 400 }
      );
    }

    let pricedCart = cartItems as any[];
    let discountMeta: OrderDiscountMeta | null = null;
    try {
      const resolved = await resolveCheckoutDiscount(
        discountPayload?.id && discountPayload?.code
          ? { id: String(discountPayload.id), code: String(discountPayload.code) }
          : null,
        cartItems as any
      );
      pricedCart = resolved.pricedCart as any[];
      discountMeta = resolved.discountMeta;
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || 'Invalid discount' },
        { status: 400 }
      );
    }

    const subtotal = pricedCart.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
    const shipping = subtotal > 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    console.log('Creating checkout session with:', {
      cartItemsCount: pricedCart.length,
      subtotal,
      shipping,
      total,
      discount: discountMeta?.discountCode,
      firstItem: pricedCart[0]
        ? {
            name: pricedCart[0].name,
            price: pricedCart[0].price,
            image: pricedCart[0].image,
            quantity: pricedCart[0].quantity,
          }
        : null,
    });

    const lineItems = pricedCart.map((item: any) => {
      const productName = (item.name || 'Product').substring(0, 22);
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: productName,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Store order data temporarily in database to avoid metadata size limits
    // Stripe metadata has a 500 character limit per key
    // First create a temporary shipping address
    const { data: tempAddress, error: tempAddressError } = await supabase
      .from('addresses')
      .insert({
        user_id: userId || null,
        type: 'shipping',
        first_name: orderData.shippingAddress.firstName,
        last_name: orderData.shippingAddress.lastName,
        email: orderData.shippingAddress.email,
        address_line_1: orderData.shippingAddress.addressLine1,
        address_line_2: orderData.shippingAddress.addressLine2 || '',
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postal_code: orderData.shippingAddress.postalCode,
        country: orderData.shippingAddress.country,
        phone: orderData.shippingAddress.phone || '',
        is_default: false,
      })
      .select()
      .single();

    if (tempAddressError || !tempAddress) {
      console.error('Error creating temporary address:', tempAddressError);
      throw new Error('Failed to create temporary address');
    }

    const { data: tempOrder, error: tempOrderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        order_number: `TEMP-${Date.now()}`,
        status: 'pending',
        total_amount: total,
        shipping_address_id: tempAddress.id,
        payment_method: 'stripe',
        payment_status: 'pending',
        notes: 'Temporary order for Stripe Checkout',
      })
      .select()
      .single();

    if (tempOrderError || !tempOrder) {
      console.error('Error creating temporary order:', tempOrderError);
      throw new Error('Failed to create temporary order');
    }

    // Insert order_items for the temp order so admin/customer see items even before webhook runs
    const orderItemsData = pricedCart.map((item: any) => {
      const baseId = String(item.id).split('::')[0];
      const row: Record<string, unknown> = {
        order_id: tempOrder.id,
        product_id: baseId,
        product_name: item.name || 'Product',
        product_image: item.image || null,
        quantity: item.quantity || 1,
        price: parseFloat(item.price) || 0,
      };
      const vid = item.variantId as string | undefined;
      const vlabel = item.variantLabel as string | undefined;
      if (vid) row.variant_id = vid;
      if (vlabel) row.variant_label = vlabel;
      return row;
    });
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);
    if (itemsError) {
      console.warn('Could not insert temp order items:', itemsError);
    }

    // Store order data in separate checkout_sessions table to avoid URL length issues
    // This keeps the notes field small and prevents URL length errors
    try {
      const { data: checkoutSession, error: sessionError } = await supabase
        .from('checkout_sessions')
        .insert({
          temp_order_id: tempOrder.id,
          order_data: orderData as any,
          cart_items: pricedCart as any,
          subtotal,
          shipping,
          total,
          ...(discountMeta ? { discount: discountMeta as any } : {}),
        })
        .select()
        .single();

      if (sessionError) {
        console.warn('checkout_sessions table may not exist, using fallback:', sessionError);
        // Fall back to ultra-compact format in notes if table doesn't exist
        // Only store minimal data: product IDs and quantities
        const compactData = {
          e: orderData.shippingAddress.email, // 'e' for email
          n: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`, // 'n' for name
          i: pricedCart.map((item: any) => ({
            id: item.id,
            q: item.quantity, // 'q' for quantity
            p: item.price // 'p' for price
          })),
          t: { s: subtotal, sh: shipping, tot: total }, // 't' for totals
          d: discountMeta || undefined,
        };
        
        await supabase
          .from('orders')
          .update({ notes: JSON.stringify(compactData) })
          .eq('id', tempOrder.id);
      }
    } catch (err) {
      console.warn('Error storing checkout session data, using fallback:', err);
      // Use ultra-compact format as fallback
      const compactData = {
        e: orderData.shippingAddress.email, // 'e' for email
        n: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`, // 'n' for name
        i: pricedCart.map((item: any) => ({
          id: item.id,
          q: item.quantity, // 'q' for quantity
          p: item.price // 'p' for price
        })),
        t: { s: subtotal, sh: shipping, tot: total }, // 't' for totals
        d: discountMeta || undefined,
      };
      
      await supabase
        .from('orders')
        .update({ notes: JSON.stringify(compactData) })
        .eq('id', tempOrder.id);
    }

    // Use canonical site URL so Stripe success/cancel redirects always hit a working deployment.
    // Set NEXT_PUBLIC_SITE_URL=https://alkhemmy.com in Vercel production so redirects never use broken vercel.app URLs.
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000';
    const shortSuccessUrl = `${baseUrl}/thank-you?sid={CHECKOUT_SESSION_ID}`;
    const shortCancelUrl = `${baseUrl}/checkout?canceled=1`;

    // Create checkout session with minimal metadata
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: shortSuccessUrl,
      cancel_url: shortCancelUrl,
      customer_email: orderData.shippingAddress.email,
      metadata: {
        to: tempOrder.id, // Short key name
        uid: userId || 'guest', // Short key name
      },
      allow_promotion_codes: !discountMeta,
    };

    // Only add shipping address collection if we want Stripe to collect it
    // Since we're already collecting it in our form, we can skip this
    // Uncomment if you want Stripe to collect shipping address instead
    // sessionConfig.shipping_address_collection = {
    //   allowed_countries: ['GB', 'US', 'CA', 'AU', 'IE'],
    // };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Return more detailed error message
    const errorMessage = error?.message || error?.raw?.message || 'Failed to create checkout session';
    const errorCode = error?.code || error?.raw?.code || 'unknown_error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        details: error?.raw || null
      },
      { status: error?.statusCode || 500 }
    );
  }
}
