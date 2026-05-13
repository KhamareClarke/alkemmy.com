import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AddressUpdatedPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AddressUpdatedPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>We saved your address</strong></p><p>This is your <strong>address updated</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nWe saved your address\n\n(address updated)\n\n— Alkhemmy`;
  return {
    subject: 'Address updated | Alkhemmy',
    html: shellHtml('We saved your address', inner, 'Address updated'),
    text: shellText('We saved your address', text),
  };
}
