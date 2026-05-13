import type { EmailContent, EmailNotificationType } from './types';
import { sendRawEmailSafe } from './send-core';
import {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  sendPaymentFailedEmail,
  sendOrderStatusUpdateEmail,
  sendPasswordResetCodeEmail,
  type OrderConfirmationEmail,
  type PaymentFailedEmail,
  type OrderStatusUpdateEmail,
} from '@/lib/email-service';

type TemplateModule = { render: (p: Record<string, unknown>) => EmailContent };
type Loader = () => Promise<unknown>;

const templateLoaders: Partial<Record<EmailNotificationType, Loader>> = {
  signup_confirmation: () => import('./templates/signup_confirmation'),
  email_verification: () => import('./templates/email_verification'),
  login_new_device: () => import('./templates/login_new_device'),
  password_changed: () => import('./templates/password_changed'),
  account_suspended_auth: () => import('./templates/account_suspended_auth'),
  account_reactivated_auth: () => import('./templates/account_reactivated_auth'),
  refund_processed: () => import('./templates/refund_processed'),
  back_in_stock: () => import('./templates/back_in_stock'),
  price_drop: () => import('./templates/price_drop'),
  product_review_request: () => import('./templates/product_review_request'),
  new_product_launch: () => import('./templates/new_product_launch'),
  newsletter_signup_confirmation: () => import('./templates/newsletter_signup_confirmation'),
  newsletter_weekly: () => import('./templates/newsletter_weekly'),
  newsletter_seasonal: () => import('./templates/newsletter_seasonal'),
  abandoned_cart: () => import('./templates/abandoned_cart'),
  wishlist_reminder: () => import('./templates/wishlist_reminder'),
  address_updated: () => import('./templates/address_updated'),
  payment_method_added: () => import('./templates/payment_method_added'),
  account_suspended_billing: () => import('./templates/account_suspended_billing'),
  account_reactivated_billing: () => import('./templates/account_reactivated_billing'),
  admin_low_stock: () => import('./templates/admin_low_stock'),
  admin_inventory_low: () => import('./templates/admin_inventory_low'),
  admin_high_value_purchase: () => import('./templates/admin_high_value_purchase'),
  admin_new_review: () => import('./templates/admin_new_review'),
  review_reply_notification: () => import('./templates/review_reply_notification'),
};

function resolveTo(payload: Record<string, unknown>): string {
  const v = payload.to ?? payload.customerEmail ?? payload.email;
  return typeof v === 'string' ? v : '';
}

export async function sendNotificationEmail(
  type: EmailNotificationType,
  payload: Record<string, unknown>
): Promise<void> {
  switch (type) {
    case 'order_confirmation':
      await sendOrderConfirmationEmail(payload as unknown as OrderConfirmationEmail);
      return;
    case 'admin_new_order':
      await sendAdminNotificationEmail(payload as unknown as OrderConfirmationEmail);
      return;
    case 'payment_failed':
      await sendPaymentFailedEmail(payload as unknown as PaymentFailedEmail);
      return;
    case 'password_reset': {
      const email = String(payload.email ?? payload.to ?? '');
      const code = String(payload.code ?? '');
      if (!email || !code) {
        console.error('sendNotificationEmail password_reset: missing email or code');
        return;
      }
      await sendPasswordResetCodeEmail({ email, code });
      return;
    }
    case 'order_shipped':
    case 'order_delivered':
    case 'order_cancelled': {
      const data = payload as unknown as OrderStatusUpdateEmail;
      const inferred =
        type === 'order_shipped' ? 'shipped' : type === 'order_delivered' ? 'delivered' : 'cancelled';
      await sendOrderStatusUpdateEmail({
        ...data,
        newStatus: data.newStatus || inferred,
      });
      return;
    }
    default:
      break;
  }

  const loader = templateLoaders[type];
  if (!loader) {
    console.error(`sendNotificationEmail: no handler for type "${type}"`);
    return;
  }

  const mod = (await loader()) as TemplateModule;
  const content = mod.render(payload);
  const to = resolveTo(payload);
  if (!to) {
    console.error(`sendNotificationEmail(${type}): missing recipient (to / customerEmail / email)`);
    return;
  }

  await sendRawEmailSafe({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    emailType: type,
  });
}
