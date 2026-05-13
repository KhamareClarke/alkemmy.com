export const SMS_TYPES = [
  'order_confirmation',
  'shipment_tracking',
  'delivery',
  'back_in_stock',
  'abandoned_cart',
  'payment_failed',
  'review_request',
] as const;

export type SmsType = (typeof SMS_TYPES)[number];

export interface SendSmsOptions {
  to: string;
  body: string;
  type: SmsType;
  idempotencyKey?: string;
}

export type SmsProvider = 'ghl' | 'twilio';
