import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface ProductReviewRequestPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: ProductReviewRequestPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Leave a review</strong></p><p>This is your <strong>product review request</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nLeave a review\n\n(product review request)\n\n— Alkhemmy`;
  return {
    subject: 'How was your purchase? | Alkhemmy',
    html: shellHtml('Leave a review', inner, 'How was your purchase?'),
    text: shellText('Leave a review', text),
  };
}
