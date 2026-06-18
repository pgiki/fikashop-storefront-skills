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

# Monorepo reference map -> skills-local path
text = text.replace(
    "[`fikashop-storefront-skills/docs/reference-client-map.md`](../../fikashop-storefront-skills/docs/reference-client-map.md)",
    "[reference-client-map.md](reference-client-map.md)",
)
text = text.replace(
    "[`reference-client-map.md`](../../fikashop-storefront-skills/docs/reference-client-map.md)",
    "[reference-client-map.md](reference-client-map.md)",
)

# Strip any leftover monorepo-relative mobile links
text = re.sub(r"\[`([^`]+)`\]\(\.\./\.\./fikashop-mobile/[^)]+\)", r"`\1`", text)
text = re.sub(r"\[([^\]]+)\]\(\.\./\.\./fikashop-mobile/[^)]+\)", r"\1", text)
text = re.sub(r"\[`([^`]+)`\]\(\.\./\.\./fikashop-mobile\)", r"\1", text)

# Block private monorepo GitHub URLs if they appear in source
text = re.sub(r"https://github\.com/fikachu/fikashop[^\s)>\"]*", "", text)
text = re.sub(r"https://github\.com/pgiki/fikashop[^\s)>\"]*", "", text)

header = (
    f"<!-- synced from fikashop-api/docs/storefront-integration.md @ {commit} "
    f"— run scripts/sync-integration-doc.sh to refresh -->\n\n"
)
if text.startswith("<!-- synced"):
    text = re.sub(r"^<!-- synced.*?-->\n\n", header, text, count=1)
else:
    text = header + text

path.write_text(text)

forbidden = [
    "github.com/fikachu/fikashop",
    "github.com/pgiki/fikashop",
    "../../fikashop-mobile",
    "fikashop-mobile/tree",
]
for needle in forbidden:
    if needle in path.read_text():
        print(f"Sync produced forbidden reference: {needle}", file=sys.stderr)
        sys.exit(1)

print(f"Synced {path} @ {commit}")
PY
