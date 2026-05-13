import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AdminNewReviewPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AdminNewReviewPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>A customer left a review</strong></p><p>This is your <strong>admin new review</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nA customer left a review\n\n(admin new review)\n\n— Alkhemmy`;
  return {
    subject: 'New review | Alkhemmy',
    html: shellHtml('A customer left a review', inner, 'New review'),
    text: shellText('A customer left a review', text),
  };
}
