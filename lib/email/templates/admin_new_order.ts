import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AdminNewOrderPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AdminNewOrderPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Fulfillment needed</strong></p><p>This is your <strong>admin new order</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nFulfillment needed\n\n(admin new order)\n\n— Alkhemmy`;
  return {
    subject: 'New order (admin) | Alkhemmy',
    html: shellHtml('Fulfillment needed', inner, 'New order (admin)'),
    text: shellText('Fulfillment needed', text),
  };
}
