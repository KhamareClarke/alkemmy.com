import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';
import { sendPasswordResetCodeEmail } from '@/lib/email-service';
import { emitEmpireActivity } from '@/lib/empire-activity';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists by checking profiles table
    // This avoids needing admin auth API access
    let userExists = false;
    try {
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      userExists = !profileError && profile !== null;
    } catch (error) {
      console.error('Error checking user existence:', error);
      // If we can't check, we'll still send the code for security
      // The verification step will handle if user doesn't exist
      userExists = true; // Assume user exists to prevent email enumeration
    }

    // Always return success to prevent email enumeration
    // But only send code if user exists
    if (userExists) {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Code expires in 15 minutes

      // Store code in database
      const { error: dbError } = await adminSupabase
        .from('password_reset_codes')
        .insert({
          email: email.toLowerCase(),
          code: code,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (dbError) {
        console.error('Error storing reset code:', dbError);
        return NextResponse.json(
          { error: 'Failed to generate reset code' },
          { status: 500 }
        );
      }

      try {
        await sendPasswordResetCodeEmail({
          email: email,
          code: code
        });
      } catch (emailError) {
        console.error('Error sending reset code email:', emailError);
      }

      void emitEmpireActivity({
        event_type: 'password_reset_request',
        user_email: email,
        request,
      });
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent.'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


