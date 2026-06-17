# Troubleshooting

Common storefront integration failures and fixes.

## Cart empty or lines disappear

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Basket always empty after add | Missing `Session-Id` header | Send `Session-Id` on **every** shop call; persist locally |
| Cart lost after login | New UUID generated on login | Keep same UUID; flip `ANON`→`AUTH`; call `GET /shop/api/start-session/` |
| Add fails silently | Wrong `X-Partner-Id` | Match the partner that stocks the product |
| Wrong store items | Multi-partner cart | Clear cart before switching `{PARTNER_ID}` |

## Session / auth errors

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| `401 Invalid token` | Expired access token | Refresh via `{OIDC_ISS}/token/`; retry once |
| `405 Not logged in` on start-session | No Bearer | Complete OIDC before `GET /shop/api/start-session/` |
| Realm mismatch / forced logout | Token from wrong issuer | Clear session; re-login against correct `OIDC_ISS` |

## Checkout `406` errors

Parse in order ([contracts/ERRORS.md](../contracts/ERRORS.md)):

1. `errors.basket[]`
2. `errors.non_field_errors[]`
3. Other field keys

Common causes: product unavailable, basket below `min_order_amount`, missing `shipping_method_code`, invalid payment block, store closed.

## Shipping quotes empty or wrong

- Include GeoJSON `location` with `[longitude, latitude]` (not lat/lng).
- Call `POST /basket/shipping-methods/` only when coordinates exist.
- Country must be ISO-2 (`"TZ"`), not a country URL.

## Payment stuck in `waiting`

1. Confirm you called `POST {API_BASE}/payments/process/{reference}/` (not under `shop/api`).
2. Use `reference` from `order.payments[]`, not order id.
3. Poll `GET /shop/api/checkout/payment-states/{order_id}/` every 2–5s for up to 2–3 minutes.
4. Handle `status: redirect` — open `redirect_url` in browser.
5. Check both HTTP status and JSON `status` field on capture errors.

Status reference: [contracts/status-map.json](../contracts/status-map.json).

## Cash on delivery — no payment screen

Expected: `order.payments` is often **empty** at checkout. Go straight to confirmation.

Storefront **cannot** call `complete-deferred-payment`. Digital downloads stay locked until staff collects payment and order reaches `payment_authorized`.

## Digital downloads empty (`200` + `assets: []`)

| Cause | Action |
| ----- | ------ |
| Order still `pending` (cash) | Show "unlocks after payment confirmed" |
| Guest order | Require login for grants |
| No deliverables on product | Partner must upload files (admin) |

See [contracts/DIGITAL-ASSETS.md](../contracts/DIGITAL-ASSETS.md).

## CORS (browser only)

Confirm your production site origin is allowed on `{API_BASE}`. Contact your FikaChu operator before go-live.

## reCAPTCHA on checkout

Some deployments require `recaptcha` in the checkout body. Confirm with your operator and `{API_BASE}/docs/`.
