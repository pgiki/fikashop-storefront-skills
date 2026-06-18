# Storefront production

From [docs/storefront-integration.md Appendix E](../docs/storefront-integration.md#appendix-e-production-considerations). Troubleshooting: [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md).

| Topic | Guidance |
|-------|----------|
| **CORS** | Confirm allowed origins with operator; browser storefronts need API to accept your site origin. |
| **Rate limits** | Shop catalog/basket/checkout: no default app throttling. Digital download refresh ~30/min per user. Use pagination. |
| **Session-Id** | Required for cart. Persist locally; never rotate UUID on login. |
| **Checkout retries** | No idempotency key — disable double-submit; verify order exists before retry. |
| **Payment polling** | Prefer `GET …/checkout/payment-states/{id}/`; fallback `GET /orders/{id}/`. Poll 2–5s for async gateways. |
| **Webhooks** | `POST /payments/webhook/{variant}/` is server-side only. Storefronts poll order state. |
| **reCAPTCHA** | Some deployments: `API_CHECKOUT_CAPTCHA` requires `recaptcha` in checkout body — confirm with operator. |
| **Cash / COD** | Storefront cannot call `complete-deferred-payment`. Show confirmation; digital goods unlock after staff collection. |
| **Secrets** | No `client_secret` in SPA bundles; use PKCE public clients. |
| **TLS** | Always `https://` for `{API_BASE}` and `{OIDC_ISS}`. |

## Payment capture checklist

- [ ] Use `payments[].reference` from order, not order id
- [ ] POST to `{API_BASE}/payments/process/{reference}/` (not `shop/api`)
- [ ] Handle `redirect` status for card/hosted checkout
- [ ] Poll until terminal success or show pending + retry from order history
- [ ] Prefill `input_fields` from shipping address and user profile

## Checkout checklist

- [ ] `X-Partner-Id` on checkout and payment-methods
- [ ] `Session-Id` on checkout
- [ ] `shipping_address.country` is ISO-2
- [ ] `location.coordinates` = `[lng, lat]`
- [ ] Payment key = `method_type`, `variant` = `code`
- [ ] Disable submit button during `POST /checkout/`

## Reference deployment

| Item | Value |
|------|-------|
| Production API | `https://api.fikachu.com` |
| Demo partner | `X-Partner-Id: 1` (Demo Kitchen) |
| Local API | `http://127.0.0.1:8076` |
| OpenAPI | `{API_BASE}/docs/` |
