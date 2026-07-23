# Catalog contract

Product discovery for single-partner storefronts. Full examples: [docs/storefront-integration.md §4](../docs/storefront-integration.md#4-browsing-the-menu).

## Query parameters (`GET /shop/api/products/`)

| Parameter | Example | Purpose |
| --------- | ------- | ------- |
| `page` | `1` | Page number (default `1`) |
| `size` | `15` | Page size (default `15`, max `10000`) |
| `search` | `burger` | Full-text search |
| `structure` | `standalone` | Filter product structure (parent/child/bundle — see OpenAPI) |
| `partner` | `1` | Filter products stocked for this partner |
| `is_public` | `true` | Public catalog only |
| `categories__id` | `10` | Filter by category id |
| `range` | `7` or `lunch-specials` | Public product group (Oscar range) id or slug; requires partner scope |

Always send `X-Partner-Id`. For a fixed single-store site, the header alone is usually sufficient; add `partner` when mirroring the reference mobile client.

## Category navigation

```http
GET /shop/api/categories/
GET /shop/api/categories/mains/burgers/
GET /shop/api/partners/{PARTNER_ID}/categories/
```

`GET /partners/{PARTNER_ID}/categories/` returns partner profile + category tree in one call (store homepage).

## Product groups (ranges)

Optional curated shelves. Merchants manage groups via `/shop/api/admin/ranges/` (staff). Storefronts browse **public** groups only:

```http
GET /shop/api/ranges/?partner={PARTNER_ID}
GET /shop/api/ranges/{id}/?partner={PARTNER_ID}
GET /shop/api/products/?partner={PARTNER_ID}&range={id}&is_public=true
```

List/detail require partner scope (`?partner=` / `X-Partner-Id` / session). Response fields: `id`, `name`, `slug`, `description`, `images[]`, `product_count` (resolved membership). Private or other-partner groups return 404 on detail and are omitted from list.

## Product detail

```http
GET /shop/api/products/{id-or-slug}/
```

Lookup by numeric `id`, `slug`, or `upc`. Include `Session-Id` when the user has a cart.

### Key response fields

| Field | Use |
| ----- | --- |
| `options[]` | Free-text / configured fields (`code`, `type`, `required`) |
| `stockrecords[]` | Price, stock, `modifier_groups` |
| `is_digital` | Show digital UI; load deliverables separately ([DIGITAL-ASSETS.md](DIGITAL-ASSETS.md)) |
| `images[]` | Product gallery |

### Modifier groups (on `stockrecords[]`)

| Field | Use |
| ----- | --- |
| `min_permitted` / `max_permitted` | Distinct options customer must/can pick in group |
| `modifier_options[].min_quantity` / `max_quantity` | Per-option quantity limits |
| `modifier_options[].price` | Extra charge (may be `0.00`) |
| `modifier_options[].id` | Sent in `modifier_groups` at add-to-cart |

Fixture: [product-detail-digital.json](fixtures/product-detail-digital.json)

## Marketplace variant (optional)

Multi-partner discovery (`GET /partners/`) is **not required** for a branded single-store site. See [OUT-OF-SCOPE.md](OUT-OF-SCOPE.md).
