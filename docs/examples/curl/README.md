# curl examples

Shell scripts for non-TypeScript integrators. Set `API_BASE` and `PARTNER_ID` as needed.

| Script | Phase |
| ------ | ----- |
| [smoke-test.sh](smoke-test.sh) | Bootstrap — categories + empty basket |
| [add-to-cart.sh](add-to-cart.sh) | Add product (`PRODUCT_ID`, exports `SESSION_ID`) |
| [shipping-quote.sh](shipping-quote.sh) | Shipping methods (`SESSION_ID` required) |
| [capture-payment.sh](capture-payment.sh) | Post-checkout capture (`ACCESS_TOKEN`, `REFERENCE`) |
| [poll-payment-states.sh](poll-payment-states.sh) | Async payment poll (`ORDER_ID`) |

Typical sequence:

```bash
export API_BASE="https://api.fikachu.com"
export PARTNER_ID="1"
./smoke-test.sh
PRODUCT_ID=42 ./add-to-cart.sh   # note SESSION_ID from output
SESSION_ID="SID:ANON:..." ./shipping-quote.sh
```

Checkout `POST /shop/api/checkout/` is best done from [checkout-flow.ts](../checkout-flow.ts) or the full guide — payload is large and user-specific.
