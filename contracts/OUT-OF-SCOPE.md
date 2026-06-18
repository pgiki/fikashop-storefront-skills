# Out of scope

This skill covers **customer storefront checkout** for a single FikaChu-provisioned partner. The following are intentionally excluded or documented elsewhere.

| Topic | Notes |
| ----- | ----- |
| Partner onboarding / admin APIs | FikaChu provisions `{PARTNER_ID}`; `/shop/api/admin/` is for staff apps only |
| Marketplace partner discovery | Optional `GET /partners/` — not required for branded single-store sites ([CATALOG.md](CATALOG.md)) |
| Subscription wallet top-up | `POST /subscriptions/api/subscriptions/wallet-deposit/` — separate from shop checkout; coordinate with your FikaChu operator |
| Voucher / promo UI | API supports `POST /basket/add-voucher/`; typical storefront clients do not implement apply-code flow |
| Deferred cash (`complete-deferred-payment`) | Requires server-signed order token — staff/admin only ([INTEGRATION.md §6](INTEGRATION.md#6-payment-capture)) |
| Appointments, domains, standalone invoices | Coordinate with your FikaChu operator |
| Payment provider webhooks | Server-side `POST /payments/webhook/{variant}/` — storefronts poll order status |
| Partner Pay branded flow | Alternate mobile UX; same basket/checkout APIs |

## In scope (this skill)

Catalog → cart → shipping → checkout → payment capture → orders → digital downloads.
