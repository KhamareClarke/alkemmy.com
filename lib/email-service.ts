// Email service for order confirmations using Nodemailer
import { adminSupabase } from './admin-supabase';
import { createEmailTransporter, getFromEmail, getAdminEmail } from './email/smtp';

export interface OrderConfirmationEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  orderDate: string;
}

export async function sendOrderConfirmationEmail(emailData: OrderConfirmationEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `Order Confirmation - ${emailData.orderNumber} | Alkemmy`;
    const htmlBody = generateOrderConfirmationHTML(emailData);
    const textBody = generateOrderConfirmationText(emailData);
    
    await transporter.sendMail({
      from: getFromEmail(),
      to: emailData.customerEmail,
      subject: subject,
      html: htmlBody,
      text: textBody
    });
    
    // Store the email in database
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'order_confirmation',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store order confirmation email in database:', dbError);
    }
    
    console.log('✅ Order confirmation email sent to:', emailData.customerEmail);
    
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    
    // Try to store failed email attempt
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: `Order Confirmation - ${emailData.orderNumber} | Alkemmy`,
          body: generateOrderConfirmationText(emailData),
          email_type: 'order_confirmation',
          status: 'failed'
        });
    } catch (dbError) {
      console.error('❌ Failed to store failed order confirmation email in database:', dbError);
    }
    // Don't throw here as email failure shouldn't break the order process
  }
}

export async function sendAdminNotificationEmail(orderData: OrderConfirmationEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `New Order Received - ${orderData.orderNumber} | Alkemmy Admin`;
    const htmlBody = generateAdminNotificationHTML(orderData);
    const textBody = generateAdminNotificationText(orderData);
    
    await transporter.sendMail({
      from: getFromEmail(),
      to: getAdminEmail(),
      subject: subject,
      html: htmlBody,
      text: textBody
    });
    
    // Store the email in database
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: getAdminEmail(),
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'admin_notification',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store admin notification email in database:', dbError);
    }
    
    console.log('✅ Admin notification email sent for order:', orderData.orderNumber);
    
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error);
    // Don't throw here as email failure shouldn't break the order process
  }
}

export interface PaymentSuccessEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  paymentIntentId?: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface PaymentFailedEmail {
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  errorMessage: string;
  orderDate: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderStatusUpdateEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  previousStatus: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export async function sendPaymentSuccessEmail(emailData: PaymentSuccessEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `Payment Successful - Order ${emailData.orderNumber} | Alkemmy`;
    const htmlBody = generatePaymentSuccessHTML(emailData);
    const textBody = generatePaymentSuccessText(emailData);
    
    await transporter.sendMail({
      from: getFromEmail(),
      to: emailData.customerEmail,
      subject: subject,
      html: htmlBody,
      text: textBody
    });
    
    // Store the email in database
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'payment_success',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store payment success email in database:', dbError);
    }
    
    console.log('✅ Payment success email sent to:', emailData.customerEmail);
    
  } catch (error) {
    console.error('❌ Failed to send payment success email:', error);
    
    // Try to store failed email attempt
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: `Payment Successful - Order ${emailData.orderNumber} | Alkemmy`,
          body: generatePaymentSuccessText(emailData),
          email_type: 'payment_success',
          status: 'failed'
        });
    } catch (dbError) {
      console.error('❌ Failed to store failed payment success email in database:', dbError);
    }
  }
}

export async function sendPaymentFailedEmail(emailData: PaymentFailedEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `Payment Failed - ${emailData.orderNumber ? `Order ${emailData.orderNumber}` : 'Your Order'} | Alkemmy`;
    const htmlBody = generatePaymentFailedHTML(emailData);
    const textBody = generatePaymentFailedText(emailData);
    
    await transporter.sendMail({
      from: getFromEmail(),
      to: emailData.customerEmail,
      subject: subject,
      html: htmlBody,
      text: textBody
    });
    
    // Store the email in database
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'payment_failed',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store payment failed email in database:', dbError);
    }
    
    console.log('✅ Payment failed email sent to:', emailData.customerEmail);
    
  } catch (error) {
    console.error('❌ Failed to send payment failed email:', error);
    
    // Try to store failed email attempt
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: `Payment Failed - ${emailData.orderNumber ? `Order ${emailData.orderNumber}` : 'Your Order'} | Alkemmy`,
          body: generatePaymentFailedText(emailData),
          email_type: 'payment_failed',
          status: 'failed'
        });
    } catch (dbError) {
      console.error('❌ Failed to store failed payment failed email in database:', dbError);
    }
  }
}

