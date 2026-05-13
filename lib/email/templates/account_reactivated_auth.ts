import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AccountReactivatedAuthPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AccountReactivatedAuthPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your account is active again</strong></p><p>This is your <strong>account reactivated auth</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour account is active again\n\n(account reactivated auth)\n\n— Alkhemmy`;
  return {
    subject: 'Account reactivated | Alkhemmy',
    html: shellHtml('Your account is active again', inner, 'Account reactivated'),
    text: shellText('Your account is active again', text),
  };
}
