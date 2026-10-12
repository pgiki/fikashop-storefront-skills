# Storefront errors

Full reference: [docs/storefront-integration.md §12](../docs/storefront-integration.md#12-error-reference).

## HTTP status map

| HTTP | Typical cause | Client action |
|------|---------------|---------------|
| 401 | Invalid/missing Bearer | Refresh token; re-login |
| 403 | Not order owner (also: VPS power on suspended/cancelled server, ClickPesa refund by non-owner) | Hide resource; check auth; for VPS power show billing/suspended copy |
| 404 | Unknown id/slug (also: consumed/expired one-time credential) | Show not found; for credentials offer reset/reveal |
| 405 | `start-session` without login | Complete OIDC first |
| 406 | Basket/checkout/add validation | Parse body (below) |
| 425 | Checkout already in progress (same Idempotency-Key) | Keep form values; show "order is being placed, do not resubmit"; next submit replays the placed order |
| 429 | Rate limited (VPS retry/power/reset, domains cart/add) | Honor `Retry-After`; back off; disable the action while cooling down |

## Add to basket (`406`)

String reason:

```json
{ "reason": "a maximum of 50 can be bought" }
```

Field reason:

```json
{ "reason": { "id": ["This field is required."] } }
```

## Add voucher (`406`)

`POST /shop/api/basket/add-voucher/` — partner-scoped; requires `Session-Id` + `X-Partner-Id`.

```json
{ "vouchercode": ["Voucher code unknown"] }
```

```json
{ "reason": "Your basket does not qualify for a voucher discount" }
```

On success (`200`), response is the **voucher** object — call `GET /basket/` for `voucher_discounts` and totals. See [INTEGRATION.md](INTEGRATION.md#voucher-promo-code).

## Checkout (`406`)

```json
{
  "non_field_errors": ["'Classic Burger' is no longer available to buy (Unavailable). Please adjust your basket to continue."],
  "errors": {
    "basket": ["Basket is empty."],
    "non_field_errors": ["…"]
  }
}
```

**Parse order (reference app):**

1. `errors.basket` — array of strings
2. `errors.non_field_errors` — array of strings
3. Other keys — flatten object values to strings
4. HTTP client `problem` / status text

## Checkout idempotency

Send a stable `Idempotency-Key` per basket (reuse across retries; mint a
new one only for a new basket). A double-submit replays the original `200`
with the same order id — treat it as success and navigate to the order.
`425` means the first submit is still processing: do not mint a new key.

## One-time credentials (VPS / email hosting)

`meta` on list/retrieve never contains secret material; it carries
`has_pending_credential: true` while a one-time password awaits reveal.
Gate "reveal" buttons on that flag and surface the backend `detail` on
`404` (already consumed, expired, or not provisioned).

## Hosting lifecycle statuses

Email domains and VPS rows can be `cancelled` (terminal, read-only).
Treat it like a terminal failure in polling loops; show a
cancelled/read-only state, never a retry button.

## Payment capture

May return **200** with `{ "status": "error", "detail": "…" }` or **400** with same shape. Always check `status` in JSON body, not only HTTP code.

## Realm / session mismatch

If `start-session` or basket returns realm mismatch: clear session, force re-login (mobile logs out automatically).

## Token refresh flow

```
401 on shop request
  → POST {OIDC_ISS}/token/ (refresh_token)
  → retry with new access_token
  → on refresh failure: clear auth, redirect login
```
