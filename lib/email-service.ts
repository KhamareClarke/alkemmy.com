// Email service for order confirmations using Nodemailer
import nodemailer from 'nodemailer';
import { adminSupabase } from './admin-supabase';

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

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'khamareclarke@gmail.com',
      pass: 'ovga hgzy rltc ifyh' // App password
    }
  });
};

export async function sendOrderConfirmationEmail(emailData: OrderConfirmationEmail): Promise<void> {
  try {
    const transporter = createTransporter();
    const subject = `Order Confirmation - ${emailData.orderNumber} | Alkemmy`;
    const htmlBody = generateOrderConfirmationHTML(emailData);
    const textBody = generateOrderConfirmationText(emailData);
    
    await transporter.sendMail({
      from: 'khamareclarke@gmail.com',
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
          from_email: 'khamareclarke@gmail.com',
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
          from_email: 'khamareclarke@gmail.com',
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
    const transporter = createTransporter();
    const subject = `New Order Received - ${orderData.orderNumber} | Alkemmy Admin`;
    const htmlBody = generateAdminNotificationHTML(orderData);
    const textBody = generateAdminNotificationText(orderData);
    
    await transporter.sendMail({
      from: 'khamareclarke@gmail.com',
      to: 'khamareclarke@gmail.com',
      subject: subject,
      html: htmlBody,
      text: textBody
    });
    
    // Store the email in database
    try {
      await adminSupabase
        .from('emails')
        .insert({
          to_email: 'khamareclarke@gmail.com',
          from_email: 'khamareclarke@gmail.com',
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

export async function sendOrderStatusUpdateEmail(emailData: OrderStatusUpdateEmail): Promise<void> {
  try {
    const transporter = createTransporter();
    const subject = `Order ${emailData.newStatus.charAt(0).toUpperCase() + emailData.newStatus.slice(1)} - ${emailData.orderNumber} | Alkemmy`;
    const htmlBody = generateOrderStatusUpdateHTML(emailData);
    const textBody = generateOrderStatusUpdateText(emailData);
    
    await transporter.sendMail({
      from: 'khamareclarke@gmail.com',
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
          from_email: 'khamareclarke@gmail.com',
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
          from_email: 'khamareclarke@gmail.com',
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
          
          <p>If you have any questions, please contact us at khamareclarke@gmail.com</p>
          
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

If you have any questions, please contact us at khamareclarke@gmail.com

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
          
          <p>If you have any questions, please contact us at khamareclarke@gmail.com</p>
          
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

If you have any questions, please contact us at khamareclarke@gmail.com

Thank you for choosing Alkemmy for your natural luxury needs!

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
