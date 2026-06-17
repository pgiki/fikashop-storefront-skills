#!/usr/bin/env bash
# Sync vendored integration guide from fikashop-api.
# Usage:
#   ./scripts/sync-integration-doc.sh
#   FIKASHOP_API_DOC=/path/to/storefront-integration.md ./scripts/sync-integration-doc.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT_SOURCE="$ROOT/../fikashop-api/docs/storefront-integration.md"
SOURCE="${FIKASHOP_API_DOC:-$DEFAULT_SOURCE}"
DEST="$ROOT/docs/storefront-integration.md"

if [[ ! -f "$SOURCE" ]]; then
  echo "Source not found: $SOURCE" >&2
  echo "Set FIKASHOP_API_DOC to fikashop-api/docs/storefront-integration.md" >&2
  exit 1
fi

COMMIT="$(git -C "$(dirname "$SOURCE")/.." rev-parse HEAD 2>/dev/null || echo unknown)"
cp "$SOURCE" "$DEST"

python3 - "$DEST" "$COMMIT" << 'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
commit = sys.argv[2]
text = path.read_text()

GITHUB_MOBILE = "https://github.com/fikachu/fikashop/tree/main/fikashop-mobile"
GITHUB_API = "https://github.com/fikachu/fikashop/tree/main/fikashop-api"
GITHUB_POSTMAN = "https://github.com/fikachu/fikashop/blob/main/fikashop-api/postman/Fikashop.postman_collection.json"
GITHUB_INVOICE = "https://github.com/fikachu/fikashop/blob/main/fikashop-api/docs/README-invoice-api-integration.md"
GITHUB_PARTNER_SCOPE = "https://github.com/fikachu/fikashop/blob/main/fikashop-api/shop/utils/partner_scope.py"

text = re.sub(r'\]\(\.\./\.\./fikashop-mobile/([^)]+)\)', lambda m: f']({GITHUB_MOBILE}/{m.group(1)})', text)
text = re.sub(r'\[fikashop-mobile\]\(\.\./\.\./fikashop-mobile\)', f'[fikashop-mobile]({GITHUB_MOBILE})', text)
text = re.sub(r'\]\(\.\./\.\./fikashop-mobile\)', f']({GITHUB_MOBILE})', text)
text = re.sub(
    r'\[postman/Fikashop\.postman_collection\.json\]\(\.\./postman/Fikashop\.postman_collection\.json\)',
    f'[Postman collection]({GITHUB_POSTMAN})', text)
text = re.sub(
    r'\[README-invoice-api-integration\.md\]\(\./README-invoice-api-integration\.md\)',
    f'[invoice API integration guide]({GITHUB_INVOICE})', text)
text = re.sub(
    r'\[partner_scope\.py\]\(\.\./shop/utils/partner_scope\.py\)',
    f'[partner_scope.py]({GITHUB_PARTNER_SCOPE})', text)
text = text.replace(
    "See other integration guides under `fikashop-api/docs/`",
    f"See other integration guides in the [fikashop-api docs]({GITHUB_API}/docs/)")

header = f"<!-- synced from fikashop-api/docs/storefront-integration.md @ {commit} — run scripts/sync-integration-doc.sh to refresh -->\n\n"
if text.startswith("<!-- synced"):
    text = re.sub(r'^<!-- synced.*?-->\n\n', header, text, count=1)
else:
    text = header + text

path.write_text(text)
print(f"Synced {path} @ {commit}")
PY
