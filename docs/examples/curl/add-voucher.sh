#!/usr/bin/env bash
# Apply a promo code to the session basket, then refresh basket totals.
# Usage:
#   SESSION_ID=SID:ANON:... VOUCHER_CODE=WELCOME10 ./add-voucher.sh
#   PRODUCT_ID=42 ./add-to-cart.sh   # create SESSION_ID first if needed
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikashop.app}"
PARTNER_ID="${PARTNER_ID:-1}"
VOUCHER_CODE="${VOUCHER_CODE:?Set VOUCHER_CODE (e.g. WELCOME10)}"
HOSTNAME="$(echo "$API_BASE" | sed -E 's#https?://([^/]+).*#\1#')"
UUID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || python3 -c 'import uuid; print(uuid.uuid4())')"
SESSION_ID="${SESSION_ID:-SID:ANON:${HOSTNAME}:${UUID}}"

echo "==> POST /shop/api/basket/add-voucher/"
curl -sS -f -X POST "${API_BASE}/shop/api/basket/add-voucher/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"vouchercode\": \"${VOUCHER_CODE}\"}"
echo ""

echo "==> GET /shop/api/basket/?partner=${PARTNER_ID}"
curl -sS -f "${API_BASE}/shop/api/basket/?partner=${PARTNER_ID}" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Accept: application/json"
echo ""

echo "OK — Session-Id: ${SESSION_ID}"
