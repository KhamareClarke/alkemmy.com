import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface NewsletterSignupConfirmationPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: NewsletterSignupConfirmationPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>You are on the list</strong></p><p>This is your <strong>newsletter signup confirmation</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYou are on the list\n\n(newsletter signup confirmation)\n\n— Alkhemmy`;
  return {
    subject: 'Subscribed | Alkhemmy',
    html: shellHtml('You are on the list', inner, 'Subscribed'),
    text: shellText('You are on the list', text),
  };
}
