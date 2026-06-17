# Publishing

This repository is a **Cursor Agent Skill** and integrator documentation pack. It does not ship an npm or PyPI package.

## Clone and install

```bash
git clone https://github.com/fikachu/fikashop-storefront-skills.git
cd fikashop-storefront-skills
ln -sf "$(pwd)" ~/.cursor/skills/fikashop-storefront-skills
```

In Cursor, reference `@fikashop-storefront-skills` or `@fikashop-storefront-skills/SKILL.md`.

## Relationship to fikashop-api

| Artifact | Location |
| -------- | -------- |
| Source integration guide | `fikashop-api/docs/storefront-integration.md` in [fikashop monorepo](https://github.com/fikachu/fikashop) |
| Vendored copy (this repo) | [docs/storefront-integration.md](docs/storefront-integration.md) |
| Sync script | [scripts/sync-integration-doc.sh](scripts/sync-integration-doc.sh) |

When the API guide changes, run the sync script and update distilled contracts in the same PR.

## Optional peer repos

| Repo | Purpose |
| ---- | ------- |
| [fikashop-payments-skills](https://github.com/fikachu/fikashop-payments-skills) | Subscriptions, wallet top-up, webhooks |
| [fikashop-mobile](https://github.com/fikachu/fikashop/tree/main/fikashop-mobile) | Reference React Native client |

Neither is required to complete a storefront integration using this skill.

## GitHub release checklist

- [ ] `docs/storefront-integration.md` synced from fikashop-api
- [ ] `npm test` passes (fixtures + example typecheck)
- [ ] [SKILL.md](SKILL.md) and [contracts/CHECKLIST.md](contracts/CHECKLIST.md) reflect current API
- [ ] No broken relative links to monorepo-only paths
