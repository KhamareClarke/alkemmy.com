import type { SmsType } from './types';

export function buildSmsBody(
  type: SmsType,
  vars: {
    orderNumber?: string;
    siteName?: string;
    trackingUrl?: string;
    productName?: string;
    cartUrl?: string;
    amount?: string;
  }
): string {
  const brand = vars.siteName ?? 'Alkhemmy';
  const order = vars.orderNumber ?? 'your order';
  switch (type) {
    case 'order_confirmation':
      return `${brand}: Thanks! Order ${order} is confirmed. We'll email you updates.`;
    case 'shipment_tracking':
      return `${brand}: Order ${order} shipped. Track: ${vars.trackingUrl ?? 'check your email'}`;
    case 'delivery':
      return `${brand}: Order ${order} was delivered. Enjoy — we'd love a review!`;
    case 'back_in_stock':
      return `${brand}: ${vars.productName ?? 'An item'} is back in stock. Shop before it sells out.`;
    case 'abandoned_cart':
      return `${brand}: You left items in your cart. Complete checkout: ${vars.cartUrl ?? brand}`;
    case 'payment_failed':
      return `${brand}: Payment failed${vars.amount ? ` (${vars.amount})` : ''} for order ${order}. Retry in checkout or email us.`;
    case 'review_request':
      return `${brand}: How was order ${order}? Leave a quick review — it helps us grow.`;
    default:
      return `${brand} update.`;
  }
}
