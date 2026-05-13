import type { CartLineForDiscount, ValidatedDiscount } from './types'

export interface PricedCartLine extends CartLineForDiscount {
  adjustedUnitPrice: number
}

/**
 * Allocate discount across lines so line totals sum to `validated.discountedSubtotal`
 * (handles penny rounding vs raw percentage on subtotal).
 */
export function applyDiscountToCartLines(
  lines: CartLineForDiscount[],
  validated: ValidatedDiscount
): PricedCartLine[] {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  if (subtotal <= 0) {
    return lines.map((l) => ({ ...l, adjustedUnitPrice: l.price }))
  }

  const target = validated.discountedSubtotal
  const factor = target / subtotal

  type WithTotal = PricedCartLine & { _lineTotal: number }
  const raw: WithTotal[] = lines.map((l) => {
    const lineTotal = l.price * l.quantity
    const newLineTotal = Math.round(lineTotal * factor * 100) / 100
    const adjustedUnitPrice =
      l.quantity > 0 ? Math.round((newLineTotal / l.quantity) * 100) / 100 : l.price
    return { ...l, adjustedUnitPrice, _lineTotal: newLineTotal }
  })

  const sumNew = raw.reduce((s, l) => s + l._lineTotal, 0)
  const drift = Math.round((target - sumNew) * 100) / 100

  if (drift !== 0 && raw.length > 0) {
    const last = raw[raw.length - 1]
    const fixLineTotal = Math.round((last._lineTotal + drift) * 100) / 100
    last._lineTotal = fixLineTotal
    last.adjustedUnitPrice =
      last.quantity > 0 ? Math.round((fixLineTotal / last.quantity) * 100) / 100 : last.price
  }

  return raw.map(({ _lineTotal, ...rest }) => rest)
}
