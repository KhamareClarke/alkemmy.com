import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface RefundProcessedPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: RefundProcessedPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your refund is on the way</strong></p><p>This is your <strong>refund processed</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour refund is on the way\n\n(refund processed)\n\n— Alkhemmy`;
  return {
    subject: 'Refund processed | Alkhemmy',
    html: shellHtml('Your refund is on the way', inner, 'Refund processed'),
    text: shellText('Your refund is on the way', text),
  };
}
