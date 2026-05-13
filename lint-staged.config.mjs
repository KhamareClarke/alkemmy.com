/** @type {import('lint-staged').Configuration} */
export default {
  'lib/discounts/**/*.{ts,tsx}': 'eslint --max-warnings=0',
  'lib/cart/**/*.{ts,tsx}': 'eslint --max-warnings=0',
  'lib/clv/**/*.{ts,tsx}': 'eslint --max-warnings=0',
  'lib/omnichannel/**/*.{ts,tsx}': 'eslint --max-warnings=0',
  'tests/**/*.{ts,tsx}': 'eslint --max-warnings=0',
};
