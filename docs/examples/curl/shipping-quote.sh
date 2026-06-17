#!/usr/bin/env bash
# Quote shipping methods — set SESSION_ID and shipping address fields.
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikachu.com}"
PARTNER_ID="${PARTNER_ID:-1}"
SESSION_ID="${SESSION_ID:?Set SESSION_ID from smoke-test or add-to-cart}"

echo "==> POST /shop/api/basket/shipping-methods/"
curl -sS -f -X POST "${API_BASE}/shop/api/basket/shipping-methods/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "country": "TZ",
    "line1": "Plot 12, Oysterbay",
    "line4": "Dar es Salaam",
    "phone_number": "+255712345678",
    "location": { "type": "Point", "coordinates": [39.2712, -6.7773] }
  }'

echo ""
