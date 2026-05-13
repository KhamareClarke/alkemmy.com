import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface OrderDeliveredPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: OrderDeliveredPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your order was delivered</strong></p><p>This is your <strong>order delivered</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour order was delivered\n\n(order delivered)\n\n— Alkhemmy`;
  return {
    subject: 'Delivered | Alkhemmy',
    html: shellHtml('Your order was delivered', inner, 'Delivered'),
    text: shellText('Your order was delivered', text),
  };
}
