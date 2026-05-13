import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';
import { getAllProducts } from '@/lib/products';
import type { Product } from '@/lib/supabase';

/** Rule-based “personalized” picks from this user’s order history. */
export async function getPersonalizedRecommendations(userId: string, limit = 8): Promise<Product[]> {
  const { data: orders } = await adminSupabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40);

  if (!orders?.length) {
    const all = await getAllProducts({ in_stock: true });
    return all.slice(0, limit);
  }

  const orderIds = orders.map((o: { id: string }) => o.id);
  const { data: items } = await adminSupabase
    .from('order_items')
    .select('product_id, product_name')
    .in('order_id', orderIds);

  const catalog = await getAllProducts({ in_stock: true });
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const freq = new Map<string, number>();
  const preferredCategories = new Set<string>();
  for (const row of items || []) {
    const id = String((row as { product_id: string }).product_id);
    freq.set(id, (freq.get(id) || 0) + 1);
    const p = byId.get(id);
    if (p) preferredCategories.add(p.category);
  }

  const scored = catalog
    .map((p) => ({ p, w: (freq.get(p.id) || 0) * 3 + (preferredCategories.has(p.category) ? 1 : 0) }))
    .sort((a, b) => b.w - a.w);

  const seen = new Set<string>();
  const out: Product[] = [];
  for (const { p } of scored) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out.length ? out : catalog.slice(0, limit);
}

/** Lightweight collaborative signal: popular among buyers of same categories as this user. */
export async function getCollaborativeRecommendations(userId: string, limit = 8): Promise<Product[]> {
  const personalized = await getPersonalizedRecommendations(userId, limit * 2);
  const cats = new Set(personalized.map((p) => p.category));
  const catalog = await getAllProducts({ in_stock: true });
  const pool = catalog.filter((p) => !personalized.some((x) => x.id === p.id) && cats.has(p.category));
  return pool.slice(0, limit);
}
