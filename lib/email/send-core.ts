import { createEmailTransporter, getFromEmail } from './smtp';
import { logEmailSent } from './log';

export async function sendRawEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: string;
  replyTo?: string;
  fromOverride?: string;
}): Promise<void> {
  const from = options.fromOverride || getFromEmail();
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
  await logEmailSent({
    to: options.to,
    from,
    subject: options.subject,
    body: options.text,
    emailType: options.emailType,
    status: 'sent',
  });
}

export async function sendRawEmailSafe(options: Parameters<typeof sendRawEmail>[0]): Promise<void> {
  try {
    await sendRawEmail(options);
  } catch (e) {
    console.error('sendRawEmailSafe failed:', e);
    try {
      await logEmailSent({
        to: options.to,
        from: options.fromOverride || getFromEmail(),
        subject: options.subject,
        body: options.text,
        emailType: options.emailType,
        status: 'failed',
      });
    } catch {
      /* ignore */
    }
  }
}
