import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    const lineItems = cartItems.map((item: any) => {
      const productData: any = {
        name: item.name || 'Product',
      };
      
      // Only include description if it exists and is not empty
      if (item.description && item.description.trim() !== '') {
        productData.description = item.description;
      }
      
      // Handle images - Stripe requires full URLs (only include if valid)
      if (item.image && item.image.trim() !== '') {
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

    // Create checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout?canceled=true`,
      customer_email: orderData.shippingAddress.email,
      metadata: {
        userId: userId || 'guest',
        orderData: JSON.stringify({
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          billingSameAsShipping: orderData.billingSameAsShipping,
          saveAddress: orderData.saveAddress,
        }),
        cartItems: JSON.stringify(cartItems),
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
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
