# Orders contract

Order history, detail, receipts, and resuming payment. Full guide: [docs/storefront-integration.md §11](../docs/storefront-integration.md#11-order-management).

## List orders

```http
GET /shop/api/orders/?page=1
X-Partner-Id: {PARTNER_ID}
Authorization: Bearer {ACCESS_TOKEN}
```

Paginated: `{ page, count, results: [{ id, number, status, total_incl_tax, … }] }`.

## Order detail

```http
GET /shop/api/orders/{id}/
```

Use on payment screen and order confirmation. Includes `lines[]`, `payments[]`, `shipping_address`.

Fixture: [order-detail.json](fixtures/order-detail.json)

## Receipt

```http
GET /shop/api/orders/{id-or-number}/receipt/
```

JSON response:

```json
{ "receipt_url": "https://api.fikachu.com/invoices/api/order-100000901/" }
```

PDF/HTML redirect:

```http
GET /shop/api/orders/100000901/receipt/?return_format=pdf
```

Legacy `/orders/{id}/invoice/` redirects to `/receipt/`.

Fixture: [order-receipt.json](fixtures/order-receipt.json)

## Order confirmation screen

1. `GET /shop/api/orders/{order_id}/` on mount.
2. Show `number`, `status`, lines, totals, `shipping_address`.
3. Receipt: `GET …/receipt/?return_format=pdf`.
4. If any `lines[].product.is_digital` and order is paid → [DIGITAL-ASSETS.md](DIGITAL-ASSETS.md).

## Resume incomplete payment

From order list/detail, if `payments[].status` is actionable ([status-map.json](status-map.json)), navigate to payment UI and call `POST /payments/process/{payments[].reference}/` again.

## Status reference

| Order `status` | Typical meaning |
| -------------- | --------------- |
| `Pending` | Placed; payment may still be due |
| `payment_authorized` / `Authorized` | Paid or authorized |
| `Shipped` | Fulfilled |
| `Canceled` | Cancelled |

Payment statuses for capture: see [status-map.json](status-map.json).
