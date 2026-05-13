import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface ReviewReplyNotificationPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: ReviewReplyNotificationPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>The team responded</strong></p><p>This is your <strong>review reply notification</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nThe team responded\n\n(review reply notification)\n\n— Alkhemmy`;
  return {
    subject: 'Reply to your review | Alkhemmy',
    html: shellHtml('The team responded', inner, 'Reply to your review'),
    text: shellText('The team responded', text),
  };
}
