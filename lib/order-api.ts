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

export interface OrderDiscountMeta {
  discountCodeId: string
  discountCode: string
  discountAmount: number
}

// Create order in database
export async function createOrder(
  orderData: OrderData,
  cartItems: CartItem[],
  userId?: string,
  paymentIntentId?: string,
  discount?: OrderDiscountMeta | null
): Promise<{ order: Order; orderItems: OrderItem[] }> {
  try {
    const orderNumber = generateOrderNumber();
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 4.99;
    const finalTotal = subtotal + shipping;

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
    const orderNotes = orderData.paymentMethod === 'cash_on_delivery' 
      ? 'Cash on delivery order' 
      : orderData.paymentMethod === 'paypal' 
        ? 'PayPal payment order' 
        : paymentIntentId 
          ? `Stripe payment order - Payment Intent ID: ${paymentIntentId}`
          : 'Stripe payment order';

    const orderDataToInsert: any = {
      user_id: userId || null,
      order_number: orderNumber,
      status: 'pending',
      total_amount: finalTotal,
      shipping_address_id: shippingAddress.id,
      billing_address_id: billingAddressId,
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      notes: orderNotes,
    };

    if (discount && discount.discountAmount > 0) {
      orderDataToInsert.discount_code_id = discount.discountCodeId;
      orderDataToInsert.discount_code = discount.discountCode;
      orderDataToInsert.discount_amount = discount.discountAmount;
    }

    // Add payment_intent_id if provided and column exists
    if (paymentIntentId) {
      try {
        orderDataToInsert.payment_intent_id = paymentIntentId;
      } catch (e) {
        // Column might not exist, that's okay - it's in notes
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderDataToInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = cartItems.map(item => {
      const base: Record<string, unknown> = {
        order_id: order.id,
        product_id: String(item.id).split('::')[0],
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
      };
      const vid = (item as CartItem & { variantId?: string }).variantId;
      const vlabel = (item as CartItem & { variantLabel?: string }).variantLabel;
      if (vid) base.variant_id = vid;
      if (vlabel) base.variant_label = vlabel;
      return base;
    });

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (itemsError) throw itemsError;

    void import('@/lib/cdp/order-hooks')
      .then((m) =>
        m.onOrderCreated({
          userId: userId ?? null,
          orderId: order.id,
          orderNumber,
          total: finalTotal,
          guestEmail: orderData.shippingAddress.email,
          items: orderItemsData.map((it: Record<string, unknown>) => ({
            product_id: String(it.product_id),
            quantity: Number(it.quantity) || 0,
            variant_id: it.variant_id ? String(it.variant_id) : undefined,
          })),
        })
      )
      .catch((e) => console.error('[cdp] onOrderCreated', e));

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
    const updateData: any = {
      payment_status: paymentStatus,
      status: paymentStatus === 'paid' ? 'processing' : 'pending',
      updated_at: new Date().toISOString(),
    };

    // Store payment_intent_id if provided (column may or may not exist)
    if (paymentIntentId) {
      // Try to update payment_intent_id column if it exists
      try {
        updateData.payment_intent_id = paymentIntentId;
      } catch (e) {
        // If column doesn't exist, store in notes
        const { data: order } = await supabase
          .from('orders')
          .select('notes')
          .eq('id', orderId)
          .single();
        
        if (order) {
          const existingNotes = order.notes || '';
          updateData.notes = existingNotes 
            ? `${existingNotes}\nPayment Intent ID: ${paymentIntentId}`
            : `Payment Intent ID: ${paymentIntentId}`;
        }
      }
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;

    if (paymentStatus === 'paid') {
      const { data: paidOrder } = await supabase
        .from('orders')
        .select('user_id, total_amount')
        .eq('id', orderId)
        .maybeSingle();
      if (paidOrder?.user_id) {
        void import('@/lib/cdp/order-hooks')
          .then((m) =>
            m.onOrderPaymentPaid({
              userId: paidOrder.user_id as string,
              orderId,
              orderTotal: Number(paidOrder.total_amount) || 0,
            })
          )
          .catch((e) => console.error('[cdp] onOrderPaymentPaid', e));
      }
    }
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

