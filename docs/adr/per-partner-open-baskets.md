# ADR: Per-partner Open baskets

**Status:** Accepted  
**Date:** 2026-08-23

## Context

django-oscar (and django-oscar-api) keep **one Open basket per shopper**. Marketplace guests browse many partners under one `Session-Id`. Mixing lines from different partners breaks shipping, vouchers, tax, and payouts.

## Decision

FikaShop keeps **one Open Oscar basket per partner** per shopper (anonymous session map or authenticated owner):

- Same `Session-Id` across shops (do **not** mint a Session-Id per partner).
- `X-Partner-Id` / `?partner=` selects which Open basket to read/write.
- Checkout is **one POST → one order → one partner**; other Open baskets stay Open.
- Mixing another partner’s stockrecord into the current basket is rejected (**409**). Product not stocked for the current partner remains **406**.

Closest industry fit: **Instacart / food delivery / Magento multi-website** (store-scoped cart + checkout).  
**Not** Amazon / Etsy / Shopify Marketplace (one cart, multi-seller lines, split fulfillment).

## Client UX (required)

- Cart and checkout screens always show the **current shop name**.
- Switching shops must **not** clear other shops’ carts.
- Optional marketplace enhancement: badge “carts at N shops” using `start-session` `baskets[]` or parallel `GET /basket/`.

## Non-goals

- Multi-partner single order / split payment / split shipment in one checkout.
- Per-partner Session-Id.
- Client-only maps over a single unscoped `GET /basket/` (server must scope).

## Implementation notes

- Model: `Basket.partner` + partial unique Open `(owner, partner)` (Postgres/PostGIS).
- Ops: [`shop.oscarapi.basket.operations`](../shop/oscarapi/basket/operations.py) — explicit imports (not `OSCARAPI_OVERRIDE_MODULES`; oscarapi does not load basket ops via `get_api_class`).
- Login: merge guest baskets **per partner** before session upgrade.

## Consequences

- Power shoppers accumulate multiple Open basket rows → need TTL cleanup and metrics.
- Clients that omit partner scope must fail closed in production (`SHOP_BASKET_REQUIRE_PARTNER`).
- Users expecting Amazon “one bag” need explicit multi-cart messaging.
