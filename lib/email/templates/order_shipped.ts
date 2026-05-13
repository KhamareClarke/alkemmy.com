import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface OrderShippedPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: OrderShippedPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your order is on the way</strong></p><p>This is your <strong>order shipped</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour order is on the way\n\n(order shipped)\n\n— Alkhemmy`;
  return {
    subject: 'Order shipped | Alkhemmy',
    html: shellHtml('Your order is on the way', inner, 'Order shipped'),
    text: shellText('Your order is on the way', text),
  };
}
