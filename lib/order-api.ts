import { supabase } from './supabase';
import { CartItem } from './cart-context';

export interface OrderData {
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingSameAsShipping: boolean;
  paymentMethod: 'stripe' | 'paypal' | 'cash_on_delivery';
  saveAddress?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address_id: string;
  billing_address_id?: string;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  created_at: string;
}

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ALK-${timestamp}-${random}`.toUpperCase();
}

// Create order in database
export async function createOrder(
  orderData: OrderData,
  cartItems: CartItem[],
  userId?: string
): Promise<{ order: Order; orderItems: OrderItem[] }> {
  try {
    const orderNumber = generateOrderNumber();
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = totalAmount > 50 ? 0 : 4.99;
    const finalTotal = totalAmount + shipping;

    // Create shipping address
    const { data: shippingAddress, error: shippingError } = await supabase
      .from('addresses')
      .insert({
        user_id: userId || null,
        type: 'shipping',
        first_name: orderData.shippingAddress.firstName,
        last_name: orderData.shippingAddress.lastName,
        email: orderData.shippingAddress.email,
        address_line_1: orderData.shippingAddress.addressLine1,
        address_line_2: orderData.shippingAddress.addressLine2,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postal_code: orderData.shippingAddress.postalCode,
        country: orderData.shippingAddress.country,
        phone: orderData.shippingAddress.phone || '',
        is_default: orderData.saveAddress || false,
      })
      .select()
      .single();

    if (shippingError) throw shippingError;

    // Create billing address if different from shipping
    let billingAddressId = shippingAddress.id;
    if (!orderData.billingSameAsShipping && orderData.billingAddress) {
      const { data: billingAddress, error: billingError } = await supabase
        .from('addresses')
        .insert({
          user_id: userId || null,
          type: 'billing',
          first_name: orderData.billingAddress.firstName,
          last_name: orderData.billingAddress.lastName,
          email: orderData.billingAddress.email,
          address_line_1: orderData.billingAddress.addressLine1,
          address_line_2: orderData.billingAddress.addressLine2,
          city: orderData.billingAddress.city,
          state: orderData.billingAddress.state,
          postal_code: orderData.billingAddress.postalCode,
          country: orderData.billingAddress.country,
          phone: orderData.billingAddress.phone || '',
          is_default: false,
        })
        .select()
        .single();

      if (billingError) throw billingError;
      billingAddressId = billingAddress.id;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        order_number: orderNumber,
        status: 'pending',
        total_amount: finalTotal,
        shipping_address_id: shippingAddress.id,
        billing_address_id: billingAddressId,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
        notes: orderData.paymentMethod === 'cash_on_delivery' ? 'Cash on delivery order' : 
               orderData.paymentMethod === 'paypal' ? 'PayPal payment order' : 'Stripe payment order',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (itemsError) throw itemsError;

    return { order, orderItems };
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Order data:', orderData);
    console.error('Cart items:', cartItems);
    console.error('User ID:', userId);
    throw new Error(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Update order payment status
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'paid' | 'failed' | 'refunded',
  paymentIntentId?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: paymentStatus === 'paid' ? 'processing' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw new Error('Failed to update order payment status');
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        shipping_address:addresses!shipping_address_id(*),
        billing_address:addresses!billing_address_id(*),
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Get orders by user ID
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        shipping_address:addresses!shipping_address_id(*),
        billing_address:addresses!billing_address_id(*),
        order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

