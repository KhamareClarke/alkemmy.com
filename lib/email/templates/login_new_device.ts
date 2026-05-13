import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface LoginNewDevicePayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: LoginNewDevicePayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>We noticed a new login</strong></p><p>This is your <strong>login new device</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nWe noticed a new login\n\n(login new device)\n\n— Alkhemmy`;
  return {
    subject: 'New sign-in | Alkhemmy',
    html: shellHtml('We noticed a new login', inner, 'New sign-in'),
    text: shellText('We noticed a new login', text),
  };
}
