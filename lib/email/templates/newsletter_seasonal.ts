import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface NewsletterSeasonalPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: NewsletterSeasonalPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Limited-time favourites</strong></p><p>This is your <strong>newsletter seasonal</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nLimited-time favourites\n\n(newsletter seasonal)\n\n— Alkhemmy`;
  return {
    subject: 'Seasonal picks | Alkhemmy',
    html: shellHtml('Limited-time favourites', inner, 'Seasonal picks'),
    text: shellText('Limited-time favourites', text),
  };
}
