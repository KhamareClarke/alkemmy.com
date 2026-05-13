import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotificationEmail } from '@/lib/email/send-notification';
import { recordAnalyticsEvent } from '@/lib/analytics/server-events';
import { ANALYTICS_EVENTS } from '@/lib/analytics/types';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store in database (create newsletter_subscribers table if needed)
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        name: name || null,
        subscribed_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // If duplicate, return success (already subscribed)
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!'
        });
      }
      throw error;
    }

    const normalized = email.toLowerCase().trim();
    const first =
      typeof name === 'string' && name.trim()
        ? name.trim().split(/\s+/)[0] ?? ''
        : '';
    void sendNotificationEmail('newsletter_signup_confirmation', {
      to: normalized,
      firstName: first,
    }).catch((e) => console.error('newsletter confirmation email:', e));

    void recordAnalyticsEvent({
      eventName: ANALYTICS_EVENTS.NEWSLETTER_SIGNUP,
      eventCategory: 'marketing',
      eventProperties: { email_domain: normalized.split('@')[1] },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}




