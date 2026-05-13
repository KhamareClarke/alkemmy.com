import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface PaymentFailedPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: PaymentFailedPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>We could not process payment</strong></p><p>This is your <strong>payment failed</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nWe could not process payment\n\n(payment failed)\n\n— Alkhemmy`;
  return {
    subject: 'Payment failed | Alkhemmy',
    html: shellHtml('We could not process payment', inner, 'Payment failed'),
    text: shellText('We could not process payment', text),
  };
}
