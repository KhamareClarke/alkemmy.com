import { supabase } from './supabase';
import type { Order } from './order-types';

/** Client-safe order reads (no `server-only` CDP hooks). */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        shipping_address:addresses!shipping_address_id(*),
        billing_address:addresses!billing_address_id(*),
        order_items(*)
      `
      )
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        shipping_address:addresses!shipping_address_id(*),
        billing_address:addresses!billing_address_id(*),
        order_items(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}
