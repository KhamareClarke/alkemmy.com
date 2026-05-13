import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'lib/discounts/**/*.ts',
        'lib/cart/**/*.ts',
        'lib/clv/**/*.ts',
        'lib/omnichannel/**/*.ts',
        'lib/utils.ts',
        'lib/email/templates/order_confirmation.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
