import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentFailedEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json();
    
    await sendPaymentFailedEmail(emailData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}




