# Contributing to Alkhemmy

## Development

1. Install dependencies: `npm ci`
2. Copy env: use `.env.local` with Supabase, Stripe, and other keys as required for the feature you touch.
3. Run the app: `npm run dev`

## Checks before opening a PR

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`

Pre-commit runs **lint-staged** on `lib/discounts`, `lib/cart`, `lib/clv`, `lib/omnichannel`, and `tests` only (see `lint-staged.config.mjs`).
## E2E (optional locally)

1. `npx playwright install`
2. Start dev server in another terminal: `npm run dev`
3. `npm run test:e2e`

## Database

SQL migrations live under `scripts/sql/`. Apply them in Supabase (SQL editor) in dependency order; filenames are descriptive.

## Style

- Match existing patterns in the nearest file.
- Prefer small, reviewable PRs over large mixed changes.
