import { adminSupabase } from '@/lib/admin-supabase';

export async function logEmailSent(params: {
  to: string;
  from: string;
  subject: string;
  body: string;
  emailType: string;
  status: 'sent' | 'failed';
}): Promise<void> {
  try {
    await adminSupabase.from('emails').insert({
      to_email: params.to,
      from_email: params.from,
      subject: params.subject,
      body: params.body,
      email_type: params.emailType,
      status: params.status,
    });
  } catch (e) {
    console.error('logEmailSent:', e);
  }
}
