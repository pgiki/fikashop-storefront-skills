# Digital assets contract

Pre- and post-purchase downloadable files for digital products. Full guide: [docs/storefront-integration.md Appendix C](../docs/storefront-integration.md#appendix-c-digital-assets--frontend-integration).

## Concepts

| Term | Meaning |
| ---- | ------- |
| **Digital product** | `is_digital: true` on product JSON |
| **Deliverable** | File attached to product — load via digital-assets endpoints |
| **Preview asset** | `is_preview: true`; short-lived `preview_download_url` before purchase |
| **Grant** | Links user to deliverable after purchase or subscription |
| `access_mode` | `one_time` (order grants) or `subscription` (library grants) |

`is_digital` tells you whether to show digital UI. File metadata always comes from dedicated endpoints.

## UI gates

| Screen | Rule |
| ------ | ---- |
| Product detail | If `is_digital`, `GET …/products/{id}/digital-assets/` |
| Cart / checkout | Same as physical — no API changes |
| Order detail | Downloads section if any `lines[].product.is_digital` **and** order is eligible |

## Pre-purchase deliverables

```http
GET /shop/api/products/{id-or-slug}/digital-assets/
X-Partner-Id: {PARTNER_ID}
```

404 if product is not digital.

| Field | UI |
| ----- | -- |
| `is_preview: true` | Badge "Preview"; open `preview_download_url` (no Bearer) |
| `is_preview: false` | "Included after purchase" |
| `preview_download_expires_at` | Re-fetch assets list when expired |

```http
GET /shop/api/digital-assets/preview/{token}/
```

## When downloads are available

Eligible when:

1. `order.status` is `payment_authorized`, `completed`, `processing`, or `shipped`, **or**
2. Any `payments[].status` is `confirmed`, `paid`, `success`, `settled`

**Not eligible:** `pending` (cash), `cancelled`, guest orders without `order.user`.

Cash COD: storefront cannot call `complete-deferred-payment` ([INTEGRATION.md §6](INTEGRATION.md#6-payment-capture)). Show "Downloads unlock after payment is confirmed."

## Post-purchase assets

```http
GET /shop/api/orders/{id-or-number}/assets/
X-Partner-Id: {PARTNER_ID}
Authorization: Bearer {ACCESS_TOKEN}
```

| Response | Meaning |
| -------- | ------- |
| `200` + `assets: []` | Unpaid, no digital lines, or guest order |
| `200` + non-empty | User may download |
| `403` | No `view_order` permission |

## Download + refresh

```http
GET /shop/api/digital-assets/download/{signed-token}/
```

Links expire in minutes. Refresh:

```http
POST /shop/api/digital-assets/assets/{asset_id}/download/
Authorization: Bearer {ACCESS_TOKEN}
```

Or re-fetch `GET …/orders/{id}/assets/`.

## Subscription digitals

```http
GET /shop/api/digital-assets/library/
Authorization: Bearer {ACCESS_TOKEN}
```

Use when `access_mode: subscription`. One-time digitals use order assets only.

## API reference

| Method | Path | Auth | Purpose |
| ------ | ---- | ---- | ------- |
| GET | `/shop/api/products/{pk}/digital-assets/` | Optional | Pre-purchase list + previews |
| GET | `/shop/api/digital-assets/preview/{token}/` | None | Stream preview |
| GET | `/shop/api/orders/{pk}/assets/` | Bearer + view_order | Purchased files |
| POST | `/shop/api/digital-assets/assets/{id}/download/` | Bearer | Refresh download URL |
| GET | `/shop/api/digital-assets/download/{token}/` | Signed token | Download bytes |
| GET | `/shop/api/digital-assets/library/` | Bearer | Subscription library |

## Frontend checklist

1. Badge on catalog when `is_digital`
2. Product detail: load deliverables; wire preview buttons
3. Checkout unchanged
4. Order detail: downloads when eligible
5. Refresh expired `download_url`
6. Cash pending: explain locked state
7. Distinguish 403 vs 200+[]

## Troubleshooting empty `assets`

| Symptom | Likely cause |
| ------- | ------------ |
| `200` + `[]`, order `pending` | Payment not authorized (common for cash) |
| `200` + `[]`, `payment_authorized` | No deliverables on product |
| `200` + `[]`, guest order | No `order.user` |
| Preview works, purchase does not | Order not authorized |

Fixture: [product-detail-digital.json](fixtures/product-detail-digital.json)
