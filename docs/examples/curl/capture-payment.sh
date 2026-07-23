#!/usr/bin/env bash
# Capture payment after checkout — requires ACCESS_TOKEN, ORDER_ID, REFERENCE.
set -euo pipefail

API_BASE="${API_BASE:-https://api.fikashop.app}"
PARTNER_ID="${PARTNER_ID:-1}"
ACCESS_TOKEN="${ACCESS_TOKEN:?Set ACCESS_TOKEN}"
REFERENCE="${REFERENCE:?Set payments[].reference from order}"
BILLING_PHONE="${BILLING_PHONE:-+255712345678}"

echo "==> POST /payments/process/${REFERENCE}/"
curl -sS -f -X POST "${API_BASE}/payments/process/${REFERENCE}/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"action\": \"capture\", \"input_fields\": {\"billing_phone\": \"${BILLING_PHONE}\"}}"

echo ""
