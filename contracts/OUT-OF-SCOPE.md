# Out of scope

This skill covers **customer storefront checkout** for a single FikaChu-provisioned partner. The following are intentionally excluded or documented elsewhere.

| Topic | Notes |
| ----- | ----- |
| Partner onboarding / admin APIs | FikaChu provisions `{PARTNER_ID}`; `/shop/api/admin/` is for staff apps only |
| Product group **management** | Create/edit ranges, pin products, images: `/shop/api/admin/ranges/` (staff). Customer browse of public groups is in scope — [CATALOG.md](CATALOG.md) |
| Voucher / offer **management** | Create codes and offers: `/shop/api/admin/vouchers/`, `/shop/api/admin/offers/` (staff). Applying a code at checkout is in scope — [INTEGRATION.md §3](INTEGRATION.md#voucher-promo-code) |
| Marketplace partner discovery | Optional `GET /partners/` — not required for branded single-store sites ([CATALOG.md](CATALOG.md)) |
| Subscription wallet top-up | `POST /subscriptions/api/subscriptions/wallet-deposit/` — separate from shop checkout; coordinate with your FikaChu operator |
| Deferred cash (`complete-deferred-payment`) | Requires server-signed order token — staff/admin only ([INTEGRATION.md §6](INTEGRATION.md#6-payment-capture)) |
| Appointments, domains, standalone invoices | Coordinate with your FikaChu operator |
| Payment provider webhooks | Server-side `POST /payments/webhook/{variant}/` — storefronts poll order status |
| Partner Pay branded flow | Alternate mobile UX; same basket/checkout APIs |

## In scope (this skill)

Catalog → cart (incl. promo codes) → shipping → checkout → payment capture → orders → digital downloads.
