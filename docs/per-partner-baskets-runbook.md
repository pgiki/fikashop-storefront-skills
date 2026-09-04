# Per-partner baskets — deploy runbook

## Preconditions

- Postgres/PostGIS (partial unique constraint on Open `(owner, partner)`).
- Clients that send `X-Partner-Id` / `?partner=` on basket and checkout (branded storefronts: fixed partner; marketplace: selected shop, not platform host).

## Order of operations

1. **Backup** basket / session tables if required by ops policy.
2. **Migrate** on staging, then production:

   ```bash
   source "$(conda info --base)/etc/profile.d/conda.sh" && conda activate fikashop-api
   cd fikashop-api
   python manage.py migrate basket 0015_basket_partner
   ```

3. **Verify migration**

   - No Open baskets with mixed stockrecord partners.
   - Constraint `uniq_open_basket_per_owner_partner` exists.
   - Smoke: add product partner A, add product partner B (same Session-Id), two Open baskets; checkout A; B still Open with lines.

4. **Deploy API** with `SHOP_BASKET_REQUIRE_PARTNER=True` (default in production settings).

5. **Deploy clients** (mobile / landing) **together** with the API for marketplace hosts — do not ship API-only marketplace if apps still clear the wrong basket URL after partner switch.

6. **Rollout traffic**

   - Branded single-`X-Partner-Id` hosts first (lowest risk).
   - Then marketplace hosts (selected partner must win over platform host for the header).

7. **Optional cron** (after first week):

   ```bash
   python manage.py cleanup_stale_open_baskets --empty-days 14 --null-partner --dry-run
   python manage.py cleanup_stale_open_baskets --empty-days 14 --null-partner
   ```

## Rollback notes

- Do **not** reintroduce unscoped `Basket.open.get_or_create(owner=user)` — that collapses every shop’s cart into one.
- Rolling back the migration requires a planned reverse (constraint drop + optional partner field); prefer forward fixes.
- Clients: keep sending partner header even if temporarily allowing unscoped API via setting.

## Smoke checklist (post-deploy)

- [ ] `GET /shop/api/basket/` without partner → **400** (when require flag on)
- [ ] Add A, switch header to B, add B → two Open baskets
- [ ] Product not stocked at current partner → **406**
- [ ] True partner mismatch on basket → **409**
- [ ] Checkout A leaves B Open
- [ ] Checkout body basket id for B with header A → validation error (406)
- [ ] Login / start-session merges guest A+B into user A+B
- [ ] POS charge does not empty staff shopper Open basket
