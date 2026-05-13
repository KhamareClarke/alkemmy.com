import 'server-only';
import { adminSupabase } from '@/lib/admin-supabase';

export type InventoryMovementType =
  | 'receive'
  | 'reserve'
  | 'release'
  | 'ship'
  | 'adjust'
  | 'transfer_in'
  | 'transfer_out';

async function getDefaultWarehouseId(): Promise<string | null> {
  const { data, error } = await adminSupabase
    .from('warehouses')
    .select('id')
    .eq('is_default', true)
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    const { data: anyWh } = await adminSupabase.from('warehouses').select('id').limit(1).maybeSingle();
    return anyWh?.id ?? null;
  }
  return data.id;
}

async function logMovement(
  warehouseId: string,
  productId: string,
  variantId: string | null | undefined,
  quantityDelta: number,
  movementType: InventoryMovementType,
  referenceType: string,
  referenceId: string
): Promise<void> {
  await adminSupabase.from('inventory_movements').insert({
    warehouse_id: warehouseId,
    product_id: productId,
    variant_id: variantId ?? null,
    quantity_delta: quantityDelta,
    movement_type: movementType,
    reference_type: referenceType,
    reference_id: referenceId,
  });
}

async function fetchStockRow<T extends Record<string, unknown>>(
  warehouseId: string,
  productId: string,
  variantId: string | null,
  cols: string
): Promise<{ data: T | null }> {
  let q = adminSupabase
    .from('inventory_stock')
    .select(cols)
    .eq('warehouse_id', warehouseId)
    .eq('product_id', productId);
  q = variantId ? q.eq('variant_id', variantId) : q.is('variant_id', null);
  const { data, error } = await q.maybeSingle();
  if (error) {
    console.error('[inventory] fetch row:', error.message);
    return { data: null };
  }
  return { data: data != null ? (data as unknown as T) : null };
}

export async function reserveInventoryForOrder(
  orderId: string,
  lines: { product_id: string; quantity: number; variant_id?: string }[]
): Promise<void> {
  const whId = await getDefaultWarehouseId();
  if (!whId) return;

  for (const line of lines) {
    const pid = line.product_id;
    const vid = line.variant_id ?? null;
    const qty = line.quantity;
    const { data: row } = await fetchStockRow<{ id: string; quantity_on_hand: number; quantity_reserved: number }>(
      whId,
      pid,
      vid,
      'id, quantity_on_hand, quantity_reserved'
    );

    if (!row) continue;
    const available = row.quantity_on_hand - row.quantity_reserved;
    if (available < qty) {
      console.warn(`[inventory] insufficient to reserve order=${orderId} product=${pid} need=${qty} avail=${available}`);
      continue;
    }
    await adminSupabase
      .from('inventory_stock')
      .update({
        quantity_reserved: row.quantity_reserved + qty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    await logMovement(whId, pid, vid, qty, 'reserve', 'order', orderId);
  }
}

export async function releaseReservationForOrder(
  orderId: string,
  lines: { product_id: string; quantity: number; variant_id?: string }[]
): Promise<void> {
  const whId = await getDefaultWarehouseId();
  if (!whId) return;

  for (const line of lines) {
    const pid = line.product_id;
    const vid = line.variant_id ?? null;
    const qty = line.quantity;
    const { data: row } = await fetchStockRow<{ id: string; quantity_reserved: number }>(
      whId,
      pid,
      vid,
      'id, quantity_reserved'
    );
    if (!row) continue;
    const next = Math.max(0, row.quantity_reserved - qty);
    await adminSupabase
      .from('inventory_stock')
      .update({ quantity_reserved: next, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    await logMovement(whId, pid, vid, -qty, 'release', 'order', orderId);
  }
}

/** After ship: decrement on_hand and reserved. */
export async function confirmShipmentForOrder(
  orderId: string,
  lines: { product_id: string; quantity: number; variant_id?: string }[]
): Promise<void> {
  const whId = await getDefaultWarehouseId();
  if (!whId) return;

  for (const line of lines) {
    const pid = line.product_id;
    const vid = line.variant_id ?? null;
    const qty = line.quantity;
    const { data: row } = await fetchStockRow<{ id: string; quantity_on_hand: number; quantity_reserved: number }>(
      whId,
      pid,
      vid,
      'id, quantity_on_hand, quantity_reserved'
    );
    if (!row) continue;
    const reserved = Math.min(qty, row.quantity_reserved);
    const shipQty = qty;
    await adminSupabase
      .from('inventory_stock')
      .update({
        quantity_on_hand: Math.max(0, row.quantity_on_hand - shipQty),
        quantity_reserved: Math.max(0, row.quantity_reserved - reserved),
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    await logMovement(whId, pid, vid, -shipQty, 'ship', 'order', orderId);
  }
}

export async function listLowStockSkus(warehouseId?: string): Promise<
  { product_id: string; variant_id: string | null; available: number; reorder_point: number }[]
> {
  const whId = warehouseId ?? (await getDefaultWarehouseId());
  if (!whId) return [];

  const { data, error } = await adminSupabase
    .from('inventory_stock')
    .select('product_id, variant_id, quantity_on_hand, quantity_reserved, reorder_point, auto_reorder_enabled')
    .eq('warehouse_id', whId);
  if (error || !data) return [];

  return data
    .filter(
      (r: {
        quantity_on_hand: number;
        quantity_reserved: number;
        reorder_point: number;
        auto_reorder_enabled: boolean;
      }) =>
        r.quantity_on_hand - r.quantity_reserved <= r.reorder_point && r.auto_reorder_enabled
    )
    .map((r: { product_id: string; variant_id: string | null; quantity_on_hand: number; quantity_reserved: number; reorder_point: number }) => ({
      product_id: r.product_id,
      variant_id: r.variant_id,
      available: r.quantity_on_hand - r.quantity_reserved,
      reorder_point: r.reorder_point,
    }));
}

/** Placeholder hook for procurement automation (email/purchase order). */
export async function suggestAutoReorderLines(warehouseId?: string) {
  return listLowStockSkus(warehouseId);
}
