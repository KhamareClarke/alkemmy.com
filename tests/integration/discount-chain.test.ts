import { describe, expect, it } from 'vitest';
import { validateDiscountCodeRow } from '@/lib/discounts/validate-code';
import { applyDiscountToCartLines } from '@/lib/discounts/apply-discount';
import type { CartLineForDiscount, DiscountCodeRow } from '@/lib/discounts/types';

const row: DiscountCodeRow = {
  id: 'x',
  code: 'HALF',
  type: 'percentage',
  value: 50,
  max_uses: null,
  current_uses: 0,
  expiry_date: null,
  applicable_categories: null,
  minimum_order_amount: 0,
  status: 'active',
  created_at: new Date().toISOString(),
  created_by: null,
};

describe('discount integration (pure)', () => {
  it('validate then apply matches discounted subtotal', () => {
    const lines: CartLineForDiscount[] = [
      { id: '1', name: 'Soap', price: 20, quantity: 1, category: 'soap' },
    ];
    const subtotal = 20;
    const v = validateDiscountCodeRow(row, subtotal, ['soap']);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const priced = applyDiscountToCartLines(lines, v.result);
    const after = priced.reduce((s, l) => s + l.adjustedUnitPrice * l.quantity, 0);
    expect(after).toBeCloseTo(v.result.discountedSubtotal, 2);
  });
});
