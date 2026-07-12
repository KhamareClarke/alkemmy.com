import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';
import { sendContactFormEmail, sendContactFormAdminNotification } from '@/lib/email-service';
import { emitFleetIngest } from '@/lib/fleet-ingest';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Store contact message in database
    const { data: contactMessage, error: dbError } = await adminSupabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing contact message:', dbError);
      // Continue even if database storage fails
    } else if (contactMessage) {
      void emitFleetIngest({
        event_type: 'lead',
        summary: `Contact form: ${name} (${email}) — ${subject}`,
        payload: { id: contactMessage.id, name, email, subject },
      });
    }

    // Send confirmation email to user
    try {
      await sendContactFormEmail({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim()
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendContactFormAdminNotification({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim()
      });
    } catch (adminEmailError) {
      console.error('Error sending admin notification:', adminEmailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      messageId: contactMessage?.id
    });
  } catch (error) {
    console.error('Unexpected error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}



