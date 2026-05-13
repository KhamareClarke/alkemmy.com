export const PUSH_EVENT_TYPES = [
  'order_shipped',
  'order_delivered',
  'back_in_stock',
  'price_drop',
  'newsletter_offer',
] as const;

export type PushEventType = (typeof PUSH_EVENT_TYPES)[number];

export interface PushPayload {
  type: PushEventType;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}
