import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AdminHighValuePurchasePayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AdminHighValuePurchasePayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>High-value purchase</strong></p><p>This is your <strong>admin high value purchase</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nHigh-value purchase\n\n(admin high value purchase)\n\n— Alkhemmy`;
  return {
    subject: 'VIP order | Alkhemmy',
    html: shellHtml('High-value purchase', inner, 'VIP order'),
    text: shellText('High-value purchase', text),
  };
}
