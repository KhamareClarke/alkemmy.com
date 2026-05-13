import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AdminInventoryLowPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AdminInventoryLowPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Several SKUs are low</strong></p><p>This is your <strong>admin inventory low</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nSeveral SKUs are low\n\n(admin inventory low)\n\n— Alkhemmy`;
  return {
    subject: 'Inventory alert | Alkhemmy',
    html: shellHtml('Several SKUs are low', inner, 'Inventory alert'),
    text: shellText('Several SKUs are low', text),
  };
}
