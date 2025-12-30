import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/admin-supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find the reset code
    const { data: resetCode, error: codeError } = await adminSupabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (codeError || !resetCode) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 400 }
      );
    }

    // If newPassword is provided, update the password
    if (newPassword) {
      // Get user by email from profiles table to get user ID
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError || !profile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Create a new admin client with service role key to ensure we have proper permissions
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Check configuration
      if (!supabaseUrl) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
        return NextResponse.json(
          { 
            error: 'Server configuration error: NEXT_PUBLIC_SUPABASE_URL is missing.',
            requiresConfig: true
          },
          { status: 500 }
        );
      }

      if (!serviceRoleKey || serviceRoleKey === anonKey) {
        console.error('Service role key not configured properly');
        console.error('Service role key exists:', !!serviceRoleKey);
        console.error('Service role key equals anon key:', serviceRoleKey === anonKey);
        
        return NextResponse.json(
          { 
            error: 'SUPABASE_SERVICE_ROLE_KEY is not configured. To fix: 1) Go to Supabase Dashboard > Settings > API, 2) Copy the service_role key (NOT the anon key), 3) Add SUPABASE_SERVICE_ROLE_KEY=your_key to .env.local, 4) Restart the server.',
            requiresConfig: true,
            setupInstructions: {
              step1: 'Go to Supabase Dashboard → Settings → API',
              step2: 'Copy the service_role key (it starts with eyJ and is different from anon key)',
              step3: 'Add this line to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key',
              step4: 'Restart your Next.js server (npm run dev)'
            }
          },
          { status: 500 }
        );
      }

      // Create admin client directly with service role key
      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Update password using admin API
      try {
        const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
          profile.id,
          { password: newPassword }
        );

        if (updateError) {
          console.error('Error updating password:', updateError);
          
          // Check if it's a permissions error
          if (updateError.message?.includes('not allowed') || updateError.code === 'not_admin' || updateError.status === 403) {
            return NextResponse.json(
              { 
                error: 'Service role key is not configured correctly. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. Get it from Supabase Dashboard > Settings > API > service_role key.',
                requiresAdmin: true
              },
              { status: 500 }
            );
          }
          
          return NextResponse.json(
            { error: `Failed to update password: ${updateError.message || 'Unknown error'}` },
            { status: 500 }
          );
        }

        if (!updatedUser || !updatedUser.user) {
          return NextResponse.json(
            { error: 'Password update failed - user not found in auth system' },
            { status: 404 }
          );
        }

        console.log('✅ Password updated successfully for user:', email);
      } catch (adminError: any) {
        console.error('Admin API error:', adminError);
        return NextResponse.json(
          { 
            error: `Password update failed: ${adminError.message || 'Unknown error'}. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local`,
            requiresAdmin: true
          },
          { status: 500 }
        );
      }

      // Mark code as used
      await adminSupabase
        .from('password_reset_codes')
        .update({ used: true })
        .eq('id', resetCode.id);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    }

    // If no newPassword, just verify the code
    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


