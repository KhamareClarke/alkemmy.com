import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminSupabase } from '@/lib/admin-supabase';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'khamareclarke@gmail.com',
      pass: 'ovga hgzy rltc ifyh' // App password
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, from, emailType = 'custom' } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = createTransporter();
    
    // Send the email
    await transporter.sendMail({
      from: from || 'khamareclarke@gmail.com',
      to: to,
      subject: subject,
      html: body.replace(/\n/g, '<br>'), // Convert line breaks to HTML
      text: body
    });
    
    // Store the email in database
    const { data: emailRecord, error: dbError } = await adminSupabase
      .from('emails')
      .insert({
        to_email: to,
        from_email: from || 'khamareclarke@gmail.com',
        subject: subject,
        body: body,
        email_type: emailType,
        status: 'sent'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Failed to store email in database:', dbError);
      // Don't fail the request if database storage fails
    }
    
    console.log('✅ Custom email sent to:', to);
    console.log('✅ Email stored in database:', emailRecord?.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: emailRecord?.id 
    });
    
  } catch (error: any) {
    console.error('❌ Failed to send custom email:', error);
    
    // Try to store failed email attempt
    try {
      const { to, subject, body, from, emailType = 'custom' } = await request.json();
      await adminSupabase
        .from('emails')
        .insert({
          to_email: to,
          from_email: from || 'khamareclarke@gmail.com',
          subject: subject,
          body: body,
          email_type: emailType,
          status: 'failed'
        });
    } catch (dbError) {
      console.error('❌ Failed to store failed email in database:', dbError);
    }
    
    return NextResponse.json({ error: 'Failed to send email: ' + error.message }, { status: 500 });
  }
}
