import { describe, expect, it } from 'vitest';
import { render } from '@/lib/email/templates/order_confirmation';

describe('order_confirmation email', () => {
  it('renders subject and personalization', () => {
    const out = render({ to: 'a@b.com', firstName: 'Sam' });
    expect(out.subject).toContain('Order confirmed');
    expect(out.html).toContain('Hi Sam');
    expect(out.text).toContain('Hi Sam');
  });
});
