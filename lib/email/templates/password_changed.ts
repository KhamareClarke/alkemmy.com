import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface PasswordChangedPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: PasswordChangedPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your password was changed</strong></p><p>This is your <strong>password changed</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour password was changed\n\n(password changed)\n\n— Alkhemmy`;
  return {
    subject: 'Password updated | Alkhemmy',
    html: shellHtml('Your password was changed', inner, 'Password updated'),
    text: shellText('Your password was changed', text),
  };
}
