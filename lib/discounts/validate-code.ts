import type { CartLineForDiscount, DiscountCodeRow, ValidatedDiscount } from './types'

function normalizeCategory(cat: string): string {
  return cat.trim().toLowerCase().replace(/\s+/g, '-')
}

/**
 * Pure validation against a loaded discount_codes row.
 * Callers must fetch the row server-side (service role) and pass subtotal from trusted cart totals.
 */
export function validateDiscountCodeRow(
  row: DiscountCodeRow | null,
  subtotal: number,
  cartCategories: string[]
): { ok: true; result: ValidatedDiscount } | { ok: false; error: string } {
  if (!row) {
    return { ok: false, error: 'Invalid or unknown discount code' }
  }

  if (row.status !== 'active') {
    return { ok: false, error: 'This discount code is not active' }
  }

  if (row.expiry_date) {
    const exp = new Date(row.expiry_date).getTime()
    if (Number.isFinite(exp) && Date.now() > exp) {
      return { ok: false, error: 'This discount code has expired' }
    }
  }

  if (row.max_uses != null && row.current_uses >= row.max_uses) {
    return { ok: false, error: 'This discount code has reached its usage limit' }
  }

  const minOrder = Number(row.minimum_order_amount ?? 0)
  if (subtotal < minOrder) {
    return {
      ok: false,
      error: `Minimum order of £${minOrder.toFixed(2)} required for this code`,
    }
  }

  const cats = row.applicable_categories?.filter(Boolean) ?? []
  if (cats.length > 0) {
    const normalizedCart = cartCategories.map(normalizeCategory)
    const normalizedAllowed = cats.map(normalizeCategory)
    const match = normalizedCart.some((c) => normalizedAllowed.includes(c))
    if (!match) {
      return { ok: false, error: 'This code does not apply to items in your cart' }
    }
  }

  const value = Number(row.value)
  if (row.type === 'percentage') {
    if (value <= 0 || value > 100) {
      return { ok: false, error: 'Invalid discount configuration' }
    }
  } else if (row.type === 'fixed') {
    if (value <= 0) {
      return { ok: false, error: 'Invalid discount configuration' }
    }
  } else {
    return { ok: false, error: 'Invalid discount type' }
  }

  let discountAmount = 0
  if (row.type === 'percentage') {
    discountAmount = Math.round(subtotal * (value / 100) * 100) / 100
  } else {
    discountAmount = Math.min(value, subtotal)
  }

  discountAmount = Math.round(discountAmount * 100) / 100
  const discountedSubtotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100)

  return {
    ok: true,
    result: {
      codeRow: row,
      discountedSubtotal,
      discountAmount,
    },
  }
}
