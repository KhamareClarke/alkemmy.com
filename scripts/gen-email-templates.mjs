import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toPascal(s) {
  return s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}

const root = path.join(__dirname, '..', 'lib', 'email', 'templates');

const specs = [
  ['signup_confirmation', 'Welcome to Alkhemmy', 'Your account'],
  ['email_verification', 'Verify your email', 'Confirm your address'],
  ['login_new_device', 'New sign-in', 'We noticed a new login'],
  ['password_reset', 'Password reset', 'Reset your password'],
  ['password_changed', 'Password updated', 'Your password was changed'],
  ['account_suspended_auth', 'Account suspended', 'Your account has been suspended'],
  ['account_reactivated_auth', 'Account reactivated', 'Your account is active again'],
  ['order_confirmation', 'Order confirmed', 'Thank you for your order'],
  ['order_shipped', 'Order shipped', 'Your order is on the way'],
  ['order_delivered', 'Delivered', 'Your order was delivered'],
  ['order_cancelled', 'Order cancelled', 'Your order was cancelled'],
  ['refund_processed', 'Refund processed', 'Your refund is on the way'],
  ['payment_failed', 'Payment failed', 'We could not process payment'],
  ['back_in_stock', 'Back in stock', 'An item you wanted is available'],
  ['price_drop', 'Price drop', 'A better price for you'],
  ['product_review_request', 'How was your purchase?', 'Leave a review'],
  ['new_product_launch', 'New at Alkhemmy', 'Discover something new'],
  ['newsletter_signup_confirmation', 'Subscribed', 'You are on the list'],
  ['newsletter_weekly', 'Alkhemmy weekly', 'This week at Alkhemmy'],
  ['newsletter_seasonal', 'Seasonal picks', 'Limited-time favourites'],
  ['abandoned_cart', 'Your cart is waiting', 'Complete your order'],
  ['wishlist_reminder', 'Your wishlist', 'Items you saved'],
  ['address_updated', 'Address updated', 'We saved your address'],
  ['payment_method_added', 'Payment method', 'A new card was added'],
  ['account_suspended_billing', 'Account notice', 'Important account update'],
  ['account_reactivated_billing', 'Welcome back', 'Your account is restored'],
  ['admin_new_order', 'New order (admin)', 'Fulfillment needed'],
  ['admin_low_stock', 'Low stock (admin)', 'Reorder soon'],
  ['admin_inventory_low', 'Inventory alert', 'Several SKUs are low'],
  ['admin_high_value_purchase', 'VIP order', 'High-value purchase'],
  ['admin_new_review', 'New review', 'A customer left a review'],
  ['review_reply_notification', 'Reply to your review', 'The team responded'],
];

if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });

for (const [id, subject, headline] of specs) {
  const pascal = toPascal(id);
  const file = path.join(root, `${id}.ts`);
  const body = `import type { EmailContent } from '../types';
import { shellHtml, shellText } from '../shell';

export interface ${pascal}Payload {
  to: string;
  [key: string]: unknown;
}

export function render(p: ${pascal}Payload): EmailContent {
  const name = typeof p.firstName === 'string' ? p.firstName : '';
  const greet = name ? \`Hi \${name},\` : 'Hello,';
  const inner = \`<p>\${greet}</p><p><strong>${headline}</strong></p><p>This is your <strong>${id.replace(
    /_/g,
    ' '
  )}</strong> notification from Alkhemmy.</p><p>For full details, sign in to your account or contact support.</p>\`;
  const text = \`\${greet}\\n\\n${headline}\\n\\n(${id.replace(/_/g, ' ')})\\n\\n— Alkhemmy\`;
  return {
    subject: '${subject} | Alkhemmy',
    html: shellHtml('${headline}', inner, '${subject}'),
    text: shellText('${headline}', text),
  };
}
`;
  fs.writeFileSync(file, body);
}

console.log('Wrote', specs.length, 'templates');
