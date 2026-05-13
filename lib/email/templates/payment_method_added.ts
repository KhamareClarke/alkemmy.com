import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface PaymentMethodAddedPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: PaymentMethodAddedPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>A new card was added</strong></p><p>This is your <strong>payment method added</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nA new card was added\n\n(payment method added)\n\n— Alkhemmy`;
  return {
    subject: 'Payment method | Alkhemmy',
    html: shellHtml('A new card was added', inner, 'Payment method'),
    text: shellText('A new card was added', text),
  };
}
