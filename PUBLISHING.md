# Publishing

This repository is a **Cursor Agent Skill** and integrator documentation pack. It does not ship an npm or PyPI package.

## Clone and install

```bash
git clone https://github.com/pgiki/fikashop-storefront-skills.git
cd fikashop-storefront-skills
ln -sf "$(pwd)" ~/.cursor/skills/fikashop-storefront-skills
```

In Cursor, reference `@fikashop-storefront-skills` or `@fikashop-storefront-skills/SKILL.md`.

## Relationship to fikashop-api

| Artifact | Location |
| -------- | -------- |
| Source integration guide | `fikashop-api/docs/storefront-integration.md` (private monorepo) |
| Vendored copy (this repo) | [docs/storefront-integration.md](docs/storefront-integration.md) |
| Screen-to-API map | [docs/reference-client-map.md](docs/reference-client-map.md) |
| Sync script | [scripts/sync-integration-doc.sh](scripts/sync-integration-doc.sh) |

When the API guide changes, run the sync script and update distilled contracts in the same PR.

## Self-contained documentation policy

This skill pack must not link to private monorepo repos (`fikashop-mobile`, `fikashop-api`, `fikashop-payments-skills`). Integrators get everything they need from:

- [docs/storefront-integration.md](docs/storefront-integration.md)
- [docs/reference-client-map.md](docs/reference-client-map.md)
- [contracts/](contracts/) and [docs/examples/](docs/examples/)
- Live API OpenAPI at `{API_BASE}/docs/`

Run `npm run check:links` before publishing.

## GitHub release checklist

- [ ] `docs/storefront-integration.md` synced from fikashop-api
- [ ] `npm test` and `npm run check:links` pass
- [ ] [SKILL.md](SKILL.md) and [contracts/CHECKLIST.md](contracts/CHECKLIST.md) reflect current API
- [ ] No links to private monorepo GitHub URLs
