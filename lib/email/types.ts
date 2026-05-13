export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export const EMAIL_NOTIFICATION_TYPES = [
  'signup_confirmation',
  'email_verification',
  'login_new_device',
  'password_reset',
  'password_changed',
  'account_suspended_auth',
  'account_reactivated_auth',
  'order_confirmation',
  'order_shipped',
  'order_delivered',
  'order_cancelled',
  'refund_processed',
  'payment_failed',
  'back_in_stock',
  'price_drop',
  'product_review_request',
  'new_product_launch',
  'newsletter_signup_confirmation',
  'newsletter_weekly',
  'newsletter_seasonal',
  'abandoned_cart',
  'wishlist_reminder',
  'address_updated',
  'payment_method_added',
  'account_suspended_billing',
  'account_reactivated_billing',
  'admin_new_order',
  'admin_low_stock',
  'admin_inventory_low',
  'admin_high_value_purchase',
  'admin_new_review',
  'review_reply_notification',
] as const;

export type EmailNotificationType = (typeof EMAIL_NOTIFICATION_TYPES)[number];
