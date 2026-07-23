#!/usr/bin/env bash
# List public product groups (ranges) and optionally products in one group.
# Usage:
#   ./list-ranges.sh
#   RANGE_ID=7 ./list-ranges.sh
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikashop.app}"
PARTNER_ID="${PARTNER_ID:-1}"
HOSTNAME="$(echo "$API_BASE" | sed -E 's#https?://([^/]+).*#\1#')"
UUID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || python3 -c 'import uuid; print(uuid.uuid4())')"
SESSION_ID="${SESSION_ID:-SID:ANON:${HOSTNAME}:${UUID}}"

echo "==> GET /shop/api/ranges/?partner=${PARTNER_ID}"
curl -sS -f "${API_BASE}/shop/api/ranges/?partner=${PARTNER_ID}" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Accept: application/json"
echo ""

if [[ -n "${RANGE_ID:-}" ]]; then
  echo "==> GET /shop/api/ranges/${RANGE_ID}/?partner=${PARTNER_ID}"
  curl -sS -f "${API_BASE}/shop/api/ranges/${RANGE_ID}/?partner=${PARTNER_ID}" \
    -H "X-Partner-Id: ${PARTNER_ID}" \
    -H "Session-Id: ${SESSION_ID}" \
    -H "Accept: application/json"
  echo ""

  echo "==> GET /shop/api/products/?partner=${PARTNER_ID}&range=${RANGE_ID}&is_public=true"
  curl -sS -f "${API_BASE}/shop/api/products/?partner=${PARTNER_ID}&range=${RANGE_ID}&is_public=true&page=1&size=15" \
    -H "X-Partner-Id: ${PARTNER_ID}" \
    -H "Session-Id: ${SESSION_ID}" \
    -H "Accept: application/json" \
    | head -c 800
  echo ""
fi

echo "OK — Session-Id: ${SESSION_ID}"
