import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface NewProductLaunchPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: NewProductLaunchPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Discover something new</strong></p><p>This is your <strong>new product launch</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nDiscover something new\n\n(new product launch)\n\n— Alkhemmy`;
  return {
    subject: 'New at Alkhemmy | Alkhemmy',
    html: shellHtml('Discover something new', inner, 'New at Alkhemmy'),
    text: shellText('Discover something new', text),
  };
}
