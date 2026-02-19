import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

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
      cancelUrl 
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

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const shipping = subtotal > 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    // Log for debugging
    console.log('Creating checkout session with:', {
      cartItemsCount: cartItems.length,
      subtotal,
      shipping,
      total,
      firstItem: cartItems[0] ? {
        name: cartItems[0].name,
        price: cartItems[0].price,
        image: cartItems[0].image,
        quantity: cartItems[0].quantity
      } : null
    });

    // Create line items for Stripe
    // For large carts, minimize data to avoid URL length issues
    const isLargeCart = cartItems.length > 5;
    const lineItems = cartItems.map((item: any) => {
      // Truncate product name aggressively - 50 chars max for large carts, 80 for small
      const maxNameLength = isLargeCart ? 50 : 80;
      const productName = (item.name || 'Product').substring(0, maxNameLength);
      
      const productData: any = {
        name: productName,
      };
      
      // Only include description for small carts and truncate to 100 chars
      if (!isLargeCart && item.description && item.description.trim() !== '') {
        productData.description = item.description.substring(0, 100);
      }
      
      // Skip images for large carts to reduce URL length
      // Only include images for small carts (3 or fewer items)
      if (cartItems.length <= 3 && item.image && item.image.trim() !== '') {
        // Convert relative URLs to absolute URLs if needed
        let imageUrl = item.image.trim();
        if (imageUrl.startsWith('/')) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          imageUrl = `${baseUrl}${imageUrl}`;
        } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // If it's not a full URL, try to construct one
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          imageUrl = `${baseUrl}/${imageUrl}`;
        }
        // Only add if it's a valid URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          productData.images = [imageUrl];
        }
      }
      
      // Validate price
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      
      return {
        price_data: {
          currency: 'gbp',
          product_data: productData,
          unit_amount: Math.round(price * 100), // Convert to pence
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
            description: 'Standard shipping',
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
    const orderItemsData = cartItems.map((item: any) => ({
      order_id: tempOrder.id,
      product_id: String(item.id),
      product_name: item.name || 'Product',
      product_image: item.image || null,
      quantity: item.quantity || 1,
      price: parseFloat(item.price) || 0,
    }));
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
          cart_items: cartItems as any,
          subtotal,
          shipping,
          total,
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
          i: cartItems.map((item: any) => ({
            id: item.id,
            q: item.quantity, // 'q' for quantity
            p: item.price // 'p' for price
          })),
          t: { s: subtotal, sh: shipping, tot: total } // 't' for totals, 's' for subtotal, 'sh' for shipping, 'tot' for total
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
        i: cartItems.map((item: any) => ({
          id: item.id,
          q: item.quantity, // 'q' for quantity
          p: item.price // 'p' for price
        })),
        t: { s: subtotal, sh: shipping, tot: total } // 't' for totals
      };
      
      await supabase
        .from('orders')
        .update({ notes: JSON.stringify(compactData) })
        .eq('id', tempOrder.id);
    }

    // Ensure URLs are not too long - use short session_id only
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
      allow_promotion_codes: true,
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
