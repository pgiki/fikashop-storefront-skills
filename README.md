# fikashop-storefront-skills

Cursor Agent Skill for integrating **custom storefronts** (web or mobile) with **fikashop-api**: catalog, `Session-Id` basket, shipping, checkout, payment capture, orders, and digital downloads.

**Single-partner scope:** send `X-Partner-Id: {PARTNER_ID}` on every shop call. FikaChu provisions the store.

| Path | What |
|------|------|
| [SKILL.md](SKILL.md) | Cursor agent skill — use `@fikashop-storefront-skills` |
| [docs/storefront-integration.md](docs/storefront-integration.md) | Full integrator guide (canonical, self-contained) |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Prerequisites and first API call |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common integration failures |
| [contracts/INTEGRATION.md](contracts/INTEGRATION.md) | Agent fast path (bootstrap → orders) |
| [contracts/CATALOG.md](contracts/CATALOG.md) | Catalog query params, modifiers |
| [contracts/PAYMENT-FIELDS.md](contracts/PAYMENT-FIELDS.md) | Checkout/capture `input_fields` |
| [contracts/DIGITAL-ASSETS.md](contracts/DIGITAL-ASSETS.md) | Digital downloads |
| [contracts/ORDERS.md](contracts/ORDERS.md) | Order history, receipt, resume payment |
| [contracts/AUTH-SCREENS.md](contracts/AUTH-SCREENS.md) | Headers per screen |
| [contracts/](contracts/) | Endpoints, errors, production, checklist |
| [contracts/fixtures/](contracts/fixtures/) | Example JSON payloads |
| [docs/examples/](docs/examples/) | TypeScript and curl patterns |
| [CHANGELOG.md](CHANGELOG.md) | Contract and doc changes |

## Install as a Cursor skill

```bash
git clone https://github.com/fikachu/fikashop-storefront-skills.git
ln -sf "$(pwd)/fikashop-storefront-skills" ~/.cursor/skills/fikashop-storefront-skills
```

In the fikashop monorepo (optional):

```bash
ln -sf "$(pwd)/fikashop-storefront-skills" .cursor/skills/fikashop-storefront-skills
```

## For humans vs agents

| Audience | Start here |
|----------|------------|
| Developers | [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) → [docs/storefront-integration.md](docs/storefront-integration.md) |
| Coding agents | [SKILL.md](SKILL.md) → [contracts/INTEGRATION.md](contracts/INTEGRATION.md) |

## Prerequisites

- `{PARTNER_ID}` (numeric id or partner `code`) from FikaChu
- `{API_BASE}` (e.g. `https://api.fikachu.com`)
- OIDC public client at `https://oidc.fikachu.com` with PKCE redirect URI

## Quick start

1. Configure `API_BASE`, `PARTNER_ID`, OIDC client.
2. Create/persist `Session-Id: SID:ANON:{hostname}:{uuid}`.
3. `GET /shop/api/partners/{PARTNER_ID}/categories/` → menu.
4. `POST /shop/api/basket/add-product/` → cart.
5. `POST /shop/api/basket/shipping-methods/` with address + `location`.
6. Login → `GET /shop/api/start-session/` (same UUID, `AUTH`).
7. `POST /shop/api/checkout/` → order.
8. If `order.payments.length > 0` → `POST /payments/process/{reference}/`.

See [contracts/CHECKLIST.md](contracts/CHECKLIST.md) for the full QA list.

This skill pack is **self-contained**: guides, contracts, fixtures, and examples live in this repo. Use `{API_BASE}/docs/` for live OpenAPI schemas.

MIT — [LICENSE](LICENSE)
