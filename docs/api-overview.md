# API & platform modules (overview)

| Area | Path | Notes |
|------|------|--------|
| Discount validation | `lib/discounts/validate-code.ts` | Pure `validateDiscountCodeRow` |
| Checkout discount | `lib/discounts/resolve-checkout-discount.ts` | Server; uses Supabase |
| Omnichannel inventory | `lib/omnichannel/` | Shopify REST; Amazon/eBay stubs |
| CLV heuristic | `lib/clv/predict.ts` | `predictCustomerLTV(userId)` |
| Subscriptions | `lib/subscriptions/service.ts` | Cron: `/api/cron/subscription-billing` |
| CDP / journey | `lib/cdp/` | Service-role tables |
| HubSpot | `lib/crm/hubspot.ts` | Contacts + deals |

Add JSDoc on public exports where behavior is non-obvious.
