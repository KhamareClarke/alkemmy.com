import { describe, expect, it } from 'vitest';
import { applyDiscountToCartLines } from '@/lib/discounts/apply-discount';
import type { CartLineForDiscount, DiscountCodeRow } from '@/lib/discounts/types';

const row: DiscountCodeRow = {
  id: '1',
  code: 'X',
  type: 'percentage',
  value: 10,
  max_uses: null,
  current_uses: 0,
  expiry_date: null,
  applicable_categories: null,
  minimum_order_amount: 0,
  status: 'active',
  created_at: new Date().toISOString(),
  created_by: null,
};

describe('applyDiscountToCartLines', () => {
  it('allocates discount across lines', () => {
    const lines: CartLineForDiscount[] = [
      { id: 'a', name: 'A', price: 10, quantity: 2, category: 'soap' },
      { id: 'b', name: 'B', price: 5, quantity: 2, category: 'soap' },
    ];
    const validated = {
      codeRow: row,
      discountedSubtotal: 27,
      discountAmount: 3,
    } as import('@/lib/discounts/types').ValidatedDiscount;
    const out = applyDiscountToCartLines(lines, validated);
    const sum = out.reduce((s, l) => s + l.adjustedUnitPrice * l.quantity, 0);
    expect(sum).toBeCloseTo(27, 1);
  });
});
