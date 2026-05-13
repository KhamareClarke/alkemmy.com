import { describe, expect, it } from 'vitest';
import { validateDiscountCodeRow } from '@/lib/discounts/validate-code';
import type { DiscountCodeRow } from '@/lib/discounts/types';

const baseRow = (over: Partial<DiscountCodeRow> = {}): DiscountCodeRow => ({
  id: '1',
  code: 'SAVE10',
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
  ...over,
});

describe('validateDiscountCodeRow', () => {
  it('rejects inactive', () => {
    const r = validateDiscountCodeRow(baseRow({ status: 'inactive' }), 100, ['soap']);
    expect(r.ok).toBe(false);
  });

  it('rejects expired', () => {
    const r = validateDiscountCodeRow(baseRow({ expiry_date: '2000-01-01T00:00:00Z' }), 100, ['soap']);
    expect(r.ok).toBe(false);
  });

  it('rejects category mismatch', () => {
    const r = validateDiscountCodeRow(baseRow({ applicable_categories: ['oils'] }), 100, ['soap']);
    expect(r.ok).toBe(false);
  });

  it('accepts percentage and computes amount', () => {
    const r = validateDiscountCodeRow(baseRow({ type: 'percentage', value: 10 }), 100, ['soap']);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.discountAmount).toBe(10);
      expect(r.result.discountedSubtotal).toBe(90);
    }
  });

  it('caps fixed discount at subtotal', () => {
    const r = validateDiscountCodeRow(baseRow({ type: 'fixed', value: 999 }), 50, ['soap']);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.discountAmount).toBe(50);
      expect(r.result.discountedSubtotal).toBe(0);
    }
  });
});
