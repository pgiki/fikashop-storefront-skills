#!/usr/bin/env bash
# Add a product to basket — requires PRODUCT_ID env var.
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikachu.com}"
PARTNER_ID="${PARTNER_ID:-1}"
PRODUCT_ID="${PRODUCT_ID:-42}"
HOSTNAME="$(echo "$API_BASE" | sed -E 's#https?://([^/]+).*#\1#')"
UUID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || python3 -c 'import uuid; print(uuid.uuid4())')"
SESSION_ID="${SESSION_ID:-SID:ANON:${HOSTNAME}:${UUID}}"

echo "==> POST /shop/api/basket/add-product/"
curl -sS -f -X POST "${API_BASE}/shop/api/basket/add-product/?partner=${PARTNER_ID}" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"id\": ${PRODUCT_ID}, \"quantity\": 1}"

echo ""
echo "Session-Id: ${SESSION_ID}"
