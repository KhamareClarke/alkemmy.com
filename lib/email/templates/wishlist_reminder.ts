import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface WishlistReminderPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: WishlistReminderPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Items you saved</strong></p><p>This is your <strong>wishlist reminder</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nItems you saved\n\n(wishlist reminder)\n\n— Alkhemmy`;
  return {
    subject: 'Your wishlist | Alkhemmy',
    html: shellHtml('Items you saved', inner, 'Your wishlist'),
    text: shellText('Items you saved', text),
  };
}
