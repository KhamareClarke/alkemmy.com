import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface EmailVerificationPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: EmailVerificationPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Confirm your address</strong></p><p>This is your <strong>email verification</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nConfirm your address\n\n(email verification)\n\n— Alkhemmy`;
  return {
    subject: 'Verify your email | Alkhemmy',
    html: shellHtml('Confirm your address', inner, 'Verify your email'),
    text: shellText('Confirm your address', text),
  };
}
