import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface PasswordResetPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: PasswordResetPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Reset your password</strong></p><p>This is your <strong>password reset</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nReset your password\n\n(password reset)\n\n— Alkhemmy`;
  return {
    subject: 'Password reset | Alkhemmy',
    html: shellHtml('Reset your password', inner, 'Password reset'),
    text: shellText('Reset your password', text),
  };
}
