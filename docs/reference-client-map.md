# Reference implementation map

Screen-to-API map for a typical storefront client (web or mobile). Use this with [storefront-integration.md](storefront-integration.md) and the [contracts/](../contracts/) fast path — no external repo access required.

## Customer journey

| Phase | Screen / route | Client module | Key endpoints | Example |
| ----- | -------------- | ------------- | ------------- | ------- |
| Bootstrap | Splash / app init | `Config`, `HttpClient`, `AuthStore` | Persist `Session-Id`; optional `GET /auth/api/user/` | [client-setup.ts](examples/client-setup.ts) |
| Store home | `/` or partner menu | `PartnerHomeScreen`, `CatalogStore` | `GET /partners/{PARTNER_ID}/categories/` | [curl/add-to-cart.sh](examples/curl/add-to-cart.sh) |
| Product | Product detail modal/page | `ProductDetailScreen` | `GET /products/{id}/` | [product-detail-modifiers.json](../contracts/fixtures/product-detail-modifiers.json) |
| Cart | `/cart` | `CartScreen`, `BasketStore` | `GET /basket/`, `PATCH`/`DELETE` lines | [add-to-cart.ts](examples/add-to-cart.ts) |
| Address | Address picker / landing | `AddressScreen`, `CheckoutStore` | Client geocode; `POST /basket/shipping-methods/` | [INTEGRATION.md §4](../contracts/INTEGRATION.md#4-shipping) |
| Checkout | `/checkout` | `CheckoutScreen`, `CheckoutStore` | `GET …/payment-methods/available/`, `POST …/checkout/` | [checkout-flow.ts](examples/checkout-flow.ts) |
| Pay | `/checkout/payment-details` | `PaymentScreen` | `GET /orders/{id}/`, `POST /payments/process/{reference}/` | [payment-capture.ts](examples/payment-capture.ts) |
| Done | `/order-placed/{id}` | `OrderConfirmationScreen`, `OrdersStore` | `GET /orders/{id}/`, optional `GET …/receipt/` | [order-receipt.json](../contracts/fixtures/order-receipt.json) |

## Section map

| Guide section | Screen / route | Client module | Key behaviors | Key endpoints | Example |
| ------------- | -------------- | ------------- | ------------- | ------------- | ------- |
| [§1.5 Bootstrap](storefront-integration.md#15-client-bootstrap-and-environment) | App init | `Config`, `HttpClient`, `AuthStore` | Set `X-Partner-Id` on every shop call; attach `Session-Id` and Bearer; 401 → refresh token | Session-Id, Bearer, `GET /auth/api/user/` | [client-setup.ts](examples/client-setup.ts) |
| [§2 Auth](storefront-integration.md#2-authentication) | Login / authorize | `AuthStore`, `AuthorizeScreen` | PKCE code exchange; keep same session UUID; `GET /shop/api/start-session/`; flip `ANON`→`AUTH` | OIDC token, `GET /shop/api/start-session/` | [oidc-pkce-flow.md](examples/oidc-pkce-flow.md) |
| [§2.9 Login gate](storefront-integration.md#29-login-gate-at-checkout-reference-app) | `/checkout` | `CheckoutScreen` | Redirect to OIDC before submit if not logged in; preserve checkout preview state | OIDC redirect with `is_preview` params | [checkout-flow.ts](examples/checkout-flow.ts) |
| [§3 Partner home](storefront-integration.md#3-partner-store-homepage) | Partner menu | `PartnerHomeScreen` | Check `partner.is_open`, `min_order_amount` | `GET /partners/{id}/categories/` | [CATALOG.md](../contracts/CATALOG.md) |
| [§4 Catalog](storefront-integration.md#4-browsing-the-menu) | Menu, product page | `CatalogStore`, `ProductDetailScreen` | Optional `is_public=true` and `?partner=` on product lists; product `id` or `url` on add-to-cart | `GET /products/`, `GET /products/{id}/` | [product-detail-modifiers.json](../contracts/fixtures/product-detail-modifiers.json) |
| [§5–6 Cart](storefront-integration.md#6-cart-management) | `/cart` | `BasketStore`, `CartScreen` | Cache basket GET ~20s unless `force` after mutation; line PATCH/DELETE use hypermedia URLs | `GET /basket/`, `POST …/add-product/`, line PATCH/DELETE | [add-to-cart.ts](examples/add-to-cart.ts) |
| [§7 Address](storefront-integration.md#7-shipping-address--methods) | Address picker | `AddressStore`, `AddressScreen` | Geocode to `[lng, lat]`; ISO-2 country; `POST …/shipping-methods/` when coords exist | `POST …/shipping-methods/`, `GET/POST /user-addresses/` | [INTEGRATION.md §4](../contracts/INTEGRATION.md#4-shipping) |
| [§8 Payment methods](storefront-integration.md#8-payment-methods) | `/checkout` | `CheckoutStore` | Validate `input_fields` from `GET …/payment-methods/available/` | `GET …/payment-methods/available/` | [PAYMENT-FIELDS.md](../contracts/PAYMENT-FIELDS.md) |
| [§9 Checkout](storefront-integration.md#9-checkout) | `/checkout` | `CheckoutScreen` | Always send `shipping_address`; add `user_address` when user picks saved address; disable double-submit | `POST /shop/api/checkout/` | [checkout-flow.ts](examples/checkout-flow.ts), [guest-checkout.ts](examples/guest-checkout.ts) |
| [§10 Pay](storefront-integration.md#10-complete-payment) | Payment details | `PaymentScreen` | Two steps: `GET /orders/{id}/` then `POST /payments/process/{ref}/`; poll payment states | `GET /orders/{id}/`, `POST /payments/process/{ref}/` | [payment-capture.ts](examples/payment-capture.ts) |
| [§11 Orders](storefront-integration.md#11-order-management) | Order history, confirmation | `OrdersStore` | Resume payment from `order.payments[].reference` | `GET /orders/`, `GET …/receipt/` | [ORDERS.md](../contracts/ORDERS.md) |
| [Digital assets](../contracts/DIGITAL-ASSETS.md) | Library / downloads | `DigitalAssetsStore` | Poll after payment authorized; use purchase-scoped asset URLs | `GET …/digital-assets/`, `GET …/orders/{id}/assets/` | [digital-assets.ts](examples/digital-assets.ts) |

## Client module responsibilities

### HttpClient / Config

- Read `API_BASE`, `PARTNER_ID`, `OIDC_ISS` from environment.
- Register request interceptor: `X-Partner-Id`, `Session-Id`, `Accept: application/json`, optional Bearer.
- Register 401 handler: refresh OIDC token, retry once.
- Optional: append `?partner={PARTNER_ID}` on basket, add-product, checkout, and payment-methods calls (header alone is enough for single-store sites).

See [client-setup.ts](examples/client-setup.ts).

### AuthStore

- Persist `Session-Id: SID:{ANON|AUTH}:{api_hostname}:{uuid}` in durable storage.
- On login: exchange PKCE code for tokens; call `GET /shop/api/start-session/` with **same UUID**; update header to `SID:AUTH:…`.
- On logout: clear tokens; generate new anon session UUID.

See [oidc-pkce-flow.md](examples/oidc-pkce-flow.md) and [AUTH-SCREENS.md](../contracts/AUTH-SCREENS.md).

### BasketStore

- `fetchBasket`: GET `/basket/`; cache ~20 seconds unless `{ force: true }` after add/update/remove.
- `addToBasket`: POST `/basket/add-product/` with product `id` or `url`; option values as **code**, numeric **id**, or URL segment.
- `updateBasketLine` / `removeFromBasket`: PATCH/DELETE line hypermedia URLs from basket response.

See [add-to-cart.ts](examples/add-to-cart.ts).

### CheckoutStore / CheckoutScreen

- On screen focus: refresh payment methods and shipping methods for current basket.
- Format `shipping_address` with ISO-2 `country` and `location.coordinates` as `[longitude, latitude]`.
- Include `user_address` id when user selects a saved address.
- `onSubmitCheckout`: POST `/shop/api/checkout/`; route to payment screen if `order.payments.length > 0`.

See [checkout-flow.ts](examples/checkout-flow.ts) and [wallet-checkout.ts](examples/wallet-checkout.ts).

### PaymentScreen

- Load order via `GET /orders/{id}/`.
- Capture via `POST {API_BASE}/payments/process/{payments[].reference}/` (not under `shop/api`).
- Poll `GET …/checkout/payment-states/{id}/` or `GET /orders/{id}/` until terminal status.

See [payment-capture.ts](examples/payment-capture.ts).

### OrdersStore

- List orders, fetch receipt URL, resume incomplete payments from `payments[].reference`.

See [ORDERS.md](../contracts/ORDERS.md).

## Optional flows (out of scope for this skill)

| Flow | Notes |
| ---- | ----- |
| Marketplace partner discovery | `GET /partners/` — skip for single branded storefront |
| Subscription wallet top-up | `POST /subscriptions/api/subscriptions/wallet-deposit/` — separate from shop checkout |
| Standalone invoicing | Invoice-backed products — coordinate with FikaChu operator |
| Partner Pay branded flow | Alternate UX; same basket/checkout APIs |
| Deferred cash settlement | `complete-deferred-payment` is staff-only |

See [OUT-OF-SCOPE.md](../contracts/OUT-OF-SCOPE.md).
