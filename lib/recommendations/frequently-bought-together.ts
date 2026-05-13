import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';
import { getAllProducts } from '@/lib/products';
import type { Product } from '@/lib/supabase';

export async function getFrequentlyBoughtTogether(productId: string, limit = 6): Promise<Product[]> {
  const { data: rows, error } = await adminSupabase
    .from('order_items')
    .select('order_id')
    .eq('product_id', productId);

  if (error || !rows?.length) return [];

  const orderIds = Array.from(new Set(rows.map((r: { order_id: string }) => r.order_id)));
  if (!orderIds.length) return [];

  const { data: pairRows } = await adminSupabase
    .from('order_items')
    .select('product_id')
    .in('order_id', orderIds)
    .neq('product_id', productId);

  const freq = new Map<string, number>();
  for (const r of pairRows || []) {
    const id = String((r as { product_id: string }).product_id);
    freq.set(id, (freq.get(id) || 0) + 1);
  }

  const topIds = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (!topIds.length) return [];

  const catalog = await getAllProducts({ in_stock: true });
  const map = new Map(catalog.map((p) => [p.id, p]));
  return topIds.map((id) => map.get(id)).filter(Boolean) as Product[];
}
