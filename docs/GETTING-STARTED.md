# Getting started

Prerequisites and first successful API call for a **single-partner** fikashop storefront.

## What FikaChu provisions

| Item | Example | You send as |
| ---- | ------- | ----------- |
| Partner store | Demo Kitchen | `X-Partner-Id: 1` or `demo-kitchen` |
| API host | `https://api.fikashop.app` | `API_BASE` |
| Identity provider | `https://oidc.fikachu.com` | `OIDC_ISS` |
| OIDC client | Your app registration | `OIDC_CLIENT_ID` + redirect URI |

You do **not** onboard partners via the storefront API. See [contracts/OUT-OF-SCOPE.md](../contracts/OUT-OF-SCOPE.md).

## Environment variables

| Variable | Example | Purpose |
| -------- | ------- | ------- |
| `API_BASE` | `https://api.fikashop.app` | Shop + payments host |
| `OIDC_ISS` | `https://oidc.fikachu.com` | Authorize, token, userinfo |
| `OIDC_CLIENT_ID` | `your-client-id` | OAuth2 public client (PKCE) |
| `OIDC_REDIRECT_URI` | `https://your-store.com/auth` | Must match IdP registration |
| `PARTNER_ID` | `1` | `X-Partner-Id` on every shop call |
| `DEFAULT_COUNTRY_CODE` | `TZ` | Fallback ISO-2 for addresses |

**Expo / React Native:** prefix public vars with `EXPO_PUBLIC_` (e.g. `EXPO_PUBLIC_API_BASE_URL`).

## Session-Id (required for cart)

Format: `SID:{ANON|AUTH}:{api_hostname}:{uuid}`

1. Generate UUID v4 on first visit.
2. Persist in `localStorage` (web) or `AsyncStorage` (React Native).
3. On login: keep the **same UUID**, change `ANON` → `AUTH`, call `GET /shop/api/start-session/`.
4. On logout: clear tokens and create a **new** anon session.

See [docs/examples/client-setup.ts](examples/client-setup.ts).

## OIDC setup

1. Register a **public** OAuth2 client at the FikaChu IdP with your redirect URI.
2. Use **Authorization Code + PKCE** (`S256`).
3. Scopes: `openid profile email phone offline_access` (for refresh tokens).
4. See [docs/examples/oidc-pkce-flow.md](examples/oidc-pkce-flow.md).

## First API call

Verify partner scope and catalog:

```bash
export API_BASE="https://api.fikashop.app"
export PARTNER_ID="1"
export SESSION_ID="SID:ANON:api.fikashop.app:$(uuidgen | tr '[:upper:]' '[:lower:]')"

curl -sS "${API_BASE}/shop/api/partners/${PARTNER_ID}/categories/" \
  -H "X-Partner-Id: ${PARTNER_ID}" \
  -H "Session-Id: ${SESSION_ID}" \
  -H "Accept: application/json" | head -c 500
```

Or run the [curl examples](examples/curl/README.md) — start with [smoke-test.sh](examples/curl/smoke-test.sh). Optional curated shelves: [list-ranges.sh](examples/curl/list-ranges.sh).

## API reference tools

| Tool | URL |
| ---- | --- |
| OpenAPI (schemas) | `{API_BASE}/docs/` |

## Next steps

| Step | Doc |
| ---- | --- |
| Full journey | [storefront-integration.md](storefront-integration.md) |
| Agent fast path | [contracts/INTEGRATION.md](../contracts/INTEGRATION.md) |
| QA checklist | [contracts/CHECKLIST.md](../contracts/CHECKLIST.md) |
| Reference client map | [reference-client-map.md](reference-client-map.md) |

## Framework notes

| Stack | Session-Id storage | Notes |
| ----- | ------------------ | ----- |
| SPA (Vite/CRA) | `localStorage` | Single origin; handle 401 refresh |
| Next.js | Cookie or `localStorage` on client components | Do not generate new UUID per SSR request |
| Expo / RN | `AsyncStorage` | See [client-setup.ts](examples/client-setup.ts) for headers and session persistence |
