import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface PriceDropPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: PriceDropPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>A better price for you</strong></p><p>This is your <strong>price drop</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nA better price for you\n\n(price drop)\n\n— Alkhemmy`;
  return {
    subject: 'Price drop | Alkhemmy',
    html: shellHtml('A better price for you', inner, 'Price drop'),
    text: shellText('A better price for you', text),
  };
}
