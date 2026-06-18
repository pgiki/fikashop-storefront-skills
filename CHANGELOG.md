# Changelog

## Unreleased

### Changed

- **Breaking (docs):** Removed links to private monorepo repos (`fikashop-mobile`, `fikashop-api`, `fikashop-payments-skills`). Integration is now self-contained via [docs/reference-client-map.md](docs/reference-client-map.md), examples, and contracts.
- Sync script no longer injects `github.com/fikachu/fikashop` URLs when vendoring the integration guide.
- Postman collection references replaced with `{API_BASE}/docs/` OpenAPI.

### Added

- Expanded [docs/reference-client-map.md](docs/reference-client-map.md): customer journey, client module behaviors, example links.
- `npm run check:links` CI guard against private repo URLs.

### Added (prior)

- Self-contained publish package: vendored `docs/storefront-integration.md`, contracts, fixtures, CI
- Contracts: `CATALOG`, `PAYMENT-FIELDS`, `DIGITAL-ASSETS`, `OUT-OF-SCOPE`, `CHECKLIST`, `AUTH-SCREENS`, `ORDERS`
- Onboarding: `GETTING-STARTED.md`, `TROUBLESHOOTING.md`, `reference-client-map.md`
- Examples: TypeScript flows, OIDC PKCE doc, curl scripts, wallet/guest/digital helpers
- Sync script: `scripts/sync-integration-doc.sh`
- `contracts/status-map.json` for order/payment status normalization
