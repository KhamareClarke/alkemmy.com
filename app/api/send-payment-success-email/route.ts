import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentSuccessEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json();
    
    await sendPaymentSuccessEmail(emailData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}




