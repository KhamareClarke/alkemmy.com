import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AccountReactivatedBillingPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AccountReactivatedBillingPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your account is restored</strong></p><p>This is your <strong>account reactivated billing</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour account is restored\n\n(account reactivated billing)\n\n— Alkhemmy`;
  return {
    subject: 'Welcome back | Alkhemmy',
    html: shellHtml('Your account is restored', inner, 'Welcome back'),
    text: shellText('Your account is restored', text),
  };
}
