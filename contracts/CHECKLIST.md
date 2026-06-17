# Quick-start checklist

Integrator QA list before go-live. Detailed steps: [docs/storefront-integration.md §13](../docs/storefront-integration.md#13-quick-start-checklist).

- [ ] Obtain `{PARTNER_ID}` from FikaChu provisioning
- [ ] Configure env: `API_BASE`, OIDC client, `PARTNER_ID`, default country ([GETTING-STARTED.md](../docs/GETTING-STARTED.md))
- [ ] Bootstrap HTTP client: `X-Partner-Id`, persisted `Session-Id: SID:ANON:{hostname}:{uuid}`, 401 refresh
- [ ] Store home: `GET /shop/api/partners/{PARTNER_ID}/categories/`; enforce `is_open` and `min_order_amount`
- [ ] Menu: `GET /products/` → detail → `POST /basket/add-product/` with `options` / `modifier_groups`
- [ ] Delivery address (local + coordinates); `POST /basket/shipping-methods/`
- [ ] Checkout: `GET …/payment-methods/available/`; login before submit (recommended)
- [ ] `POST /shop/api/checkout/` with full `shipping_address` (+ optional `user_address`)
- [ ] If `order.payments.length > 0`: `GET /orders/{id}/` → `POST /payments/process/{reference}/` with `action: capture`
- [ ] Poll order until payment succeeds; confirmation + optional `GET …/receipt/?return_format=pdf`
- [ ] Digital products: [DIGITAL-ASSETS.md](DIGITAL-ASSETS.md)
- [ ] Review [PRODUCTION.md](PRODUCTION.md) (CORS, polling, captcha, secrets)
- [ ] Map screens to reference client: [reference-client-map.md](../docs/reference-client-map.md)

## Smoke test (curl)

See [docs/examples/curl/smoke-test.sh](../docs/examples/curl/smoke-test.sh).
