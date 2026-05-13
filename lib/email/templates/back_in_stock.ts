import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface BackInStockPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: BackInStockPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>An item you wanted is available</strong></p><p>This is your <strong>back in stock</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nAn item you wanted is available\n\n(back in stock)\n\n— Alkhemmy`;
  return {
    subject: 'Back in stock | Alkhemmy',
    html: shellHtml('An item you wanted is available', inner, 'Back in stock'),
    text: shellText('An item you wanted is available', text),
  };
}
