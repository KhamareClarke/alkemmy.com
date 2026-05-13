import { describe, expect, it } from 'vitest';
import { cartLineTotal, computeCartTotals } from '@/lib/cart/calculations';

describe('cart calculations', () => {
  it('computes line total', () => {
    expect(cartLineTotal({ price: 9.99, quantity: 3 })).toBeCloseTo(29.97, 2);
  });

  it('aggregates cart', () => {
    const t = computeCartTotals([
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ]);
    expect(t.totalItems).toBe(3);
    expect(t.totalPrice).toBe(25);
  });
});
