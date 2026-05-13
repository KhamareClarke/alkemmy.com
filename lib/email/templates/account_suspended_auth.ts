import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AccountSuspendedAuthPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AccountSuspendedAuthPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your account has been suspended</strong></p><p>This is your <strong>account suspended auth</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour account has been suspended\n\n(account suspended auth)\n\n— Alkhemmy`;
  return {
    subject: 'Account suspended | Alkhemmy',
    html: shellHtml('Your account has been suspended', inner, 'Account suspended'),
    text: shellText('Your account has been suspended', text),
  };
}