export async function sendOrderStatusUpdateEmail(emailData: OrderStatusUpdateEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `Order ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)} - ${emailData.orderNumber} | Alkemmy`;
    const htmlBody = generateOrderStatusUpdateHTML(emailData);
    const textBody = generateOrderStatusUpdateText(emailData);
    
    await transporter.sendMail({
      from: getFromEmail(),
      to: emailData.customerEmail,
      subject: subject,
      html: htmlBody,
      text: textBody
    });
    
    // Store the email in database
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'status_update',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store status update email in database:', dbError);
    }
    
    console.log('✅ Order status update email sent to:', emailData.customerEmail);
    
  } catch (error) {
    console.error('❌ Failed to send order status update email:', error);
    
    // Try to store failed email attempt
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.customerEmail,
          from_email: getFromEmail(),
          subject: `Order ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)} - ${emailData.orderNumber} | Alkemmy`,
          body: generateOrderStatusUpdateText(emailData),
          email_type: 'status_update',
          status: 'failed'
        });
    } catch (dbError) {
      console.error('❌ Failed to store failed status update email in database:', dbError);
    }
    // Don't throw here as email failure shouldn't break the status update process
  }
}

function generateOrderConfirmationHTML(emailData: OrderConfirmationEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${emailData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .order-summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #D4AF37; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
          <p>Order #${emailData.orderNumber}</p>
        </div>
        <div class="content">
          <p>Dear ${emailData.customerName},</p>
          <p>Thank you for your order! We're excited to prepare your natural luxury products for you.</p>
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            ${emailData.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="item total">
              <span>Total</span>
              <span>£${emailData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Shipping Address</h3>
          <p>
            ${emailData.shippingAddress.name}<br>
            ${emailData.shippingAddress.address}<br>
            ${emailData.shippingAddress.city}, ${emailData.shippingAddress.state} ${emailData.shippingAddress.postalCode}<br>
            ${emailData.shippingAddress.country}
          </p>
          
          <h3>Payment Method</h3>
          <p>${emailData.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>We'll process your order within 1-2 business days</li>
            <li>You'll receive a shipping confirmation when your order is dispatched</li>
            <li>Your order will arrive within 3-5 business days</li>
          </ul>
          
          <p>If you have any questions, please contact us at ${getFromEmail()}</p>
          
          <div class="footer">
            <p>Thank you for choosing Alkemmy for your natural luxury needs!</p>
            <p>© 2024 Alkemmy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderConfirmationText(emailData: OrderConfirmationEmail): string {
  return `
Order Confirmation - ${emailData.orderNumber}

Dear ${emailData.customerName},

Thank you for your order! We're excited to prepare your natural luxury products for you.

Order Summary:
${emailData.items.map(item => `- ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}`).join('\n')}
Total: £${emailData.totalAmount.toFixed(2)}

Shipping Address:
${emailData.shippingAddress.name}
${emailData.shippingAddress.address}
${emailData.shippingAddress.city}, ${emailData.shippingAddress.state} ${emailData.shippingAddress.postalCode}
${emailData.shippingAddress.country}

Payment Method: ${emailData.paymentMethod.replace('_', ' ').toUpperCase()}

What's Next?
- We'll process your order within 1-2 business days
- You'll receive a shipping confirmation when your order is dispatched
- Your order will arrive within 3-5 business days

If you have any questions, please contact us at ${getFromEmail()}

Thank you for choosing Alkemmy for your natural luxury needs!

© 2024 Alkemmy. All rights reserved.
  `;
}

function generateAdminNotificationHTML(orderData: OrderConfirmationEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order - ${orderData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .order-summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #D4AF37; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 New Order Received!</h1>
          <p>Order #${orderData.orderNumber}</p>
        </div>
        <div class="content">
          <div class="alert">
            <strong>⚠️ Action Required:</strong> A new order has been placed and requires processing.
          </div>
          
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${orderData.customerName}</p>
          <p><strong>Email:</strong> ${orderData.customerEmail}</p>
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            ${orderData.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="item total">
              <span>Total</span>
              <span>£${orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Shipping Address</h3>
          <p>
            ${orderData.shippingAddress.name}<br>
            ${orderData.shippingAddress.address}<br>
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
            ${orderData.shippingAddress.country}
          </p>
          
          <h3>Payment Method</h3>
          <p>${orderData.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          
          <h3>Order Date</h3>
          <p>${orderData.orderDate}</p>
          
          <div class="alert">
            <strong>Next Steps:</strong>
            <ul>
              <li>Process the order in the admin panel</li>
              <li>Update order status to "Processing"</li>
              <li>Prepare items for shipping</li>
              <li>Update status to "Shipped" when dispatched</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from Alkemmy Admin System</p>
            <p>© 2024 Alkemmy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotificationText(orderData: OrderConfirmationEmail): string {
  return `
NEW ORDER RECEIVED - ${orderData.orderNumber}

Customer Information:
Name: ${orderData.customerName}
Email: ${orderData.customerEmail}

Order Summary:
${orderData.items.map(item => `- ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}`).join('\n')}
Total: £${orderData.totalAmount.toFixed(2)}

Shipping Address:
${orderData.shippingAddress.name}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}
${orderData.shippingAddress.country}

Payment Method: ${orderData.paymentMethod.replace('_', ' ').toUpperCase()}
Order Date: ${orderData.orderDate}

Next Steps:
- Process the order in the admin panel
- Update order status to "Processing"
- Prepare items for shipping
- Update status to "Shipped" when dispatched

This is an automated notification from Alkemmy Admin System

© 2024 Alkemmy. All rights reserved.
  `;
}

function generateOrderStatusUpdateHTML(emailData: OrderStatusUpdateEmail): string {
  const statusInfo = getStatusInfo(emailData.newStatus);
  const statusIcon = getStatusIcon(emailData.newStatus);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)} - ${emailData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-processing { background: #dbeafe; color: #1e40af; }
        .status-shipped { background: #d1fae5; color: #065f46; }
        .status-delivered { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .order-summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #D4AF37; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .tracking-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusIcon} Order ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)}!</h1>
          <p>Order #${emailData.orderNumber}</p>
        </div>
        <div class="content">
          <p>Dear ${emailData.customerName},</p>
          <p>We have an update on your order! Your order status has been updated from <strong>${emailData.previousStatus.charAt(0).toUpperCase() + emailData.previousStatus.slice(1)}</strong> to <strong>${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)}</strong>.</p>
          
          <div class="status-badge status-${emailData.newStatus}">
            ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)}
          </div>
          
          ${emailData.newStatus === 'shipped' ? `
          <div class="tracking-info">
            <h3>📦 Your Order Has Been Shipped!</h3>
            <p>Your order is now on its way to you. ${emailData.trackingNumber ? `Tracking Number: <strong>${emailData.trackingNumber}</strong>` : 'You will receive tracking information soon.'}</p>
            ${emailData.estimatedDelivery ? `<p>Estimated Delivery: <strong>${emailData.estimatedDelivery}</strong></p>` : ''}
          </div>
          ` : ''}
          
          ${emailData.newStatus === 'delivered' ? `
          <div class="tracking-info">
            <h3>🎉 Your Order Has Been Delivered!</h3>
            <p>Your order has been successfully delivered. We hope you enjoy your Alkemmy products!</p>
          </div>
          ` : ''}
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            ${emailData.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="item total">
              <span>Total</span>
              <span>£${emailData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>What's Next?</h3>
          ${getNextStepsContent(emailData.newStatus)}
          
          <p>If you have any questions, please contact us at ${getFromEmail()}</p>
          
          <div class="footer">
            <p>Thank you for choosing Alkemmy for your natural luxury needs!</p>
            <p>© 2024 Alkemmy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderStatusUpdateText(emailData: OrderStatusUpdateEmail): string {
  return `
Order ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)} - ${emailData.orderNumber}

Dear ${emailData.customerName},

We have an update on your order! Your order status has been updated from ${emailData.previousStatus.charAt(0).toUpperCase() + emailData.previousStatus.slice(1)} to ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)}.

Order Summary:
${emailData.items.map(item => `- ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}`).join('\n')}
Total: £${emailData.totalAmount.toFixed(2)}

${emailData.newStatus === 'shipped' ? `
Your Order Has Been Shipped!
Your order is now on its way to you. ${emailData.trackingNumber ? `Tracking Number: ${emailData.trackingNumber}` : 'You will receive tracking information soon.'}
${emailData.estimatedDelivery ? `Estimated Delivery: ${emailData.estimatedDelivery}` : ''}
` : ''}

${emailData.newStatus === 'delivered' ? `
Your Order Has Been Delivered!
Your order has been successfully delivered. We hope you enjoy your Alkemmy products!
` : ''}

What's Next?
${getNextStepsContent(emailData.newStatus).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}

If you have any questions, please contact us at ${getFromEmail()}

Thank you for choosing Alkemmy for your natural luxury needs!

© 2024 Alkemmy. All rights reserved.
  `;
}

function generatePaymentSuccessHTML(emailData: PaymentSuccessEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Successful - ${emailData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .success-badge { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
        .order-summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #10b981; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .info-box { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Successful!</h1>
          <p>Order #${emailData.orderNumber}</p>
        </div>
        <div class="content">
          <p>Dear ${emailData.customerName},</p>
          <p>Great news! Your payment has been successfully processed.</p>
          
          <div class="success-badge">
            ✅ Payment Confirmed - £${emailData.totalAmount.toFixed(2)}
          </div>
          
          <div class="info-box">
            <h3>Payment Details</h3>
            <p><strong>Payment Method:</strong> ${emailData.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            ${emailData.paymentIntentId ? `<p><strong>Transaction ID:</strong> ${emailData.paymentIntentId}</p>` : ''}
            <p><strong>Amount Paid:</strong> £${emailData.totalAmount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${emailData.orderDate}</p>
          </div>
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            ${emailData.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="item total">
              <span>Total Paid</span>
              <span>£${emailData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your order is now confirmed and will be processed within 1-2 business days</li>
            <li>You'll receive an order confirmation email shortly</li>
            <li>We'll send you a shipping notification when your order is dispatched</li>
            <li>Your order will arrive within 3-5 business days</li>
          </ul>
          
          <p>If you have any questions about your payment or order, please contact us at ${getFromEmail()}</p>
          
          <div class="footer">
            <p>Thank you for choosing Alkemmy for your natural luxury needs!</p>
            <p>© 2024 Alkemmy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentSuccessText(emailData: PaymentSuccessEmail): string {
  return `
Payment Successful - Order ${emailData.orderNumber}

Dear ${emailData.customerName},

Great news! Your payment has been successfully processed.

✅ Payment Confirmed - £${emailData.totalAmount.toFixed(2)}

Payment Details:
Payment Method: ${emailData.paymentMethod.replace('_', ' ').toUpperCase()}
${emailData.paymentIntentId ? `Transaction ID: ${emailData.paymentIntentId}\n` : ''}
Amount Paid: £${emailData.totalAmount.toFixed(2)}
Date: ${emailData.orderDate}

Order Summary:
${emailData.items.map(item => `- ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}`).join('\n')}
Total Paid: £${emailData.totalAmount.toFixed(2)}

What's Next?
- Your order is now confirmed and will be processed within 1-2 business days
- You'll receive an order confirmation email shortly
- We'll send you a shipping notification when your order is dispatched
- Your order will arrive within 3-5 business days

If you have any questions about your payment or order, please contact us at ${getFromEmail()}

Thank you for choosing Alkemmy for your natural luxury needs!

© 2024 Alkemmy. All rights reserved.
  `;
}

function generatePaymentFailedHTML(emailData: PaymentFailedEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Failed - ${emailData.orderNumber || 'Your Order'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .error-badge { background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
        .order-summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #dc2626; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .info-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .action-box { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Payment Failed</h1>
          ${emailData.orderNumber ? `<p>Order #${emailData.orderNumber}</p>` : ''}
        </div>
        <div class="content">
          <p>Dear ${emailData.customerName},</p>
          <p>We encountered an issue processing your payment.</p>
          
          <div class="error-badge">
            ❌ Payment Failed - £${emailData.totalAmount.toFixed(2)}
          </div>
          
          <div class="info-box">
            <h3>Payment Details</h3>
            <p><strong>Payment Method:</strong> ${emailData.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Amount:</strong> £${emailData.totalAmount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${emailData.orderDate}</p>
            <p><strong>Error:</strong> ${emailData.errorMessage}</p>
          </div>
          
          ${emailData.items && emailData.items.length > 0 ? `
          <div class="order-summary">
            <h3>Order Summary</h3>
            ${emailData.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="item total">
              <span>Total</span>
              <span>£${emailData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          ` : ''}
          
          <div class="action-box">
            <h3>What You Can Do</h3>
            <ul>
              <li><strong>Check your payment method:</strong> Ensure your card details are correct and your card has sufficient funds</li>
              <li><strong>Try again:</strong> You can retry the payment by going back to checkout</li>
              <li><strong>Use a different payment method:</strong> Consider using Cash on Delivery if available</li>
              <li><strong>Contact your bank:</strong> Sometimes banks block transactions for security reasons</li>
            </ul>
          </div>
          
          <h3>Common Reasons for Payment Failure</h3>
          <ul>
            <li>Insufficient funds in your account</li>
            <li>Incorrect card details (expiry date, CVV, or card number)</li>
            <li>Card has expired or been cancelled</li>
            <li>Bank security restrictions</li>
            <li>Network or connection issues</li>
          </ul>
          
          <p><strong>Need Help?</strong> If you continue to experience issues, please contact us at ${getFromEmail()} and we'll be happy to assist you.</p>
          
          <p>Your order has not been placed. No charges have been made to your account.</p>
          
          <div class="footer">
            <p>Thank you for your interest in Alkemmy!</p>
            <p>© 2024 Alkemmy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentFailedText(emailData: PaymentFailedEmail): string {
  return `
Payment Failed - ${emailData.orderNumber ? `Order ${emailData.orderNumber}` : 'Your Order'}

Dear ${emailData.customerName},

We encountered an issue processing your payment.

❌ Payment Failed - £${emailData.totalAmount.toFixed(2)}

Payment Details:
Payment Method: ${emailData.paymentMethod.replace('_', ' ').toUpperCase()}
Amount: £${emailData.totalAmount.toFixed(2)}
Date: ${emailData.orderDate}
Error: ${emailData.errorMessage}

${emailData.items && emailData.items.length > 0 ? `
Order Summary:
${emailData.items.map(item => `- ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}`).join('\n')}
Total: £${emailData.totalAmount.toFixed(2)}
` : ''}

What You Can Do:
- Check your payment method: Ensure your card details are correct and your card has sufficient funds
- Try again: You can retry the payment by going back to checkout
- Use a different payment method: Consider using Cash on Delivery if available
- Contact your bank: Sometimes banks block transactions for security reasons

Common Reasons for Payment Failure:
- Insufficient funds in your account
- Incorrect card details (expiry date, CVV, or card number)
- Card has expired or been cancelled
- Bank security restrictions
- Network or connection issues

Need Help? If you continue to experience issues, please contact us at ${getFromEmail()} and we'll be happy to assist you.

Your order has not been placed. No charges have been made to your account.

Thank you for your interest in Alkemmy!

© 2024 Alkemmy. All rights reserved.
  `;
}

function getStatusInfo(status: string): { icon: string; color: string; text: string } {
  const statusMap: { [key: string]: { icon: string; color: string; text: string } } = {
    pending: { icon: '⏳', color: '#f59e0b', text: 'Pending' },
    processing: { icon: '⚙️', color: '#3b82f6', text: 'Processing' },
    shipped: { icon: '📦', color: '#10b981', text: 'Shipped' },
    delivered: { icon: '✅', color: '#059669', text: 'Delivered' },
    cancelled: { icon: '❌', color: '#dc2626', text: 'Cancelled' }
  };
  return statusMap[status] || { icon: '📋', color: '#6b7280', text: status };
}

function getStatusIcon(status: string): string {
  return getStatusInfo(status).icon;
}

function getNextStepsContent(status: string): string {
  switch (status) {
    case 'processing':
      return `
        <ul>
          <li>We're preparing your order for dispatch</li>
          <li>You'll receive a shipping confirmation when dispatched</li>
          <li>Your order will arrive within 3-5 business days</li>
        </ul>
      `;
    case 'shipped':
      return `
        <ul>
          <li>Your order is on its way to you</li>
          <li>Track your package using the tracking number provided</li>
          <li>Expected delivery within 3-5 business days</li>
        </ul>
      `;
    case 'delivered':
      return `
        <ul>
          <li>Your order has been successfully delivered</li>
          <li>Please check your products and let us know if you have any issues</li>
          <li>We hope you enjoy your Alkemmy products!</li>
        </ul>
      `;
    case 'cancelled':
      return `
        <ul>
          <li>Your order has been cancelled</li>
          <li>If you were charged, a refund will be processed within 5-7 business days</li>
          <li>Please contact us if you have any questions</li>
        </ul>
      `;
    default:
      return `
        <ul>
          <li>We'll keep you updated on your order status</li>
          <li>You can check your order status anytime in your profile</li>
          <li>Contact us if you have any questions</li>
        </ul>
      `;
  }
}

// Password Reset Code Email
export interface PasswordResetCodeEmail {
  email: string;
  code: string;
}

export async function sendPasswordResetCodeEmail(emailData: PasswordResetCodeEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `Password Reset Code | Alkemmy`;
    const htmlBody = generatePasswordResetCodeHTML(emailData);
    const textBody = generatePasswordResetCodeText(emailData);

    await transporter.sendMail({
      from: getFromEmail(),
      to: emailData.email,
      subject: subject,
      html: htmlBody,
      text: textBody
    });

    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.email,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'password_reset',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store password reset email in database:', dbError);
    }
    console.log('✅ Password reset code email sent to:', emailData.email);
  } catch (error) {
    console.error('❌ Failed to send password reset code email:', error);
    throw error;
  }
}

function generatePasswordResetCodeHTML(emailData: PasswordResetCodeEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Code | Alkemmy</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #D4AF37;">
            <h1 style="margin: 0; color: #000000; font-size: 28px;">Alkemmy</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
              <tr>
                <td>
                  <h2 style="color: #000000; margin-top: 0;">Password Reset Code</h2>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                    You requested to reset your password. Use the code below to verify your identity:
                  </p>
                  <div style="background-color: #F4EBD0; border: 2px solid #D4AF37; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 2px;">Your Reset Code</p>
                    <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #000000; letter-spacing: 8px;">${emailData.code}</p>
                  </div>
                  <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                    <strong>This code will expire in 15 minutes.</strong>
                  </p>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                  </p>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    For security reasons, never share this code with anyone. Alkemmy staff will never ask for your reset code.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f4f4f4; color: #666666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Alkemmy. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated email. Please do not reply.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generatePasswordResetCodeText(emailData: PasswordResetCodeEmail): string {
  return `
Password Reset Code | Alkemmy

You requested to reset your password. Use the code below to verify your identity:

Your Reset Code: ${emailData.code}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, never share this code with anyone. Alkemmy staff will never ask for your reset code.

© 2024 Alkemmy. All rights reserved.
This is an automated email. Please do not reply.
  `;
}

// Contact Form Email
export interface ContactFormEmail {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormEmail(emailData: ContactFormEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `Thank You for Contacting Alkemmy - ${emailData.subject}`;
    const htmlBody = generateContactFormConfirmationHTML(emailData);
    const textBody = generateContactFormConfirmationText(emailData);

    await transporter.sendMail({
      from: getFromEmail(),
      to: emailData.email,
      subject: subject,
      html: htmlBody,
      text: textBody
    });

    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: emailData.email,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'contact_confirmation',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store contact confirmation email in database:', dbError);
    }
    console.log('✅ Contact confirmation email sent to:', emailData.email);
  } catch (error) {
    console.error('❌ Failed to send contact confirmation email:', error);
    throw error;
  }
}

export async function sendContactFormAdminNotification(emailData: ContactFormEmail): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const subject = `New Contact Form Submission: ${emailData.subject} | Alkemmy`;
    const htmlBody = generateContactFormAdminHTML(emailData);
    const textBody = generateContactFormAdminText(emailData);

    // Send to admin email
    const adminEmail = getAdminEmail();

    await transporter.sendMail({
      from: getFromEmail(),
      to: adminEmail,
      subject: subject,
      html: htmlBody,
      text: textBody,
      replyTo: emailData.email // So admin can reply directly
    });

    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: adminEmail,
          from_email: getFromEmail(),
          subject: subject,
          body: textBody,
          email_type: 'contact_notification',
          status: 'sent'
        });
    } catch (dbError) {
      console.error('❌ Failed to store contact notification email in database:', dbError);
    }
    console.log('✅ Contact notification email sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Failed to send contact notification email:', error);
    throw error;
  }
}

function generateContactFormConfirmationHTML(emailData: ContactFormEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Alkemmy</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #D4AF37;">
            <h1 style="margin: 0; color: #000000; font-size: 28px;">Alkemmy</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
              <tr>
                <td>
                  <h2 style="color: #000000; margin-top: 0;">Thank You for Contacting Us!</h2>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                    Hi ${emailData.name},
                  </p>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                    We've received your message and appreciate you taking the time to reach out to us.
                  </p>
                  <div style="background-color: #F4EBD0; border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Your Message</p>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333; font-weight: bold;">Subject: ${emailData.subject}</p>
                    <p style="margin: 0; font-size: 14px; color: #333333; white-space: pre-wrap;">${emailData.message}</p>
                  </div>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                    Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.
                  </p>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                    If your inquiry is urgent, please feel free to call us at +44 20 1234 5678 or email us directly at hello@alkhemmy.com.
                  </p>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    Best regards,<br>
                    The Alkemmy Team
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f4f4f4; color: #666666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Alkemmy. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated confirmation email.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateContactFormConfirmationText(emailData: ContactFormEmail): string {
  return `
Thank You for Contacting Alkemmy

Hi ${emailData.name},

We've received your message and appreciate you taking the time to reach out to us.

Your Message:
Subject: ${emailData.subject}
${emailData.message}

Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.

If your inquiry is urgent, please feel free to call us at +44 20 1234 5678 or email us directly at hello@alkhemmy.com.

Best regards,
The Alkemmy Team

© 2024 Alkemmy. All rights reserved.
This is an automated confirmation email.
  `;
}

function generateContactFormAdminHTML(emailData: ContactFormEmail): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission | Alkemmy</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #D4AF37;">
            <h1 style="margin: 0; color: #000000; font-size: 28px;">Alkemmy - New Contact</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
              <tr>
                <td>
                  <h2 style="color: #000000; margin-top: 0;">New Contact Form Submission</h2>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                    You have received a new message through the Alkemmy contact form.
                  </p>
                  <div style="background-color: #F4EBD0; border: 2px solid #D4AF37; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333; width: 120px;">Name:</td>
                        <td style="padding: 8px 0; color: #333333;">${emailData.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Email:</td>
                        <td style="padding: 8px 0; color: #333333;">
                          <a href="mailto:${emailData.email}" style="color: #D4AF37; text-decoration: none;">${emailData.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Subject:</td>
                        <td style="padding: 8px 0; color: #333333;">${emailData.subject}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333; vertical-align: top;">Message:</td>
                        <td style="padding: 8px 0; color: #333333; white-space: pre-wrap;">${emailData.message}</td>
                      </tr>
                    </table>
                  </div>
                  <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      <strong>Quick Actions:</strong><br>
                      • Reply directly to this email to respond to ${emailData.name}<br>
                      • View all contact messages in the admin dashboard
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f4f4f4; color: #666666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Alkemmy. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateContactFormAdminText(emailData: ContactFormEmail): string {
  return `
New Contact Form Submission | Alkemmy

You have received a new message through the Alkemmy contact form.

Contact Details:
Name: ${emailData.name}
Email: ${emailData.email}
Subject: ${emailData.subject}

Message:
${emailData.message}

Quick Actions:
• Reply directly to this email to respond to ${emailData.name}
• View all contact messages in the admin dashboard

© 2024 Alkemmy. All rights reserved.
  `;
}
