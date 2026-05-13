import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface OrderCancelledPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: OrderCancelledPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your order was cancelled</strong></p><p>This is your <strong>order cancelled</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour order was cancelled\n\n(order cancelled)\n\n— Alkhemmy`;
  return {
    subject: 'Order cancelled | Alkhemmy',
    html: shellHtml('Your order was cancelled', inner, 'Order cancelled'),
    text: shellText('Your order was cancelled', text),
  };
}
