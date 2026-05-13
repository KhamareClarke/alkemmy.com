import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface NewsletterWeeklyPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: NewsletterWeeklyPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>This week at Alkhemmy</strong></p><p>This is your <strong>newsletter weekly</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nThis week at Alkhemmy\n\n(newsletter weekly)\n\n— Alkhemmy`;
  return {
    subject: 'Alkhemmy weekly | Alkhemmy',
    html: shellHtml('This week at Alkhemmy', inner, 'Alkhemmy weekly'),
    text: shellText('This week at Alkhemmy', text),
  };
}
