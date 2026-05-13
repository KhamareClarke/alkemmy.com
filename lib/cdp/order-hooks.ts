import 'server-only';
import { recordCustomerJourneyEvent } from './journey';
import { refreshCustomerProfileFromOrders } from './profile';
import { reserveInventoryForOrder } from '@/lib/inventory/stock';
import { awardLoyaltyPointsForPaidOrder } from '@/lib/loyalty/points';

export async function onOrderCreated(args: {
  userId: string | null;
  orderId: string;
  orderNumber: string;
  total: number;
  guestEmail: string;
  items: { product_id: string; quantity: number; variant_id?: string }[];
}): Promise<void> {
  await recordCustomerJourneyEvent({
    userId: args.userId,
    guestEmail: args.guestEmail,
    eventType: 'order_created',
    eventCategory: 'commerce',
    title: `Order ${args.orderNumber} placed`,
    payload: { order_number: args.orderNumber, total: args.total, line_count: args.items.length },
    orderId: args.orderId,
  });
  await reserveInventoryForOrder(args.orderId, args.items);
}

export async function onOrderPaymentPaid(args: {
  userId: string | null;
  orderId: string;
  orderTotal: number;
}): Promise<void> {
  if (!args.userId) return;
  await recordCustomerJourneyEvent({
    userId: args.userId,
    eventType: 'payment_completed',
    eventCategory: 'commerce',
    title: 'Payment received',
    payload: { order_id: args.orderId, total: args.orderTotal },
    orderId: args.orderId,
  });
  await awardLoyaltyPointsForPaidOrder(args.userId, args.orderId, args.orderTotal);
  await refreshCustomerProfileFromOrders(args.userId);
}

export async function onOrderStatusChanged(args: {
  userId: string | null;
  guestEmail?: string | null;
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatus: string;
}): Promise<void> {
  await recordCustomerJourneyEvent({
    userId: args.userId,
    guestEmail: args.guestEmail,
    eventType: 'order_status',
    eventCategory: 'fulfillment',
    title: `Order ${args.orderNumber}: ${args.previousStatus} → ${args.status}`,
    payload: { previous: args.previousStatus, next: args.status },
    orderId: args.orderId,
  });
}
