# Payment input_fields contract

Build checkout and post-checkout capture forms from each payment method's `input_fields[]`. Full guide: [docs/storefront-integration.md §8](../docs/storefront-integration.md#8-payment-methods).

## Load methods

```http
GET /shop/api/checkout/payment-methods/available/?partner={PARTNER_ID}
```

Fixture: [payment-methods-available.json](fixtures/payment-methods-available.json)

## Checkout payment block

Key = `method_type` (`cash`, `online-payments`, `wallet`). `variant` = method `code` (`mpesa`, `cash`, `wallet`).

```json
"payment": {
  "online-payments": {
    "enabled": true,
    "variant": "mpesa",
    "input_fields": {
      "billing_phone": "255712345678"
    }
  }
}
```

## Field schema


| Field         | Use                                                                           |
| ------------- | ----------------------------------------------------------------------------- |
| `code`        | Form field name; key in checkout `input_fields` and `POST /payments/process/` |
| `type`        | `string`, `password`, `boolean`, `checkbox`, etc.                             |
| `is_required` | Validate before submit                                                        |
| `help_text`   | Placeholder / format hint                                                     |
| `schema`      | Optional `choices` / `options` / `enum` for select lists                      |


## Prefill sources


| `input_fields.code`                        | Typical source                               |
| ------------------------------------------ | -------------------------------------------- |
| `billing_phone`                            | User phone / `shipping_address.phone_number` |
| `billing_email`                            | User email                                   |
| `billing_first_name` / `billing_last_name` | User profile                                 |
| `msisdn`                                   | Mobile money number (method-specific)        |


At checkout submit, copy `phone_number` into `billing_phone` when the method expects it.

## Client-side validation

Before `POST /checkout/` or `POST /payments/process/{reference}/`:

1. Load `input_fields` from the selected method (checkout) or `order.payments[].payment_method.input_fields` (capture).
2. For each field with `is_required: true`, ensure a non-empty value.
3. If `schema.choices` or `schema.enum` is present, restrict values to allowed options.
4. Surface API errors from `406` checkout or `status: error` on capture.

Minimal validation helper (inline — no external package required):

```typescript
type InputField = {
  code: string;
  is_required?: boolean;
  schema?: { choices?: string[]; enum?: string[] };
};

function validateFieldValues(
  fields: InputField[],
  values: Record<string, string>,
): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    const v = (values[field.code] ?? '').trim();
    if (field.is_required && !v) {
      errors.push(`${field.code} is required`);
      continue;
    }
    const allowed = field.schema?.choices ?? field.schema?.enum;
    if (v && allowed?.length && !allowed.includes(v)) {
      errors.push(`${field.code} must be one of: ${allowed.join(', ')}`);
    }
  }
  return errors;
}
```

## Capture (after checkout)

```http
POST {API_BASE}/payments/process/{reference}/
```

```json
{
  "action": "capture",
  "input_fields": {
    "billing_phone": "+255712345678",
    "billing_email": "customer@example.com"
  }
}
```

Fixture: [payment-capture-request.json](fixtures/payment-capture-request.json)

## Provider codes (examples)

`cash`, `mpesa`, `wallet`, `selcom`, `safaricom`, `tigo_pesa`, `airtel_money`, `snippe_mobile`, `snippe_card`, `clickpesa_mobile`, `clickpesa_card`

For wallet top-up and subscription billing (separate from shop checkout), see [OUT-OF-SCOPE.md](OUT-OF-SCOPE.md).