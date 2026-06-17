#!/usr/bin/env bash
# Poll payment state — requires ACCESS_TOKEN and ORDER_ID.
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikachu.com}"
PARTNER_ID="${PARTNER_ID:-1}"
ACCESS_TOKEN="${ACCESS_TOKEN:?Set ACCESS_TOKEN}"
ORDER_ID="${ORDER_ID:?Set ORDER_ID}"

echo "==> GET /shop/api/checkout/payment-states/${ORDER_ID}/"
curl -sS -f "${API_BASE}/shop/api/checkout/payment-states/${ORDER_ID}/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Accept: application/json"

echo ""
