# Auth and headers by screen

Which headers to send on each storefront screen. Bearer = end-user OIDC `access_token`.

| Screen | Session-Id | Bearer | X-Partner-Id | Notes |
| ------ | ---------- | ------ | ------------ | ----- |
| Store home / menu | `SID:ANON:…` or `AUTH` | Optional | **Required** | `GET /partners/{id}/categories/` |
| Product list / detail | ANON or AUTH | Optional | **Required** | Include Session-Id if user may have cart |
| Cart | ANON or AUTH | Optional | **Required** | `?partner=` optional |
| Add / update cart | ANON or AUTH | Optional | **Required** | Session-Id **required** |
| Address picker | ANON or AUTH | Optional* | **Required** | *Bearer if saving to account |
| Shipping quote | ANON or AUTH | Optional | **Required** | `POST /basket/shipping-methods/` |
| Checkout load | AUTH recommended | **Required**† | **Required** | Payment methods + basket recalc |
| Checkout submit | AUTH† | **Required**† | **Required** | `POST /checkout/` |
| Payment capture | AUTH | **Required** | Optional on capture | `POST /payments/process/{ref}/` |
| Order list / detail | AUTH | **Required** | **Required** | Owner or staff only |
| Order receipt | AUTH | **Required** | **Required** | `GET …/receipt/` |
| Digital downloads | AUTH | **Required** | **Required** | `GET …/orders/{id}/assets/` |
| Login merge | AUTH | **Required** | **Required** | `GET /start-session/` — flip ANON→AUTH, same UUID |

† Reference mobile **always** requires login before checkout. Guest checkout is deployment-dependent (`OSCAR_ALLOW_ANON_CHECKOUT`); use `SID:ANON:…` only when your operator enables it.

## Example header sets

**Anonymous browse + cart**

```http
X-Partner-Id: 1
Session-Id: SID:ANON:api.fikachu.com:550e8400-e29b-41d4-a716-446655440000
Accept: application/json
```

**Authenticated checkout**

```http
X-Partner-Id: 1
Session-Id: SID:AUTH:api.fikachu.com:550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
Accept: application/json
```

**Payment capture** (payments root, not shop/api)

```http
X-Partner-Id: 1
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
```

Full matrix: [INTEGRATION.md § Auth](INTEGRATION.md#auth-matrix-quick) · [docs/storefront-integration.md §2.3](../docs/storefront-integration.md#23-authentication-matrix)
