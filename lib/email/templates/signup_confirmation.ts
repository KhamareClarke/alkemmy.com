import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface SignupConfirmationPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: SignupConfirmationPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Your account</strong></p><p>This is your <strong>signup confirmation</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nYour account\n\n(signup confirmation)\n\n— Alkhemmy`;
  return {
    subject: 'Welcome to Alkhemmy | Alkhemmy',
    html: shellHtml('Your account', inner, 'Welcome to Alkhemmy'),
    text: shellText('Your account', text),
  };
}
