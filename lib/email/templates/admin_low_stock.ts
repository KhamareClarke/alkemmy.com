import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface AdminLowStockPayload {
  to: string;
  [key: string]: unknown;
}

export function render(p: AdminLowStockPayload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? `Hi ${name},` : 'Hello,';
  const inner = `<p>${greet}</p><p><strong>Reorder soon</strong></p><p>This is your <strong>admin low stock</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>`;
  const text = `${greet}\n\nReorder soon\n\n(admin low stock)\n\n— Alkhemmy`;
  return {
    subject: 'Low stock (admin) | Alkhemmy',
    html: shellHtml('Reorder soon', inner, 'Low stock (admin)'),
    text: shellText('Reorder soon', text),
  };
}
