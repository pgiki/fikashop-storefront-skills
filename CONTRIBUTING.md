# Contributing

## Contracts and docs

When fikashop-api storefront behavior changes:

1. Update the source guide: `fikashop-api/docs/storefront-integration.md` (in the fikashop monorepo)
2. Run `scripts/sync-integration-doc.sh` to refresh the vendored copy in this repo
3. Update distilled contracts if the fast path changed:
   - [contracts/INTEGRATION.md](contracts/INTEGRATION.md)
   - [contracts/CATALOG.md](contracts/CATALOG.md)
   - [contracts/PAYMENT-FIELDS.md](contracts/PAYMENT-FIELDS.md)
   - [contracts/DIGITAL-ASSETS.md](contracts/DIGITAL-ASSETS.md)
   - [contracts/ORDERS.md](contracts/ORDERS.md)
   - [contracts/AUTH-SCREENS.md](contracts/AUTH-SCREENS.md)
   - [contracts/OUT-OF-SCOPE.md](contracts/OUT-OF-SCOPE.md)
   - [contracts/CHECKLIST.md](contracts/CHECKLIST.md)
   - [contracts/ERRORS.md](contracts/ERRORS.md)
   - [contracts/PRODUCTION.md](contracts/PRODUCTION.md)
   - [contracts/status-map.json](contracts/status-map.json)
4. Add or update fixtures in [contracts/fixtures/](contracts/fixtures/) — keep `npm test` green
5. Update [SKILL.md](SKILL.md) and [CHANGELOG.md](CHANGELOG.md)
6. Run `npm run check:links` — no links to private monorepo repos (`github.com/fikachu/fikashop`, `github.com/pgiki/fikashop`). The only allowed GitHub URL is this repo's clone URL (`fikashop-storefront-skills`).

## Link policy

Do **not** add markdown links to `fikashop-mobile`, `fikashop-api`, or `fikashop-payments-skills` on GitHub. Use [docs/reference-client-map.md](docs/reference-client-map.md) and inline behaviors instead.

## Cursor skill symlink

After changing `SKILL.md` or contracts:

```bash
ln -sf "$(pwd)" ~/.cursor/skills/fikashop-storefront-skills
# Monorepo: from fikashop root
ln -sf "$(pwd)/fikashop-storefront-skills" .cursor/skills/fikashop-storefront-skills
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) validates JSON fixtures, runs TypeScript example typecheck, and checks for forbidden external repo links on push/PR to `main`.

## Publishing

See [PUBLISHING.md](PUBLISHING.md).
