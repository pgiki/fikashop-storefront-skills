# Storefront fixtures

Example JSON payloads for agent tests and codegen. Source: [docs/storefront-integration.md](../../docs/storefront-integration.md).

**Related:** [INTEGRATION.md](../INTEGRATION.md) · [PAYMENT-FIELDS.md](../PAYMENT-FIELDS.md) · [status-map.json](../status-map.json)

| File | Endpoint / use |
|------|----------------|
| [start-session.json](start-session.json) | `GET /shop/api/start-session/` response |
| [basket.json](basket.json) | `GET /shop/api/basket/` with lines |
| [add-product-request.json](add-product-request.json) | `POST /basket/add-product/` body |
| [shipping-methods-request.json](shipping-methods-request.json) | `POST /basket/shipping-methods/` body |
| [shipping-methods-response.json](shipping-methods-response.json) | `POST /basket/shipping-methods/` response |
| [payment-methods-available.json](payment-methods-available.json) | `GET …/payment-methods/available/` |
| [checkout-request.json](checkout-request.json) | `POST /checkout/` M-Pesa delivery (basket URL) |
| [checkout-request-by-id.json](checkout-request-by-id.json) | `POST /checkout/` M-Pesa delivery — basket id + `user_address` only (no inline `shipping_address`) |
| [guest-checkout-request.json](guest-checkout-request.json) | `POST /checkout/` guest cash pickup |
| [checkout-order-mpesa.json](checkout-order-mpesa.json) | `POST /checkout/` response (pending payment) |
| [checkout-order-wallet.json](checkout-order-wallet.json) | `POST /checkout/` wallet payment |
| [checkout-order-cash-empty-payments.json](checkout-order-cash-empty-payments.json) | COD — `payments: []` |
| [order-detail.json](order-detail.json) | `GET /orders/{id}/` for payment UI |
| [payment-states.json](payment-states.json) | `GET …/checkout/payment-states/{id}/` |
| [payment-capture-request.json](payment-capture-request.json) | `POST /payments/process/{reference}/` |
| [payment-capture-success.json](payment-capture-success.json) | Capture STK success |
| [payment-capture-redirect.json](payment-capture-redirect.json) | Hosted checkout redirect |
| [product-detail-digital.json](product-detail-digital.json) | `GET /products/{id}/` digital product |
| [product-detail-modifiers.json](product-detail-modifiers.json) | `GET /products/{id}/` with modifier groups |
| [order-receipt.json](order-receipt.json) | `GET /orders/{id}/receipt/` |
