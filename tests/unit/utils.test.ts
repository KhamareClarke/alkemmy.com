import { describe, expect, it } from 'vitest';
import { cn, getStockStatusText, isInStock } from '@/lib/utils';

describe('utils', () => {
  it('cn merges classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('isInStock', () => {
    expect(isInStock(true, 3)).toBe(true);
    expect(isInStock(true, 0)).toBe(false);
    expect(isInStock(false, 5)).toBe(false);
  });

  it('getStockStatusText', () => {
    expect(getStockStatusText(true, 2)).toContain('In Stock');
    expect(getStockStatusText(false, 0)).toContain('Out of Stock');
  });
});
