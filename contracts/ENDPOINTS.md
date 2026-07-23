# Storefront endpoints — quick reference

Base: `{API_BASE}/shop/api/` unless noted. **All shop routes need `X-Partner-Id` and `Session-Id` for cart flows.**

Payment capture: `{API_BASE}/payments/` — **not** under `shop/api`.

| Method | Path | Bearer | Purpose |
|--------|------|--------|---------|
| GET | `/partners/{PARTNER_ID}/` | Opt | Partner profile |
| GET | `/partners/{PARTNER_ID}/categories/` | Opt | Homepage + menu categories |
| GET | `/ranges/` | Opt | Public product groups (requires partner scope) |
| GET | `/ranges/{id}/` | Opt | Product group detail + images |
| GET | `/products/` | Opt | Product list (paginated; optional `?range=`) |
| GET | `/products/{id}/` | Opt | Product detail |
| GET | `/basket/` | Opt | Current basket; `?payment_method_code=&shipping_method_code=` |
| POST | `/basket/add-product/` | Opt | Add line; `?partner=` optional |
| PATCH | `/baskets/{id}/lines/{line_id}/` | Opt | Update quantity |
| DELETE | `/baskets/{id}/lines/{line_id}/` | Opt | Remove line |
| POST | `/basket/add-voucher/` | Opt | Apply promo code (`vouchercode`); then `GET /basket/` for discounts |
| POST | `/basket/shipping-methods/` | Opt | Quote shipping |
| GET | `/user-addresses/` | **Req** | List saved addresses |
| POST | `/user-addresses/` | **Req** | Create address |
| GET | `/checkout/payment-methods/available/` | Opt | Methods for basket; `?partner=` |
| POST | `/checkout/` | Opt* | Place order |
| GET | `/checkout/payment-states/{order_id}/` | **Req** | Lightweight payment poll |
| GET | `/orders/` | **Req** | Order history |
| GET | `/orders/{id}/` | **Req** | Order detail |
| GET | `/orders/{id}/receipt/` | **Req** | Receipt |
| GET | `/start-session/` | **Req** | Merge anon basket after login |
| POST | `/checkout/complete-deferred-payment/` | Staff | **Not for storefront** |

| Method | Path (payments root) | Bearer | Purpose |
|--------|----------------------|--------|---------|
| POST | `/payments/process/{reference}/` | Opt | Capture / STK / redirect |

### OIDC (separate host)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/.well-known/openid-configuration` | Discovery |
| GET | `/authorize/` | PKCE login |
| POST | `/token/` | Code / refresh exchange |
| GET | `/userinfo/` | Profile |

### Auth service (on API host)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/auth/api/user/` | User profile for account UI |

\*Guest checkout when deployment allows.

### Query parameters (lists)

`page` (default 1), `size` (default 15, max 10000). See [CATALOG.md](CATALOG.md) and [docs/storefront-integration.md Appendix A](../docs/storefront-integration.md#appendix-a-catalog-query-parameters).

### Payment method codes (examples)

`cash`, `mpesa`, `wallet`, `selcom`, `safaricom`, `tigo_pesa`, `airtel_money`, `snippe_mobile`, `snippe_card`, `clickpesa_mobile`, `clickpesa_card`

Checkout key = `method_type`; `variant` = `code`.
