import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface OrderConfirmationPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: OrderConfirmationPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Thank you for your order</strong></p><p>This is your <strong>order confirmation</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nThank you for your order\n\n(order confirmation)\n\n— Alkhemmy`;
  return {
    subject: 'Order confirmed | Alkhemmy',
    html: shellHtml('Thank you for your order', inner, 'Order confirmed'),
    text: shellText('Thank you for your order', text),
  };
}
