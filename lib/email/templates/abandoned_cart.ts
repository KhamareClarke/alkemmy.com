import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AbandonedCartPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AbandonedCartPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Complete your order</strong></p><p>This is your <strong>abandoned cart</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nComplete your order\n\n(abandoned cart)\n\n— Alkhemmy`;
  return {
    subject: 'Your cart is waiting | Alkhemmy',
    html: shellHtml('Complete your order', inner, 'Your cart is waiting'),
    text: shellText('Complete your order', text),
  };
}
