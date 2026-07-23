#!/usr/bin/env bash
# Minimal smoke test — partner categories + basket (requires curl + uuidgen on macOS/Linux)
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikashop.app}"
PARTNER_ID="${PARTNER_ID:-1}"
HOSTNAME="$(echo "$API_BASE" | sed -E 's#https?://([^/]+).*#\1#')"
UUID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || python3 -c 'import uuid; print(uuid.uuid4())')"
SESSION_ID="SID:ANON:${HOSTNAME}:${UUID}"

echo "==> GET /shop/api/partners/${PARTNER_ID}/categories/"
curl -sS -f "${API_BASE}/shop/api/partners/${PARTNER_ID}/categories/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Accept: application/json" \
  | head -c 400
echo ""

echo "==> GET /shop/api/basket/"
curl -sS -f "${API_BASE}/shop/api/basket/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Accept: application/json"
echo ""

echo "OK — Session-Id: ${SESSION_ID}"
