import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AccountSuspendedBillingPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AccountSuspendedBillingPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Important account update</strong></p><p>This is your <strong>account suspended billing</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nImportant account update\n\n(account suspended billing)\n\n— Alkhemmy`;
  return {
    subject: 'Account notice | Alkhemmy',
    html: shellHtml('Important account update', inner, 'Account notice'),
    text: shellText('Important account update', text),
  };
}
