# Changelog

## Unreleased

### Added

- Public **product groups (ranges)** for storefront browse: `GET /shop/api/ranges/`, `GET /shop/api/ranges/{id}/`, and `GET /shop/api/products/?range=` — documented in [CATALOG.md](contracts/CATALOG.md#product-groups-ranges), [ENDPOINTS.md](contracts/ENDPOINTS.md), [INTEGRATION.md §2](contracts/INTEGRATION.md#2-catalog), synced [storefront-integration.md §4.4](docs/storefront-integration.md#44-product-groups-ranges), and [list-ranges.sh](docs/examples/curl/list-ranges.sh). Staff management remains `/shop/api/admin/ranges/` ([OUT-OF-SCOPE.md](contracts/OUT-OF-SCOPE.md)).
- **Promo codes in scope:** `POST /shop/api/basket/add-voucher/` documented in [INTEGRATION.md](contracts/INTEGRATION.md#voucher-promo-code), [ERRORS.md](contracts/ERRORS.md), [storefront-integration.md §6.5](docs/storefront-integration.md#65-add-voucher-promo-code), and [add-voucher.sh](docs/examples/curl/add-voucher.sh). Removed from out-of-scope (staff create/manage vouchers remains out of scope).

### Changed

- **Breaking (docs):** Removed links to private monorepo repos (`fikashop-mobile`, `fikashop-api`, `fikashop-payments-skills`). Integration is now self-contained via [docs/reference-client-map.md](docs/reference-client-map.md), examples, and contracts.
- Sync script no longer injects `github.com/fikachu/fikashop` URLs when vendoring the integration guide.
- Postman collection references replaced with `{API_BASE}/docs/` OpenAPI.

### Added (prior)

- Expanded [docs/reference-client-map.md](docs/reference-client-map.md): customer journey, client module behaviors, example links.
- `npm run check:links` CI guard against private repo URLs.

### Added (prior)

- Self-contained publish package: vendored `docs/storefront-integration.md`, contracts, fixtures, CI
- Contracts: `CATALOG`, `PAYMENT-FIELDS`, `DIGITAL-ASSETS`, `OUT-OF-SCOPE`, `CHECKLIST`, `AUTH-SCREENS`, `ORDERS`
- Onboarding: `GETTING-STARTED.md`, `TROUBLESHOOTING.md`, `reference-client-map.md`
- Examples: TypeScript flows, OIDC PKCE doc, curl scripts, wallet/guest/digital helpers
- Sync script: `scripts/sync-integration-doc.sh`
- `contracts/status-map.json` for order/payment status normalization
