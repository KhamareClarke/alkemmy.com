import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
}) : null;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    // Try to find order by payment_intent_id
    let order = null;
    if (session.payment_intent) {
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent.id;

      // Search for order by payment_intent_id in notes or column
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:addresses!shipping_address_id(*),
          billing_address:addresses!billing_address_id(*),
          order_items(*)
        `)
        .or(`notes.ilike.%${paymentIntentId}%,payment_intent_id.eq.${paymentIntentId}`)
        .eq('payment_method', 'stripe')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (orders) {
        order = orders;
      }
    }

    // If not found by payment_intent, try searching by session_id in notes
    if (!order) {
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:addresses!shipping_address_id(*),
          billing_address:addresses!billing_address_id(*),
          order_items(*)
        `)
        .ilike('notes', `%${sessionId}%`)
        .eq('payment_method', 'stripe')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (orders) {
        order = orders;
      }
    }

    return NextResponse.json({
      order,
      session: {
        id: session.id,
        status: session.payment_status,
      },
    });
  } catch (error) {
    console.error('Error getting order by session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}
